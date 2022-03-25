//
//  SDKExporterConfigurationProperty.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ExporterConfigurationPropertyModel {
    label: string
    description: string
    category: string
    key: string

    type: ExporterConfigurationPropertyType
    inputType: ExporterConfigurationPropertyInputType
    isMultiline: boolean
    
    default?: string | number | boolean
    values: Array<string>
  }
  
  export enum ExporterConfigurationPropertyType {
    string = 'string',
    number = 'number',
    boolean = 'boolean',
    enum = 'enum',
    image = 'image'
  }

  export enum ExporterConfigurationPropertyInputType {
    plain = 'plain',
    code = 'code'
  }
  
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: -  Object Definition
  
  export class ExporterConfigurationProperty {
  
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Public properties
  
    label: string
    category: string
    description: string
    key: string

    type: ExporterConfigurationPropertyType
    inputType: ExporterConfigurationPropertyInputType
    isMultiline: boolean

    default: string | number | boolean | null
    value: string | number | boolean | null
    values: Array<string>
  
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor
  
    constructor(data: ExporterConfigurationPropertyModel, value: string | number | boolean | null) {
      this.label = data.label
      this.category = data.category
      this.description = data.description
      this.key = data.key

      this.type = data.type
      this.inputType = data.inputType ?? ExporterConfigurationPropertyInputType.plain
      this.isMultiline = data.isMultiline

      this.default = data.default ?? null
      this.values = data.values ?? []
      this.value = value ?? this.default
    }
  
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Methods

    updateValue(value: string | number | boolean | null) {
      this.value = value
    }
  }
  