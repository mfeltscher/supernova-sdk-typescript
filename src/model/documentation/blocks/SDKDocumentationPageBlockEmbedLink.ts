//
//  DocumentationPageBlockEmbedLink.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ExporterCustomBlock } from "../../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockEmbedGenericModel, DocumentationPageBlockEmbedGeneric } from "./SDKDocumentationPageBlockEmbedGeneric"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockEmbedLinkModel extends DocumentationPageBlockEmbedGenericModel {
  urlPreview?: {
    title?: string
    description?: string
    thumbnailUrl?: string
  }
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockEmbedLink extends DocumentationPageBlockEmbedGeneric {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  title: string | null
  description: string | null
  thumbnailUrl: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockEmbedLinkModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
    this.title = model.urlPreview?.title ?? null
    this.description = model.urlPreview?.description ?? null
    this.thumbnailUrl = model.urlPreview?.thumbnailUrl ?? null
  }
}
