//
//  SDKToolsMarkdownTransformBlock.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { DocumentationPageBlockAsset } from '../../model/documentation/blocks/SDKDocumentationPageBlockAsset'
import { DocumentationPageBlockAssets } from '../../model/documentation/blocks/SDKDocumentationPageBlockAssets'
import { DocumentationPageBlockCallout } from '../../model/documentation/blocks/SDKDocumentationPageBlockCallout'
import { DocumentationPageBlockCode } from '../../model/documentation/blocks/SDKDocumentationPageBlockCode'
import { DocumentationPageBlockColumn } from '../../model/documentation/blocks/SDKDocumentationPageBlockColumn'
import { DocumentationPageBlockColumnItem } from '../../model/documentation/blocks/SDKDocumentationPageBlockColumnItem'
import { DocumentationPageBlockCustom } from '../../model/documentation/blocks/SDKDocumentationPageBlockCustom'
import { DocumentationPageBlockDivider } from '../../model/documentation/blocks/SDKDocumentationPageBlockDivider'
import { DocumentationPageBlockEmbedFigma } from '../../model/documentation/blocks/SDKDocumentationPageBlockEmbedFigma'
import { DocumentationPageBlockEmbedGeneric } from '../../model/documentation/blocks/SDKDocumentationPageBlockEmbedGeneric'
import { DocumentationPageBlockEmbedLink } from '../../model/documentation/blocks/SDKDocumentationPageBlockEmbedLink'
import { DocumentationPageBlockEmbedStorybook } from '../../model/documentation/blocks/SDKDocumentationPageBlockEmbedStorybook'
import { DocumentationPageBlockEmbedYoutube } from '../../model/documentation/blocks/SDKDocumentationPageBlockEmbedYoutube'
import { DocumentationPageBlockFrame } from '../../model/documentation/blocks/SDKDocumentationPageBlockFrame'
import { DocumentationPageBlockFrames } from '../../model/documentation/blocks/SDKDocumentationPageBlockFrames'
import { DocumentationPageBlockHeading } from '../../model/documentation/blocks/SDKDocumentationPageBlockHeading'
import { DocumentationPageBlockImage } from '../../model/documentation/blocks/SDKDocumentationPageBlockImage'
import { DocumentationPageOrderedList } from '../../model/documentation/blocks/SDKDocumentationPageBlockOrderedList'
import { DocumentationPageBlockQuote } from '../../model/documentation/blocks/SDKDocumentationPageBlockQuote'
import { DocumentationPageBlockRenderCode } from '../../model/documentation/blocks/SDKDocumentationPageBlockRenderCode'
import { DocumentationPageBlockShortcut } from '../../model/documentation/blocks/SDKDocumentationPageBlockShortcut'
import { DocumentationPageBlockShortcuts } from '../../model/documentation/blocks/SDKDocumentationPageBlockShortcuts'
import { DocumentationPageBlockTab } from '../../model/documentation/blocks/SDKDocumentationPageBlockTab'
import { DocumentationPageBlockTabItem } from '../../model/documentation/blocks/SDKDocumentationPageBlockTabItem'
import { DocumentationPageBlockTable } from '../../model/documentation/blocks/SDKDocumentationPageBlockTable'
import { DocumentationPageBlockTableCell } from '../../model/documentation/blocks/SDKDocumentationPageBlockTableCell'
import { DocumentationPageBlockTableColumn } from '../../model/documentation/blocks/SDKDocumentationPageBlockTableColumn'
import { DocumentationPageBlockTableRow } from '../../model/documentation/blocks/SDKDocumentationPageBlockTableRow'
import { DocumentationPageBlockText } from '../../model/documentation/blocks/SDKDocumentationPageBlockText'
import { DocumentationPageBlockToken } from '../../model/documentation/blocks/SDKDocumentationPageBlockToken'
import { DocumentationPageBlockTokenGroup } from '../../model/documentation/blocks/SDKDocumentationPageBlockTokenGroup'
import { DocumentationPageBlockTokenList } from '../../model/documentation/blocks/SDKDocumentationPageBlockTokenList'
import { DocumentationPageUnorderedList } from '../../model/documentation/blocks/SDKDocumentationPageBlockUnorderedList'
import { DocumentationPage } from '../../model/documentation/SDKDocumentationPage'
import { DocumentationPageBlock } from '../../model/documentation/SDKDocumentationPageBlock'
import { DocumentationRichText } from '../../model/documentation/SDKDocumentationRichText'
import { DocumentationCalloutType } from '../../model/enums/SDKDocumentationCalloutType'
import { DocumentationHeadingType } from '../../model/enums/SDKDocumentationHeadingType'
import { DocumentationPageBlockType } from '../../model/enums/SDKDocumentationPageBlockType'
import { RichTextSpanAttributeType } from '../../model/enums/SDKRichTextSpanAttributeType'
import { TokenGroup } from '../../model/groups/SDKTokenGroup'
import { MarkdownTransformType } from './SDKToolsMarkdownTransform'
import { MarkdownTransformUtil } from './SDKToolsMarkdownTransformUtil'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Search Instance

