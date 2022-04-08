//
//  SDKRichTextSpanAttribute.ts
//  Supernova 
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { RichTextSpanAttributeType } from "../enums/SDKRichTextSpanAttributeType"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface RichTextSpanAttributeModel {
  type: RichTextSpanAttributeType
  link?: string
  documentationItemId?: string
  openInNewWindow: boolean
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class RichTextSpanAttribute {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  type: RichTextSpanAttributeType
  link: string | null
  openInNewWindow: boolean
  documentationItemId: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: RichTextSpanAttributeModel) {
    this.type = model.type
    this.link = model.link ?? null
    if (model.hasOwnProperty("openInNewWindow")) {
      this.openInNewWindow = model.openInNewWindow
    } else {
      this.openInNewWindow = false
    }
    this.documentationItemId = model.documentationItemId ?? null
  }
}
