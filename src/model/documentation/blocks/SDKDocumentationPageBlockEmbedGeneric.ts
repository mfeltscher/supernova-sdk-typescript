//
//  DocumentationPageBlockEmbedGeneric.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { SizeModel, Size } from "../../support/SDKSize"
import { ExporterCustomBlock } from "../../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockEmbedGenericModel extends DocumentationPageBlockModel {
  url?: string
  size?: SizeModel
  caption?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockEmbedGeneric extends DocumentationPageBlock {
  
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  url: string | null
  size: Size | null
  caption: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockEmbedGenericModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
    this.url = model.url ?? null
    this.size = new Size(model.size ?? null)
    this.caption = model.caption ?? null
  }
}