/** Markdown block transformer */
export class MarkdownTransformBlock {
  // -- Properties

  private transformType: MarkdownTransformType
  private utilTransformer: MarkdownTransformUtil
  private version: DesignSystemVersion
  newlineSeparator: string = '  \n'

  // --- Conversion
  constructor(type: MarkdownTransformType, version: DesignSystemVersion) {
    this.transformType = type
    this.version = version
    if (type === MarkdownTransformType.github) {
      console.log('Note: GitHub mode of markdown is currently in development and is not yet fully supported')
    }
    this.utilTransformer = new MarkdownTransformUtil(this.transformType, version)
  }

  // --- Conversion

  /** Converts a single block - depending on the type - to a markdown definition of specific type */
  async convertBlockToMarkdown(block: DocumentationPageBlock, pageContext: DocumentationPage): Promise<string | null> {
    switch (block.type) {
      // Following blocks are automatically transformed
      case DocumentationPageBlockType.callout:
        return this.convertCalloutBlock(block as DocumentationPageBlockCallout)
      case DocumentationPageBlockType.code:
        return this.convertCodeBlock(block as DocumentationPageBlockCode)
      case DocumentationPageBlockType.componentAssets:
        return await this.convertComponentAssetBlock(block as DocumentationPageBlockAssets)
      case DocumentationPageBlockType.custom:
        return this.convertCustomBlock(block as DocumentationPageBlockCustom)
      case DocumentationPageBlockType.divider:
        return this.convertDividerBlock(block as DocumentationPageBlockDivider)
      case DocumentationPageBlockType.figmaEmbed:
        return this.convertFigmaEmbedBlock(block as DocumentationPageBlockEmbedFigma)
      case DocumentationPageBlockType.figmaFrames:
        return this.convertFigmaFramesBlock(block as DocumentationPageBlockFrames)
      case DocumentationPageBlockType.genericEmbed:
        return this.convertGenericEmbedBlock(block as DocumentationPageBlockEmbedGeneric)
      case DocumentationPageBlockType.heading:
        return this.convertHeadingBlock(block as DocumentationPageBlockHeading)
      case DocumentationPageBlockType.image:
        return this.convertImageBlock(block as DocumentationPageBlockImage)
      case DocumentationPageBlockType.link:
        return this.convertLinkBlock(block as DocumentationPageBlockEmbedLink)
      case DocumentationPageBlockType.orderedList:
        return this.convertOrderedListBlock(block as DocumentationPageOrderedList)
      case DocumentationPageBlockType.quote:
        return this.convertQuoteBlock(block as DocumentationPageBlockQuote)
      case DocumentationPageBlockType.renderCode:
        return this.convertLiveCodeBlock(block as DocumentationPageBlockRenderCode)
      case DocumentationPageBlockType.shortcuts:
        return this.convertShortcutsBlock(block as DocumentationPageBlockShortcuts, pageContext)
      case DocumentationPageBlockType.storybookEmbed:
        return this.convertStorybookEmbedBlock(block as DocumentationPageBlockEmbedStorybook)
      case DocumentationPageBlockType.text:
        return this.convertTextBlock(block as DocumentationPageBlockText)
      case DocumentationPageBlockType.token:
        return await this.convertTokenBlock(block as DocumentationPageBlockToken)
      case DocumentationPageBlockType.tokenGroup:
        return this.convertTokenGroupBlock(block as DocumentationPageBlockTokenGroup)
      case DocumentationPageBlockType.tokenList:
        return this.convertTokenListBlock(block as DocumentationPageBlockTokenList)
      case DocumentationPageBlockType.unorderedList:
        return this.convertUnorderedListBlock(block as DocumentationPageUnorderedList)
      case DocumentationPageBlockType.youtubeEmbed:
        return this.convertYoutubeEmbedBlock(block as DocumentationPageBlockEmbedYoutube)

      // Following blocks are special because their transformation is invoked manually (containers)
      case DocumentationPageBlockType.column:
        return await this.convertColumnBlock(block as DocumentationPageBlockColumn, pageContext)
      case DocumentationPageBlockType.table:
        return await this.convertTableBlock(block as DocumentationPageBlockTable, pageContext)
      case DocumentationPageBlockType.tabs:
        return await this.convertTabsBlock(block as DocumentationPageBlockTab, pageContext)

      // Following blocks are special because their transformation is invoked manually (contained items)
      case DocumentationPageBlockType.tabItem:
        return await this.convertTabItemBlock(block as DocumentationPageBlockTabItem, pageContext)
      case DocumentationPageBlockType.columnItem:
        return await this.convertColumnItemBlock(block as DocumentationPageBlockColumnItem, pageContext)
      case DocumentationPageBlockType.tableCell:
        return await this.convertTableCellBlock(block as DocumentationPageBlockTableCell, pageContext)
      case DocumentationPageBlockType.tableRow:
        return await this.convertTableRowBlock(block as DocumentationPageBlockTableRow)
    }
  }

