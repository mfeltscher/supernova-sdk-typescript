//
//  SDKToolsMarkdownTransformBlock.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

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
import { DocumentationPageBlock } from '../../model/documentation/SDKDocumentationPageBlock'
import { DocumentationRichText } from '../../model/documentation/SDKDocumentationRichText'
import { DocumentationHeadingType } from '../../model/enums/SDKDocumentationHeadingType'
import { DocumentationPageBlockType } from '../../model/enums/SDKDocumentationPageBlockType'
import { RichTextSpanAttributeType } from '../../model/enums/SDKRichTextSpanAttributeType'
import { MarkdownTransformType } from './SDKToolsMarkdownTransform'
import { MarkdownTransformText } from './SDKToolsMarkdownTransformText'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Search Instance

/** Markdown block transformer */
export class MarkdownTransformBlock {

  // -- Properties

  private transformType: MarkdownTransformType
  private textTransformer: MarkdownTransformText

  // --- Conversion
  constructor(type: MarkdownTransformType) {
    this.transformType = type
    if (type === MarkdownTransformType.github) {
        console.log("Note: GitHub mode of markdown is currently in development and is not yet fully supported")
    }
    this.textTransformer = new MarkdownTransformText(this.transformType)
  }

  // --- Conversion

  /** Converts a single block - depending on the type - to a markdown definition */
  convertBlockToMarkdown(block: DocumentationPageBlock): string | null {

    switch (block.type) {
      case DocumentationPageBlockType.callout: return this.convertCalloutBlock(block as DocumentationPageBlockCallout)
      case DocumentationPageBlockType.code: return this.convertCodeBlock(block as DocumentationPageBlockCode)
      case DocumentationPageBlockType.column: return this.convertColumnBlock(block as DocumentationPageBlockColumn)
      case DocumentationPageBlockType.columnItem: return this.convertColumnItemBlock(block as DocumentationPageBlockColumnItem)
      case DocumentationPageBlockType.componentAssets: return this.convertComponentAssetBlock(block as DocumentationPageBlockAssets)
      case DocumentationPageBlockType.custom: return this.convertCustomBlock(block as DocumentationPageBlockCustom)
      case DocumentationPageBlockType.divider: return this.convertDividerBlock(block as DocumentationPageBlockDivider)
      case DocumentationPageBlockType.figmaEmbed: return this.convertFigmaEmbedBlock(block as DocumentationPageBlockEmbedFigma)
      case DocumentationPageBlockType.figmaFrames: return this.convertFigmaFramesBlock(block as DocumentationPageBlockFrames)
      case DocumentationPageBlockType.genericEmbed: return this.convertGenericEmbedBlock(block as DocumentationPageBlockEmbedGeneric)
      case DocumentationPageBlockType.heading: return this.convertHeadingBlock(block as DocumentationPageBlockHeading)
      case DocumentationPageBlockType.image: return this.convertImageBlock(block as DocumentationPageBlockImage)
      case DocumentationPageBlockType.link: return this.convertLinkBlock(block as DocumentationPageBlockEmbedLink)
      case DocumentationPageBlockType.orderedList: return this.convertOrderedListBlock(block as DocumentationPageOrderedList)
      case DocumentationPageBlockType.quote: return this.convertQuoteBlock(block as DocumentationPageBlockQuote)
      case DocumentationPageBlockType.renderCode: return this.convertLiveCodeBlock(block as DocumentationPageBlockRenderCode)
      case DocumentationPageBlockType.shortcuts: return this.convertShortcutsBlock(block as DocumentationPageBlockShortcuts)
      case DocumentationPageBlockType.storybookEmbed: return this.convertStorybookEmbedBlock(block as DocumentationPageBlockEmbedStorybook)
      case DocumentationPageBlockType.tabItem: return this.convertTabItemBlock(block as DocumentationPageBlockTabItem)
      case DocumentationPageBlockType.table: return this.convertTableBlock(block as DocumentationPageBlockTable)
      case DocumentationPageBlockType.tableCell: return this.convertTableCellBlock(block as DocumentationPageBlockTableCell)
      case DocumentationPageBlockType.tableRow: return this.convertTableRowBlock(block as DocumentationPageBlockTableRow)
      case DocumentationPageBlockType.tabs: return this.convertTabsBlock(block as DocumentationPageBlockTab)
      case DocumentationPageBlockType.text: return this.convertTextBlock(block as DocumentationPageBlockText)
      case DocumentationPageBlockType.token: return this.converTokenBlock(block as DocumentationPageBlockToken)
      case DocumentationPageBlockType.tokenGroup: return this.convertTokenGroupBlock(block as DocumentationPageBlockTokenGroup)
      case DocumentationPageBlockType.tokenList: return this.convertTokenListBlock(block as DocumentationPageBlockTokenList)
      case DocumentationPageBlockType.unorderedList: return this.convertUnorderedListBlock(block as DocumentationPageUnorderedList)
      case DocumentationPageBlockType.youtubeEmbed: return this.convertYoutubeEmbedBlock(block as DocumentationPageBlockEmbedYoutube)
    }
  }

