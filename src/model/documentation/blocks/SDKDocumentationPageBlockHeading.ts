//
//  DocumentationPageBlockHeading.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationHeadingType } from "../../enums/SDKDocumentationHeadingType"
import { ExporterCustomBlock } from "../../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockTextModel, DocumentationPageBlockText } from "./SDKDocumentationPageBlockText"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockHeadingModel extends DocumentationPageBlockTextModel {
  headingType: DocumentationHeadingType
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockHeading extends DocumentationPageBlockText {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  headingType: DocumentationHeadingType

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockHeadingModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
    this.headingType = model.headingType
  }
}