  // -- Plain blocks

  convertHeadingBlock(block: DocumentationPageBlockHeading): string | null {
    let heading = block as DocumentationPageBlockHeading
    let text = this.utilTransformer.convertTextBlockToMarkdown(heading)
    switch (heading.headingType) {
      case DocumentationHeadingType.h1:
        return `# ${text}`
      case DocumentationHeadingType.h2:
        return `## ${text}`
      case DocumentationHeadingType.h3:
        return `### ${text}`
    }
  }

  convertCalloutBlock(block: DocumentationPageBlockCallout): string | null {
    let text = this.utilTransformer.convertTextBlockToMarkdown(block)
    let calloutType: string
    switch (block.calloutType) {
      case DocumentationCalloutType.info:
        calloutType = 'Some extra info:'
        break
      case DocumentationCalloutType.warning:
        calloutType = 'Be warned:'
        break
      case DocumentationCalloutType.success:
        calloutType = 'Yay:'
        break
      case DocumentationCalloutType.error:
        calloutType = 'Please note:'
        break
    }
    return `> ${calloutType}${this.newlineSeparator}> ${text}`
  }

  convertQuoteBlock(block: DocumentationPageBlockQuote): string | null {
    let text = this.utilTransformer.convertTextBlockToMarkdown(block)
    return `> ${text}`
  }

  convertDividerBlock(block: DocumentationPageBlockDivider): string | null {
    return '---'
  }

  convertImageBlock(block: DocumentationPageBlockImage): string | null {
    if (block.url) {
      return `![Img](${block.url})`
    }
  }

  convertOrderedListBlock(block: DocumentationPageOrderedList): string | null {
    let text = this.utilTransformer.convertTextBlockToMarkdown(block)
    return `1. ` + text
  }

  convertUnorderedListBlock(block: DocumentationPageUnorderedList): string | null {
    let text = this.utilTransformer.convertTextBlockToMarkdown(block)
    return `- ` + text
  }

