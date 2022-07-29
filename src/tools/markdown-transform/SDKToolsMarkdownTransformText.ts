//
//  SDKToolsMarkdownTransformText.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { RichTextSpanAttribute } from '../../model/documentation/SDKDocumentationRichTextSpanAttribute'
import { DocumentationRichText } from '../../model/documentation/SDKDocumentationRichText'
import { MarkdownTransformType } from './SDKToolsMarkdownTransform'
import { RichTextSpanAttributeType } from '../../model/enums/SDKRichTextSpanAttributeType'
import { DocumentationPageBlockText } from '../../model/documentation/blocks/SDKDocumentationPageBlockText'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Search Instance

/** Markdown block transformer */
export class MarkdownTransformText {
  // -- Properties

  private transformType: MarkdownTransformType

  // --- Conversion
  constructor(type: MarkdownTransformType) {
    this.transformType = type
  }

  // --- Conversion

  /** Converts rich text block to markdown
   *
   * This is very naive implementation and will break in complicated cases, like double control characters of the same type next to each other
   * Must improve later with something more sophisticated, ideally tree builder with branched resolution.
   */
  convertTextBlockToMarkdown(block: DocumentationPageBlockText): string | null {
    return this.convertRichTextToMarkdown(block.text)
  }

  /** Converts rich text to markdown
   *
   * This is very naive implementation and will break in complicated cases, like double control characters of the same type next to each other
   * Must improve later with something more sophisticated, ideally tree builder with branched resolution.
   */
  convertRichTextToMarkdown(richText: DocumentationRichText): string {
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
