//
//  DocumentationPageBlockCustom.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ExporterCustomBlock } from "../../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockCustomModel extends DocumentationPageBlockModel {
  customBlockKey: string
  customBlockProperties?: Array<{
    key: string,
    value: any
  }>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockCustom extends DocumentationPageBlock {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  key: string
  properties: Object
  block: ExporterCustomBlock | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockCustomModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
    this.key = model.customBlockKey

    // Attach custom block
    this.block = null
    for (let customBlock of customBlocks) {
      if (customBlock.key === model.customBlockKey) {
        this.block = customBlock
      }
    }

    // If there is no block attached, it means the block was removed - ignore the payload resolution
    if (!this.block) {
      this.properties = {}
      return
    }

    // With proper custom block found, add default values for properties first
    let properties = {}
    for (let property of this.block.properties) {
      properties[property.key] = property.default
    }

    // Add overrides
    for (let property of model.customBlockProperties) {
      properties[property.key] = property.value

      // Deprecated. Old image asset type for backward compatibility
      if (property.value?.asset || property.value?.asset === null) {
        property.value.assetId = property.value.asset?.id ?? null
        property.value.assetUrl = property.value.asset?.url ?? null
      }
    }
    this.properties = properties
  }
}