  convertLiveCodeBlock(block: DocumentationPageBlockRenderCode): string | null {
    const codeLanguageDefinition = 'javascript'
    return `\`\`\`${codeLanguageDefinition}${this.newlineSeparator}${block.code}${this.newlineSeparator}\`\`\``
  }

  convertCodeBlock(block: DocumentationPageBlockCode): string | null {
    const codeLanguageDefinition = block.codeLanguage ? block.codeLanguage.toLowerCase() : ''
    return `\`\`\`${codeLanguageDefinition}${this.newlineSeparator}${block.text.asPlainText()}${
      this.newlineSeparator
    }\`\`\``
  }

  convertTextBlock(block: DocumentationPageBlockText): string | null {
    return this.utilTransformer.convertTextBlockToMarkdown(block)
  }

  convertGenericEmbedBlock(block: DocumentationPageBlockEmbedGeneric): string | null {
    return this.convertURLBlock(block, 'Open link', true)
  }

  convertStorybookEmbedBlock(block: DocumentationPageBlockEmbedStorybook): string | null {
    return this.convertURLBlock(block, 'Open Storybook Canvas', false)
  }

  convertLinkBlock(block: DocumentationPageBlockEmbedLink): string | null {
    return this.convertURLBlock(block, 'Open link', true)
  }

  convertYoutubeEmbedBlock(block: DocumentationPageBlockEmbedYoutube): string | null {
    return this.convertURLBlock(block, 'Open Youtube Video', false)
  }

  convertFigmaEmbedBlock(block: DocumentationPageBlockEmbedFigma): string | null {
    return this.convertURLBlock(block, 'Open Figma Prototype / File', false)
  }

  // -- Token blocks

  async convertTokenBlock(block: DocumentationPageBlockToken): Promise<string | null> {
    if (!block.tokenId) {
      return null
    }

    // Fetch token
    let tokens = await this.version.tokens()
    tokens = tokens.filter(t => t.id === block.tokenId || t.versionedId === block.tokenId)
    if (tokens.length === 0) {
      return null
    }

    // Convert token
    return `${this.newlineSeparator}${this.utilTransformer.convertTokenToMarkdown(tokens[0])}${this.newlineSeparator}`
  }

  async convertTokenListBlock(block: DocumentationPageBlockTokenList): Promise<string | null> {
    if (!block.tokenIds) {
      return null
    }

    // Fetch tokens
    let tokens = await this.version.tokens()
    tokens = tokens.filter(t => block.tokenIds.includes(t.id) || block.tokenIds.includes(t.versionedId))
    if (tokens.length === 0) {
      return null
    }

    // Convert token
    return `${this.newlineSeparator}${tokens
      .map(t => this.utilTransformer.convertTokenToMarkdown(t))
      .join(this.newlineSeparator)}${this.newlineSeparator}`
  }

  async convertTokenGroupBlock(block: DocumentationPageBlockTokenGroup): Promise<string | null> {
    if (!block.groupId) {
      return null
    }

    // Fetch tokens
    let tokens = await this.version.tokens()
    let groups = await this.version.tokenGroups()
    groups = groups.filter(g => g.id === block.groupId || g.versionedId === block.groupId)

    if (groups.length !== 1) {
      return null
    }

    // Show either single group or all nested groups
    let groupsToShow = [groups[0]]
    if (block.showNestedGroups) {
      groupsToShow = this.flattenedGroupsFromRoot(groups[0])
    }

    // Convert group and all its tokens
    let segments: Array<string> = []
    for (let group of groupsToShow) {
      let tokensToShow = tokens.filter(t => group.tokenIds.includes(t.id) || group.tokenIds.includes(t.versionedId))
      if (tokensToShow.length > 0) {
        let segment = `${this.newlineSeparator}${`**Token Group ${[...group.path, group.name].join(' / ')}**:  `}${
          this.newlineSeparator
        }${tokensToShow.map(t => this.utilTransformer.convertTokenToMarkdown(t)).join(this.newlineSeparator)}${
          this.newlineSeparator
        }`
        segments.push(segment)
      }
    }

    // Convert to single string
    return segments.join(this.newlineSeparator)
  }

