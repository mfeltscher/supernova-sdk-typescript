//
//  SDKDocumentationCustomBlock.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationCustomBlockProperty, DocumentationCustomBlockPropertyModel } from "./SDKDocumentationCustomBlockProperty"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationCustomBlockModel {
  // TODO
  key: string
  title: string
  description: string
  category: string
  iconURL: string
  mode: DocumentationCustomBlockMode
  properties: Array<DocumentationCustomBlockPropertyModel>
}

export enum DocumentationCustomBlockMode {
  block = 'block'
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationCustomBlock {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  key: string
  title: string
  description: string
  category: string
  iconUrl: string | null
  mode: DocumentationCustomBlockMode
  properties: Array<DocumentationCustomBlockProperty>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationCustomBlockModel) {
    this.key = model.key
    this.title = model.title
    this.description = model.description
    this.category = model.category
    this.iconUrl = model.iconURL ?? null
    this.mode = model.mode
    this.properties = model.properties.map(p => new DocumentationCustomBlockProperty(p))
  }
}
