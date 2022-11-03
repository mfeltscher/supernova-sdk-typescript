//
//  SDKDocumentationPageBlock.ts
//  Supernova 
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationPageBlockType } from "../enums/SDKDocumentationPageBlockType"
import { DocumentationBlockBuilder } from "./builder/SDKDocumentationBlockBuilder"
import { ExporterCustomBlock } from "../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "./SDKDocumentationConfiguration"
import { DocumentationPageBlockThemeType } from "../enums/SDKDocumentationPageBlockThemeType"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockModel {
  persistentId: string
  designObjectId: string
  type: DocumentationPageBlockType
  children: Array<DocumentationPageBlockModel>
  variantKey?: string
  theme?: {
    themeIds: Array<string>,
    type: DocumentationPageBlockThemeType
  }
  blacklistedElementProperties?: Array<string>
  userMetadata?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlock {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  children: Array<DocumentationPageBlock>
  type: DocumentationPageBlockType
  beginsTypeChain: boolean
  endsTypeChain: boolean
  variantKey: string | null
  theme: {
    themeIds: Array<string>,
    type: DocumentationPageBlockThemeType
  } | null
  blacklistedElementProperties: Array<string> | null
  userMetadata: object | Array<any> | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    this.id = model.persistentId
    // Map children. Children that are not supported by the data model natively should be ignored
    this.children = model.children.map(c => DocumentationBlockBuilder.fromGenericModel(c, customBlocks, configuration)).filter(c => c !== undefined)
    this.type = model.type
    this.beginsTypeChain = true // Will be computed by resolver
    this.endsTypeChain = true // Will be computed by resolver
    this.theme = model.theme ? model.theme : null
    this.variantKey = model.variantKey ?? null
    this.blacklistedElementProperties = model.blacklistedElementProperties ?? null

    if (model.userMetadata) {
      this.userMetadata = JSON.parse(model.userMetadata)
    } else {
      this.userMetadata = null
    }
  }
}