  private flattenedGroupsFromRoot(root: TokenGroup): Array<TokenGroup> {
    let groups = [root]
    for (let group of root.subgroups) {
      groups.push(group)
      groups = groups.concat(this.flattenedGroupsFromRoot(group))
    }

    return groups
  }

  async convertComponentAssetBlock(block: DocumentationPageBlockAssets): Promise<string | null> {
    let assets = await this.version.assets()

    let convertedAssets: Array<string> = []
    for (let asset of block.assets) {
      let assetObject = assets.filter(a => a.id === asset.assetId)[0]
      if (assetObject && assetObject.thumbnailUrl) {
        convertedAssets.push(
          `![${assetObject.name}](${assetObject.thumbnailUrl})` +
            this.newlineSeparator +
            `${asset.title ? asset.title : assetObject.name}` +
            (asset.description ? `, ${asset.description}` + this.newlineSeparator : '')
        )
      }
    }

    return this.newlineSeparator + convertedAssets.join(this.newlineSeparator) + this.newlineSeparator
  }

  convertFigmaFramesBlock(block: DocumentationPageBlockFrames): string | null {

    let convertedFrames: Array<string> = []
    for (let frame of block.frames) {
      if (frame.previewUrl) {
        convertedFrames.push(
          `![${frame.title ?? "Image"}](${frame.previewUrl})` +
            this.newlineSeparator +
            `${frame.title ? frame.title : ""}` +
            (frame.description ? `, ${frame.description}` + this.newlineSeparator : '')
        )
      }
    }

    return this.newlineSeparator + convertedFrames.join(this.newlineSeparator) + this.newlineSeparator
  }

  async convertShortcutsBlock(block: DocumentationPageBlockShortcuts, pageContext: DocumentationPage): Promise<string | null> {

    let url: string = "#"
    let convertedShortcut: Array<string> = []
    let pages = await (await this.version.documentation()).pages()
    for (let shortcut of block.shortcuts) {
      if (shortcut.externalUrl) {
        url = shortcut.externalUrl
      } else if (shortcut.internalId) {
        let destinationPage = pages.filter(p => p.id === shortcut.internalId || p.persistentId === shortcut.internalId)[0]
        if (destinationPage) {
          url = this.relativePathToPage(destinationPage, pageContext)
        }
      }
      if (shortcut.previewUrl) {
        // Generate shortcut with image preview
        let previewUrl = shortcut.previewUrl
        let title = shortcut.title ?? undefined
        let description = shortcut.description ?? undefined
        convertedShortcut.push(
          `[![${title}](${previewUrl})](${url})` +
            this.newlineSeparator +
            `${title ? title : ""}` +
            (description ? `, ${description}` + this.newlineSeparator : this.newlineSeparator)
        )
      } else {
        // Generate shortcut without image preview
        let title = shortcut.title ?? undefined
        let description = shortcut.description ?? undefined
        convertedShortcut.push(
          `[${title}](${url})` +
            (description ? `, ${description}` + this.newlineSeparator : this.newlineSeparator)
        )
      }
    }

    return this.newlineSeparator + convertedShortcut.join(this.newlineSeparator) + this.newlineSeparator
  }

  private relativePathToPage(page: DocumentationPage, currentPage: DocumentationPage): string {

    // Compute level of depth
    let parent = currentPage.parent
    let depth = 0
    while (parent) {
      depth++
      parent = parent.parent
    }

    // Compute path
    let prefix = depth === 1 ? "./" : "../".repeat(depth - 1)
    let pageUrl = page.relativeDocsPageUrl()
    if (pageUrl.endsWith("html")) {
      pageUrl = pageUrl.substring(0, pageUrl.length - 4) + "md"
    }
    return prefix + pageUrl
  }

  // -- Containers: Table

