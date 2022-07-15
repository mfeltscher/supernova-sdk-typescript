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

  // --- Constructor
  constructor(type: MarkdownTransformType) {
    this.conversionType = type
    if (type === MarkdownTransformType.github) {
        console.log("Note: GitHub mode of markdown is currently in development and is not yet fully supported")
    }
  }

  // --- Conversion

  /** Converts a single block - depending on the type - to a markdown definition */
  convertBlockToMarkdown = (block: DocumentationPageBlock) => {

    if (this.isParseableBlock(block)) {
      switch (block.type) {
        case DocumentationPageBlockType.text: {
          return this.richTextToMarkdown((block as DocumentationPageBlockText).text)
        }
        case DocumentationPageBlockType.heading: {
          let heading = block as DocumentationPageBlockHeading
          let text = this.richTextToMarkdown(heading.text)
          switch (heading.headingType) {
            case DocumentationHeadingType.h1:
              return `# ${text}`
            case DocumentationHeadingType.h2:
              return `## ${text}`
            case DocumentationHeadingType.h3:
              return `### ${text}`
          }
        }
        case DocumentationPageBlockType.callout:
        case DocumentationPageBlockType.quote: {
          let text = this.richTextToMarkdown((block as DocumentationPageBlockText).text)
          return `> ${text}`
        }
        case DocumentationPageBlockType.image: {
          if ((block as DocumentationPageBlockImage).url) {
            return `![Img](${(block as DocumentationPageBlockImage).url})`
          }
        }
        case DocumentationPageBlockType.orderedList: {
          let listItem = block as DocumentationPageOrderedList
          let text = this.richTextToMarkdown(listItem.text)
          return `1. ` + text
        }
        case DocumentationPageBlockType.unorderedList: {
          let listItem = block as DocumentationPageUnorderedList
          let text = this.richTextToMarkdown(listItem.text)
          return `- ` + text
        }
        case DocumentationPageBlockType.divider: {
          return '---'
        }
        default:
          return `\n\nMissing parser for block type ${block.type}\n\n `
      }
    } else {
      return undefined
    }
  }

  /** Converts entire definition of the page, including its metadata like title and description, to markdown */
  convertPageToMarkdown = (page: DocumentationPage) => {
    const blocks = this.flattenedBlocksOfPage(page)
    let pageContent: Array<string> = []
    for (let block of blocks) {
      let blockContent = this.convertBlockToMarkdown(block)
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
  
  /** Checks whether the block can be converted to markdown. Other blocks are ignored in conversion */
  private isParseableBlock(block: DocumentationPageBlock): boolean {
    let allowedBlockTypes = [
      DocumentationPageBlockType.callout,
      DocumentationPageBlockType.quote,
      DocumentationPageBlockType.code,
      DocumentationPageBlockType.divider,
      DocumentationPageBlockType.heading,
      DocumentationPageBlockType.image,
      DocumentationPageBlockType.figmaEmbed,
      DocumentationPageBlockType.figmaFrames,
      DocumentationPageBlockType.genericEmbed,
      DocumentationPageBlockType.link,
      DocumentationPageBlockType.orderedList,
      DocumentationPageBlockType.unorderedList,
      DocumentationPageBlockType.table,
      DocumentationPageBlockType.text,
      DocumentationPageBlockType.image
    ]

    return allowedBlockTypes.includes(block.type)
  }

  /** Converts rich text to markdown
   *
   * This is very naive implementation and will break in many cases, like double control characters of the same type next to each other
   * Must improve later with something more sophisticated, ideally tree builder. Best case scenario - we move this to SDK itself
   * to make it easy and allow exporting to markdown though some new exporter, for example
   */
  private richTextToMarkdown(richText: DocumentationRichText): string {
    let outputString = ''
    for (let text of richText.spans) {
      if (text.text.length > 0) {
        let outputPartial = text.text
        for (let attribute of text.attributes) {
          switch (attribute.type) {
            case RichTextSpanAttributeType.link:
              outputPartial = `[${outputPartial}](${attribute.link ?? ''})`
              break
            case RichTextSpanAttributeType.bold:
              outputPartial = `*${outputPartial}*`
              break
            case RichTextSpanAttributeType.code:
              outputPartial = `\`${outputPartial}\``
              break
            case RichTextSpanAttributeType.italic:
              outputPartial = `_${outputPartial}**_`
              break
            case RichTextSpanAttributeType.strikethrough:
              outputPartial = `~~${outputPartial}~~`
              break
          }
        }
        outputString += outputPartial
      }
    }
    return outputString
  }
}
