//
//  DocumentationPageBlockImage.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Alignment } from "../../enums/SDKAlignment"
import { ExporterCustomBlock } from "../../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"
import { DocumentationPageAssetModel, DocumentationPageAsset } from "../SDKDocumentationPageAsset"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockImageModel extends DocumentationPageBlockModel {
  asset?: DocumentationPageAssetModel
  // Deprecated. Was replaced with `asset.url`
  assetUrl?: string
  caption?: string
  alignment: Alignment
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockImage extends DocumentationPageBlock {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  url: string | null
  asset: DocumentationPageAsset
  caption: string | null
  alignment: Alignment

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockImageModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
    this.url = model.assetUrl ?? model.asset?.url ?? null
    this.asset = model.asset?.id ? new DocumentationPageAsset(model.asset) : null
    this.caption = model.caption ?? null
    this.alignment = model.alignment
  }
}
