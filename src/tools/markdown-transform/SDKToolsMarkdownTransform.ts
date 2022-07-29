//
//  SDKToolsMarkdownTransform.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationPageBlockHeading } from '../../model/documentation/blocks/SDKDocumentationPageBlockHeading'
import { DocumentationPageBlockImage } from '../../model/documentation/blocks/SDKDocumentationPageBlockImage'
import { DocumentationPageOrderedList } from '../../model/documentation/blocks/SDKDocumentationPageBlockOrderedList'
import { DocumentationPageBlockText } from '../../model/documentation/blocks/SDKDocumentationPageBlockText'
import { DocumentationPageUnorderedList } from '../../model/documentation/blocks/SDKDocumentationPageBlockUnorderedList'
import { DocumentationPage } from '../../model/documentation/SDKDocumentationPage'
import { DocumentationPageBlock } from '../../model/documentation/SDKDocumentationPageBlock'
import { DocumentationRichText } from '../../model/documentation/SDKDocumentationRichText'
import { DocumentationHeadingType } from '../../model/enums/SDKDocumentationHeadingType'
import { DocumentationPageBlockType } from '../../model/enums/SDKDocumentationPageBlockType'
import { RichTextSpanAttributeType } from '../../model/enums/SDKRichTextSpanAttributeType'
import { MarkdownTransformBlock } from './SDKToolsMarkdownTransformBlock'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

/** Output markdown mode. Commonmark and GitHub is currently supported */
export enum MarkdownTransformType {
    commonmark = "commonmark",
    github = "github"
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Search Instance

/** Markdown transformers */
export class MarkdownTransform {

  // --- Properties
  conversionType: MarkdownTransformType
  blockTransformer: MarkdownTransformBlock

  // --- Constructor
  constructor(type: MarkdownTransformType) {
    this.conversionType = type
    if (type === MarkdownTransformType.github) {
        console.log("Note: GitHub mode of markdown is currently in development and is not yet fully supported")
    }
    this.blockTransformer = new MarkdownTransformBlock(type)
  }

  // --- Conversion

  /** Converts entire definition of the page, including its metadata like title and description, to markdown */
  convertPageToMarkdown = (page: DocumentationPage) => {
    const blocks = this.flattenedBlocksOfPage(page)
    let pageContent: Array<string> = []
    for (let block of blocks) {
      let blockContent = this.blockTransformer.convertBlockToMarkdown(block)
      if (blockContent) {
        pageContent.push(blockContent)
      }
    }

    const title = `# ${page.title}\n\n`
    const description = page.configuration.header.description ? `${page.configuration.header.description}\n\n` : ''
    const heading = `${title}${description}---\n\n`
    const content = pageContent.join('\n\n')

    return `${heading}${content}`
  }

  /** Creates flattened structure of the blocks, even from the contained blocks, so it is easier to iterate through them */
  private flattenedBlocksOfPage = (page: DocumentationPage): Array<DocumentationPageBlock> => {
    let blocks: Array<DocumentationPageBlock> = page.blocks
    for (let block of page.blocks) {
        blocks = blocks.concat(this.flattenedBlocksOfBlock(block))
    }
    
    return blocks
  }

  /** Flattens one leaf of blocks */
  private flattenedBlocksOfBlock = (block: DocumentationPageBlock): Array<DocumentationPageBlock> => {
    let subblocks: Array<DocumentationPageBlock> = block.children
    for (let subblock of block.children) {
        subblocks = subblocks.concat(this.flattenedBlocksOfBlock(subblock))
    }

    return subblocks
  } 
}
