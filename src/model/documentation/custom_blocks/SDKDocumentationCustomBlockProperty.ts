//
//  SDKDocumentationCustomBlockProperty.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationCustomBlockPropertyModel {
  label: string
  key: string
  type: DocumentationCustomBlockPropertyType
  default?: string | number | boolean
  values: Array<string>
}

export enum DocumentationCustomBlockPropertyType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  enum = 'enum',
  image = 'image'
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationCustomBlockProperty {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  label: string
  key: string
  type: DocumentationCustomBlockPropertyType
  default: string | number | boolean | null
  values: Array<string>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(data: DocumentationCustomBlockPropertyModel) {
    this.label = data.label
    this.key = data.key
    this.type = data.type
    this.default = data.default ?? null
    this.values = data.values ?? []
  }
}
