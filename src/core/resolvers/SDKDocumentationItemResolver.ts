//
//  SDKDocumentationItemResolver.ts
//  Supernova SDK 
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ExporterCustomBlock } from "../../model/exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../../model/documentation/SDKDocumentationConfiguration"
import { DocumentationGroupModel, DocumentationGroup } from "../../model/documentation/SDKDocumentationGroup"
import { DocumentationItemModel, DocumentationItem } from "../../model/documentation/SDKDocumentationItem"
import { DocumentationPageModel, DocumentationPage } from "../../model/documentation/SDKDocumentationPage"
import { DocumentationPageBlock } from "../../model/documentation/SDKDocumentationPageBlock"
import { DocumentationItemType } from "../../model/enums/SDKDocumentationItemType"
import { DocumentationPageBlockType } from "../../model/enums/SDKDocumentationPageBlockType"
import { Workspace } from "../SDKWorkspace"
import { DesignSystem, DesignSystemRemoteModel } from "../SDKDesignSystem"
import { DesignSystemVersion } from "../SDKDesignSystemVersion"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class DocumentationItemResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  hashedItems = new Map<string, DocumentationItemModel>()
  resolvedItems = new Map<string, DocumentationItem>()
  customBlocks: Array<ExporterCustomBlock>
  configuration: DocumentationConfiguration

  workspace: Workspace
  designSystem: DesignSystemRemoteModel

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    this.customBlocks = customBlocks
    this.configuration = configuration
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Resolution

  async resolveItemData(
    pageDetails: Array<DocumentationPageModel>,
    groupDetails: Array<DocumentationGroupModel>,
  ): Promise<Array<DocumentationItem>> {
    // Hash groups for faster lookup + find root group. Also fix the missing type attribute
    let rootGroupModel: DocumentationGroupModel
    for (let item of groupDetails) {
      item.type = DocumentationItemType.group
      this.hashedItems.set(item.persistentId, item)
      if ((item as DocumentationGroupModel).isRoot) {
        rootGroupModel = item
      }
    }

    if (!rootGroupModel) {
      throw new Error(`Incosistent model detected, missing root group`)
    }

    // Hash pages for faster lookup. Also fix the missing type attribute
    for (let page of pageDetails) {
      page.type = DocumentationItemType.page
      this.hashedItems.set(page.persistentId, page)
    }

    // Create structured chain of objects
    let rootGroup = new DocumentationGroup(rootGroupModel)
    await this.resolveItemsForGroup(rootGroup)

    // Retrieve created objects
    let items = Array.from(this.resolvedItems.values())

    // Compute slugs
    for (const item of items) {
      if (item instanceof DocumentationPage) {
        const pathFragment = this.pageUrl(item)
        item.setFullPath(pathFragment)
      } else if (item instanceof DocumentationGroup) {
        const pathFragment = this.pageUrl(item)
        item.setFirstPageFullPath(pathFragment)
      }
    }

    return items
  }

  private async resolveItemsForGroup(group: DocumentationGroup) {
    // Store items
    this.resolvedItems.set(group.id, group)

    // Resolve children of one group
    for (let childId of group.childrenIds) {
      // Find model from the loaded items
      let childModel = this.hashedItems.get(childId)
      if (!childModel) {
        throw new Error(`Inconsistent group / page model detected in one of the documentation items, missing ${childId}`)
      }

      if (childModel.type === DocumentationItemType.group) {
        // If it is a group, then create a group
        let subgroup = new DocumentationGroup(childModel as DocumentationGroupModel)
        subgroup.parent = group
        group.addChild(subgroup)
        await this.resolveItemsForGroup(subgroup)
      } else {
        // Otherwise, create a page using the data we obtained from the content call
        let pageId = childModel.persistentId
        let pageModel = this.hashedItems.get(pageId) as DocumentationPageModel
        let page = new DocumentationPage(pageModel, this.customBlocks, this.configuration)

        // Resolve block chains
        this.resolveBlockChains(page)

        // Link parents properly
        page.parent = group
        page.type = DocumentationItemType.page
        group.addChild(page)
        // Store items
        this.resolvedItems.set(page.id, page)
      }
    }
  }

  private resolveBlockChains(page: DocumentationPage) {
    // Resolve initial block group
    this.resolveBlockGroup(page.blocks)
  }

  private resolveBlockGroup(blocks: Array<DocumentationPageBlock>) {
  
    // Ignore empty groups
    if (blocks.length === 0) {
      return
    }
    if (blocks.length === 1 && blocks[0] === undefined) {
      // Note in some really rare cases, blocks[0] can be undefined. We should not be resolving undefined groups, rather ignoring it. This bug points to issue somewhere else however.
      throw new Error("The fuck?")
    }

    let blockType: DocumentationPageBlockType = null
    let previousBlock: DocumentationPageBlock = null
    for (let block of blocks) {
      // For previous block, check if it ended
      if (previousBlock) {
        previousBlock.endsTypeChain = previousBlock.type !== block.type
      }

      // If previous block is of different type (or initial), it beings type chain, otherwise it follows previous one
      block.beginsTypeChain = block.type !== blockType
      blockType = block.type
      previousBlock = block

      // Also solve for all subblocks who can form independent chains
      this.resolveBlockGroup(block.children)
    }

    // Final block always ends chain
    previousBlock.endsTypeChain = true
  }

  /** Create page URL or group URL pointing to the first contained page */
  private pageUrl(object: DocumentationPage | DocumentationGroup): string | undefined {
  
    let page: DocumentationPage | null = null
    if (object.type === "Page") {
      page = object as DocumentationPage
    } else {
      page = this.firstPageFromTop(object as DocumentationGroup)
    }
  
    if (!page) {
      return ""
    }
  
    let pageSlug = page.userSlug ?? page.slug
    let subpaths: Array<string> = []
  
    // Construct group path segments
    let parent: DocumentationGroup | null = page.parent
    while (parent) {
      subpaths.push(this.slugify(parent.title))
      parent = parent.parent
    }
  
    // Remove last segment added, because we don't care about root group
    subpaths.pop()
  
    // Retrieve url-safe path constructed as [host][group-slugs][path-slug][.html]
    let path = [...subpaths.reverse(), pageSlug].join("/") + ".html"
    return path
  }


  /** Find first showable page from the top of the provided root */
  private firstPageFromTop(documentationRoot: DocumentationGroup): DocumentationPage | null {
    for (let child of documentationRoot.children) {
      if (child.type === "Page") {
        return child as DocumentationPage
      } else {
        let possiblePage = this.firstPageFromTop(child as DocumentationGroup)
        if (possiblePage) {
          return possiblePage
        }
      }
    }
    return null
  }

  /** Slugify text to be usable as URL */
  private slugify(str: string): string {

    if (!str) {
      return ""
    }
    
    // Thanks to https://gist.github.com/codeguy/6684588
    str = str.replace(/^\s+|\s+$/g, "")
    str = str.toLowerCase()

    // remove accents, swap ñ for n, etc
    var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;"
    var to = "aaaaaeeeeiiiioooouuuunc------"

    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i))
    }

    str = str
      .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
      .replace(/\s+/g, "-") // collapse whitespace and replace by -
      .replace(/-+/g, "-") // collapse dashes

    return str
  }
}
