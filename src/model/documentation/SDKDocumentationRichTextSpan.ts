//
//  SDKRichTextSpan.ts
//  Supernova 
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { RichTextSpanAttributeModel, RichTextSpanAttribute } from "./SDKDocumentationRichTextSpanAttribute"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface RichTextSpanModel {
  text: string
  attributes: Array<RichTextSpanAttributeModel>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class RichTextSpan {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  text: string
  attributes: Array<RichTextSpanAttribute>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: RichTextSpanModel) {
    this.text = model.text
    this.attributes = model.attributes.map(a => new RichTextSpanAttribute(a))
  }
}
