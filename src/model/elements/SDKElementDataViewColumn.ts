//
//  ElementDataViewColumn.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2023 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export enum ElementDataViewColumnType {
  baseProperty = "BaseProperty", 
  propertyDefinition = "PropertyDefinition",
  theme = "Theme"
}

export enum ElementDataViewColumnBasePropertyType {
  name = "Name",
  description = "Description",
  value = "Value",
  updatedAt = "UpdatedAt"
}

export interface ElementDataViewColumnRemoteModel {
  id: string
  persistentId: string
  type: ElementDataViewColumnType
  basePropertyType?: ElementDataViewColumnBasePropertyType
  propertyDefinitionId?: string
  themeId?: string
  width: number
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ElementDataViewColumn {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  /** Unique id of data view column, different across versions */
  id: string
  
  /** Unique persistent id of the data view column */
  persistentId: string

  /** Type of the contained property */
  type: ElementDataViewColumnType

  /** Type of the base property, if element column type === BaseProperty */
  basePropertyType: ElementDataViewColumnBasePropertyType | null

  /** Data view columns */
  propertyDefinitionId: string | null

  /** Theme id column points to */
  themeId: string | null

  /** Column width */
  width: number

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ElementDataViewColumnRemoteModel) {

    this.id = model.id
    this.persistentId = model.persistentId
    this.type = model.type
    this.basePropertyType = model.basePropertyType ?? null

    this.propertyDefinitionId = model.propertyDefinitionId ?? null
    this.themeId = model.themeId ?? null
    this.width = model.width
  }
}
