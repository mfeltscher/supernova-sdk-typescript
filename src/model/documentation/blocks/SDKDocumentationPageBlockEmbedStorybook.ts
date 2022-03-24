//
//  DocumentationPageBlockEmbedStorybook.ts
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

export interface DocumentationPageBlockEmbedStorybookModel extends DocumentationPageBlockEmbedGenericModel {

}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockEmbedStorybook extends DocumentationPageBlockEmbedGeneric {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockEmbedStorybookModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
  }
}