  convertCalloutBlock(block: DocumentationPageBlockCallout): string | null {

    // TODO: Block conversion
    return null
  }

  convertCodeBlock(block: DocumentationPageBlockCode): string | null {

    // TODO: Block conversion
    return null
  }

  convertColumnBlock(block: DocumentationPageBlockColumn): string | null {

    // TODO: Block conversion
    return null
  }

  convertColumnItemBlock(block: DocumentationPageBlockColumnItem): string | null {

    // TODO: Block conversion
    return null
  }

  convertComponentAssetBlock(block: DocumentationPageBlockAssets): string | null {

    // TODO: Block conversion
    return null
  }

  convertCustomBlock(block: DocumentationPageBlockCustom): string | null {

    // TODO: Block conversion
    return null
  }

  convertDividerBlock(block: DocumentationPageBlockDivider): string | null {

    // TODO: Block conversion
    return null
  }

  convertFigmaEmbedBlock(block: DocumentationPageBlockEmbedFigma): string | null {

    // TODO: Block conversion
    return null
  }

  convertFigmaFramesBlock(block: DocumentationPageBlockFrames): string | null {

    // TODO: Block conversion
    return null
  }

  convertGenericEmbedBlock(block: DocumentationPageBlockEmbedGeneric): string | null {

    // TODO: Block conversion
    return null
  }

  convertHeadingBlock(block: DocumentationPageBlockHeading): string | null {

    // TODO: Block conversion
    return null
  }

  convertImageBlock(block: DocumentationPageBlockImage): string | null {

    // TODO: Block conversion
    return null
  }

  convertLinkBlock(block: DocumentationPageBlockEmbedLink): string | null {

    // TODO: Block conversion
    return null
  }

  convertOrderedListBlock(block: DocumentationPageOrderedList): string | null {

    // TODO: Block conversion
    return null
  }

  convertQuoteBlock(block: DocumentationPageBlockQuote): string | null {

    // TODO: Block conversion
    return null
  }

  convertLiveCodeBlock(block: DocumentationPageBlockRenderCode): string | null {

    // TODO: Block conversion
    return null
  }

  convertShortcutsBlock(block: DocumentationPageBlockShortcuts): string | null {

    // TODO: Block conversion
    return null
  }

  convertStorybookEmbedBlock(block: DocumentationPageBlockEmbedStorybook): string | null {

    // TODO: Block conversion
    return null
  }

  convertTabItemBlock(block: DocumentationPageBlockTabItem): string | null {

    // TODO: Block conversion
    return null
  }

  convertTableBlock(block: DocumentationPageBlockTable): string | null {

    // TODO: Block conversion
    return null
  }

  convertTableCellBlock(block: DocumentationPageBlockTableCell): string | null {

    // TODO: Block conversion
    return null
  }

  convertTableRowBlock(block: DocumentationPageBlockTableRow): string | null {

    // TODO: Block conversion
    return null
  }

  convertTabsBlock(block: DocumentationPageBlockTab): string | null {

    // TODO: Block conversion
    return null
  }

  convertTextBlock(block: DocumentationPageBlockText): string | null {

    // TODO: Block conversion
    return null
  }

  converTokenBlock(block: DocumentationPageBlockToken): string | null {

    // TODO: Block conversion
    return null
  }

  convertTokenListBlock(block: DocumentationPageBlockTokenList): string | null {

    // TODO: Block conversion
    return null
  }

  convertTokenGroupBlock(block: DocumentationPageBlockTokenGroup): string | null {

    // TODO: Block conversion
    return null
  }

  convertUnorderedListBlock(block: DocumentationPageUnorderedList): string | null {

    // TODO: Block conversion
    return null
  }

  convertYoutubeEmbedBlock(block: DocumentationPageBlockEmbedYoutube): string | null {

    // TODO: Block conversion
    return null
  }
}
