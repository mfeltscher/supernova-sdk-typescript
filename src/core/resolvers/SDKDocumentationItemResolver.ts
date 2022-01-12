//
//  SDKDocumentationItemResolver.ts
//  Supernova SDK 
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationCustomBlock } from "../../model/documentation/custom_blocks/SDKDocumentationCustomBlock"
import { DocumentationConfiguration } from "../../model/documentation/SDKDocumentationConfiguration"
import { DocumentationGroupModel, DocumentationGroup } from "../../model/documentation/SDKDocumentationGroup"
import { DocumentationItemModel, DocumentationItem } from "../../model/documentation/SDKDocumentationItem"
import { DocumentationPageModel, DocumentationPage } from "../../model/documentation/SDKDocumentationPage"
import { DocumentationPageBlock } from "../../model/documentation/SDKDocumentationPageBlock"
import { DocumentationItemType } from "../../model/enums/SDKDocumentationItemType"
import { DocumentationPageBlockType } from "../../model/enums/SDKDocumentationPageBlockType"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class DocumentationItemResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  hashedItems = new Map<string, DocumentationItemModel>()
  resolvedItems = new Map<string, DocumentationItem>()
  customBlocks: Array<DocumentationCustomBlock>
  configuration: DocumentationConfiguration

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(customBlocks: Array<DocumentationCustomBlock>, configuration: DocumentationConfiguration) {
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
    return items
  }

  async resolveItemsForGroup(group: DocumentationGroup) {
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

  resolveBlockChains(page: DocumentationPage) {
    // Resolve initial block group
    this.resolveBlockGroup(page.blocks)
  }

  resolveBlockGroup(blocks: Array<DocumentationPageBlock>) {
    // Ignore empty groups
    if (blocks.length === 0) {
      return
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
}