  async convertTableBlock(block: DocumentationPageBlockTable, pageContext: DocumentationPage): Promise<string | null> {
    // No empty tables
    if (block.children.length === 0) {
      return null
    }

    // Generate header row
    let firstRow = block.children[0]
    let rowContent: Array<string> = []
    let separatorContent: Array<string> = []
    let count = 1
    for (let child of firstRow.children) {
      rowContent.push(`Column ${count}`)
      separatorContent.push(`---`)
      count++
    }

    let tableRows: Array<string> = ['| ' + rowContent.join(' | ') + ' |', '| ' + separatorContent.join(' | ') + ' |']
    for (let child of block.children) {
      if (child instanceof DocumentationPageBlockTableRow) {
        let childContent = await Promise.all(child.children.map(c => this.convertBlockToMarkdown(c, pageContext)))
        let rowDefinition = '| ' + childContent.join(' | ') + ' |'
        tableRows.push(rowDefinition)
      }
    }

    return this.newlineSeparator + tableRows.join(this.newlineSeparator) + this.newlineSeparator
  }

  convertTableRowBlock(block: DocumentationPageBlockTableRow): string | null {
    // Not used, rows are used when generating table directly in the table
    return null
  }

  async convertTableCellBlock(block: DocumentationPageBlockTableCell, pageContext: DocumentationPage): Promise<string | null> {
    let cellContent = await Promise.all(block.children.map(c => this.convertBlockToMarkdown(c, pageContext)))
    return cellContent.join('<br>') // Multiline cell needs non-regular line breaks
  }

  // -- Containers: Tabs

  async convertTabsBlock(block: DocumentationPageBlockTab, pageContext: DocumentationPage): Promise<string | null> {
    // No empty tabs
    if (block.children.length === 0) {
      return null
    }

    let tabContent: Array<string> = []
    for (let child of block.children) {
      if (child instanceof DocumentationPageBlockTabItem) {
        let result = await this.convertTabItemBlock(child, pageContext)
        tabContent.push(result)
      }
    }

    return tabContent.join(this.newlineSeparator) + this.newlineSeparator
  }

  async convertTabItemBlock(block: DocumentationPageBlockTabItem, pageContext: DocumentationPage): Promise<string | null> {
    let childContent = await Promise.all(block.children.map(c => this.convertBlockToMarkdown(c, pageContext)))
    let tabDefinition =
      this.newlineSeparator + `**${block.caption}**` + this.newlineSeparator + childContent.join(this.newlineSeparator)
    return tabDefinition
  }

  // -- Containers: Columns

  async convertColumnBlock(block: DocumentationPageBlockColumn, pageContext: DocumentationPage): Promise<string | null> {
    // No empty columns
    if (block.children.length === 0) {
      return null
    }

    let columnContent: Array<string> = []
    for (let child of block.children) {
      if (child instanceof DocumentationPageBlockColumnItem) {
        let result = await this.convertColumnItemBlock(child, pageContext)
        columnContent.push(result)
      }
    }

    return columnContent.join(this.newlineSeparator) + this.newlineSeparator
  }

  async convertColumnItemBlock(block: DocumentationPageBlockColumnItem, pageContext: DocumentationPage): Promise<string | null> {
    let childContent = await Promise.all(block.children.map(c => this.convertBlockToMarkdown(c, pageContext)))
    let tabDefinition = this.newlineSeparator + childContent.join(this.newlineSeparator)
    return tabDefinition
  }

  // -- Unsupported

  convertCustomBlock(block: DocumentationPageBlockCustom): string | null {
    // Custom blocks will not be transformed for now, as we can't realistically
    // know what they are supposed to do and right now we also can't invoke them
    return null
    // TODO: Custom component blocks should still be converted, probably
  }

  // -- Conveniences

  convertURLBlock(block: DocumentationPageBlockEmbedGeneric, userAction: string, showLink: boolean): string | null {
    // Will generate:
    // [Action prompt, ie. "Open Figma File"](url)
    // ^ caption_if_provided
    if (block.url) {
      const caption = block.caption ? `^ ${block.caption}${this.newlineSeparator}` : ''
      return `${this.newlineSeparator}[${userAction}](${block.url})${this.newlineSeparator}${caption}`
    }
    return null
  }
}
