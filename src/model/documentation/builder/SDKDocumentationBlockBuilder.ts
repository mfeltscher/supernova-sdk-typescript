//
//  DocumentationPageBlock.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationPageBlockType } from "../../enums/SDKDocumentationPageBlockType"
import { DocumentationPageBlockAssets, DocumentationPageBlockAssetsModel } from "../blocks/SDKDocumentationPageBlockAssets"
import { DocumentationPageBlockCallout, DocumentationPageBlockCalloutModel } from "../blocks/SDKDocumentationPageBlockCallout"
import { DocumentationPageBlockCode, DocumentationPageBlockCodeModel } from "../blocks/SDKDocumentationPageBlockCode"
import { DocumentationPageBlockColumn, DocumentationPageBlockColumnModel } from "../blocks/SDKDocumentationPageBlockColumn"
import { DocumentationPageBlockColumnItem, DocumentationPageBlockColumnItemModel } from "../blocks/SDKDocumentationPageBlockColumnItem"
import { DocumentationPageBlockCustom, DocumentationPageBlockCustomModel } from "../blocks/SDKDocumentationPageBlockCustom"
import { DocumentationPageBlockDivider, DocumentationPageBlockDividerModel } from "../blocks/SDKDocumentationPageBlockDivider"
import { DocumentationPageBlockEmbedFigma, DocumentationPageBlockEmbedFigmaModel } from "../blocks/SDKDocumentationPageBlockEmbedFigma"
import { DocumentationPageBlockEmbedGeneric, DocumentationPageBlockEmbedGenericModel } from "../blocks/SDKDocumentationPageBlockEmbedGeneric"
import { DocumentationPageBlockEmbedLink, DocumentationPageBlockEmbedLinkModel } from "../blocks/SDKDocumentationPageBlockEmbedLink"
import { DocumentationPageBlockEmbedStorybook, DocumentationPageBlockEmbedStorybookModel } from "../blocks/SDKDocumentationPageBlockEmbedStorybook"
import { DocumentationPageBlockEmbedYoutube, DocumentationPageBlockEmbedYoutubeModel } from "../blocks/SDKDocumentationPageBlockEmbedYoutube"
import { DocumentationPageBlockFrames, DocumentationPageBlockFramesModel } from "../blocks/SDKDocumentationPageBlockFrames"
import { DocumentationPageBlockHeading, DocumentationPageBlockHeadingModel } from "../blocks/SDKDocumentationPageBlockHeading"
import { DocumentationPageBlockImage, DocumentationPageBlockImageModel } from "../blocks/SDKDocumentationPageBlockImage"
import { DocumentationPageOrderedList } from "../blocks/SDKDocumentationPageBlockOrderedList"
import { DocumentationPageBlockQuote, DocumentationPageBlockQuoteModel } from "../blocks/SDKDocumentationPageBlockQuote"
import { DocumentationPageBlockRenderCode, DocumentationPageBlockRenderCodeModel } from "../blocks/SDKDocumentationPageBlockRenderCode"
import { DocumentationPageBlockShortcuts, DocumentationPageBlockShortcutsModel } from "../blocks/SDKDocumentationPageBlockShortcuts"
import { DocumentationPageBlockText, DocumentationPageBlockTextModel } from "../blocks/SDKDocumentationPageBlockText"
import { DocumentationPageBlockToken, DocumentationPageBlockTokenModel } from "../blocks/SDKDocumentationPageBlockToken"
import { DocumentationPageBlockTokenGroup, DocumentationPageBlockTokenGroupModel } from "../blocks/SDKDocumentationPageBlockTokenGroup"
import { DocumentationPageBlockTokenList, DocumentationPageBlockTokenListModel } from "../blocks/SDKDocumentationPageBlockTokenList"
import { DocumentationPageUnorderedList, DocumentationPageUnorderedListModel } from "../blocks/SDKDocumentationPageBlockUnorderedList"
import { DocumentationCustomBlock } from "../custom_blocks/SDKDocumentationCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationBlockBuilder {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Static

  static fromGenericModel(model: DocumentationPageBlockModel, customBlocks: Array<DocumentationCustomBlock>, configuration: DocumentationConfiguration): DocumentationPageBlock {
    switch (model.type) {
      case DocumentationPageBlockType.text:
        return new DocumentationPageBlockText(model as DocumentationPageBlockTextModel, customBlocks, configuration)
      case DocumentationPageBlockType.heading:
        return new DocumentationPageBlockHeading(model as DocumentationPageBlockHeadingModel, customBlocks, configuration)
      case DocumentationPageBlockType.code:
        return new DocumentationPageBlockCode(model as DocumentationPageBlockCodeModel, customBlocks, configuration)
      case DocumentationPageBlockType.unorderedList:
        return new DocumentationPageUnorderedList(model as DocumentationPageUnorderedListModel, customBlocks, configuration)
      case DocumentationPageBlockType.orderedList:
        return new DocumentationPageOrderedList(model as DocumentationPageBlockTextModel, customBlocks, configuration)
      case DocumentationPageBlockType.quote:
        return new DocumentationPageBlockQuote(model as DocumentationPageBlockQuoteModel, customBlocks, configuration)
      case DocumentationPageBlockType.callout:
        return new DocumentationPageBlockCallout(model as DocumentationPageBlockCalloutModel, customBlocks, configuration)
      case DocumentationPageBlockType.divider:
        return new DocumentationPageBlockDivider(model as DocumentationPageBlockDividerModel, customBlocks, configuration)
      case DocumentationPageBlockType.image:
        return new DocumentationPageBlockImage(model as DocumentationPageBlockImageModel, customBlocks, configuration)
      case DocumentationPageBlockType.link:
        return new DocumentationPageBlockEmbedLink(model as DocumentationPageBlockEmbedLinkModel, customBlocks, configuration)
      case DocumentationPageBlockType.token:
        return new DocumentationPageBlockToken(model as DocumentationPageBlockTokenModel, customBlocks, configuration)
      case DocumentationPageBlockType.tokenGroup:
        return new DocumentationPageBlockTokenGroup(model as DocumentationPageBlockTokenGroupModel, customBlocks, configuration)
      case DocumentationPageBlockType.tokenList:
        return new DocumentationPageBlockTokenList(model as DocumentationPageBlockTokenListModel, customBlocks, configuration)
      case DocumentationPageBlockType.shortcuts:
        return new DocumentationPageBlockShortcuts(model as DocumentationPageBlockShortcutsModel, customBlocks, configuration)
      case DocumentationPageBlockType.figmaEmbed:
        return new DocumentationPageBlockEmbedFigma(model as DocumentationPageBlockEmbedFigmaModel, customBlocks, configuration)
      case DocumentationPageBlockType.youtubeEmbed:
        return new DocumentationPageBlockEmbedYoutube(model as DocumentationPageBlockEmbedYoutubeModel, customBlocks, configuration)
      case DocumentationPageBlockType.storybookEmbed:
        return new DocumentationPageBlockEmbedStorybook(model as DocumentationPageBlockEmbedStorybookModel, customBlocks, configuration)
      case DocumentationPageBlockType.genericEmbed:
        return new DocumentationPageBlockEmbedGeneric(model as DocumentationPageBlockEmbedGenericModel, customBlocks, configuration)
      case DocumentationPageBlockType.figmaFrames:
        return new DocumentationPageBlockFrames(model as DocumentationPageBlockFramesModel, customBlocks, configuration)
      case DocumentationPageBlockType.componentAssets:
        return new DocumentationPageBlockAssets(model as DocumentationPageBlockAssetsModel, customBlocks, configuration)
      case DocumentationPageBlockType.custom:
        return new DocumentationPageBlockCustom(model as DocumentationPageBlockCustomModel, customBlocks, configuration)
      case DocumentationPageBlockType.renderCode:
        return new DocumentationPageBlockRenderCode(model as DocumentationPageBlockRenderCodeModel, customBlocks, configuration)
      case DocumentationPageBlockType.column:
        return new DocumentationPageBlockColumn(model as DocumentationPageBlockColumnModel, customBlocks, configuration)
      case DocumentationPageBlockType.columnItem:
        return new DocumentationPageBlockColumnItem(model as DocumentationPageBlockColumnItemModel, customBlocks, configuration)
    }
  }
}
