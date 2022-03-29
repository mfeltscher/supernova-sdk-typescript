//
//  SDKExporterCustomBlockProperty.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ExporterCustomBlockPropertyModel {
  label: string
  key: string

  type: ExporterCustomBlockPropertyType
  inputType: ExporterCustomBlockPropertyInputType
  isMultiline: boolean
  
  default?: string | number | boolean
  values: Array<string>
}

export enum ExporterCustomBlockPropertyType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  enum = 'enum',
  image = 'image',
  color = 'color',
  typography = 'typography'
}

export enum ExporterCustomBlockPropertyInputType {
  plain = 'plain',
  code = 'code'
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ExporterCustomBlockProperty {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  label: string
  key: string

  type: ExporterCustomBlockPropertyType
  inputType: ExporterCustomBlockPropertyInputType
  isMultiline: boolean

  default: string | number | boolean | null
  values: Array<string>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(data: ExporterCustomBlockPropertyModel) {
    this.label = data.label
    this.key = data.key

    this.type = data.type
    this.inputType = data.inputType ?? ExporterCustomBlockPropertyInputType.plain
    this.isMultiline = data.isMultiline

    this.default = data.default ?? null
    this.values = data.values ?? []
  }
}
