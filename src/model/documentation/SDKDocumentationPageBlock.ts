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
import { DocumentationCustomBlock } from "./custom_blocks/SDKDocumentationCustomBlock"
import { DocumentationConfiguration } from "./SDKDocumentationConfiguration"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockModel {
  persistentId: string
  designObjectId: string
  type: DocumentationPageBlockType
  children: Array<DocumentationPageBlockModel>
  variantKey?: string
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
  variantKey: string

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockModel, customBlocks: Array<DocumentationCustomBlock>, configuration: DocumentationConfiguration) {
    this.id = model.persistentId
    // Map children. Children that are not supported by the data model natively should be ignored
    this.children = model.children.map(c => DocumentationBlockBuilder.fromGenericModel(c, customBlocks, configuration)).filter(c => c !== undefined)
    this.type = model.type
    this.variantKey = model.variantKey ?? null
    this.beginsTypeChain = true // Will be computed by resolver
    this.endsTypeChain = true // Will be computed by resolver
  }
}
