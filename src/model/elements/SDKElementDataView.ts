//
//  ElementDataView.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2023 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ElementPropertyTargetElementType } from '../..'
import { ElementDataViewColumn, ElementDataViewColumnRemoteModel } from './SDKElementDataViewColumn'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ElementDataViewRemoteModel {
  id: string
  persistentId: string
  isDefault: boolean
  targetElementType: ElementPropertyTargetElementType
  columns: Array<ElementDataViewColumnRemoteModel>
  meta: {
    name: string
    description: string
  }
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ElementDataView {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  /** Unique id of data view, different across versions */
  id: string
  
  /** Unique persistent id of the data view */
  persistentId: string

  /** Default data view */
  isDefault: boolean

  /** Signifies which objects use this element data view */
  targetElementType: ElementPropertyTargetElementType

  /** Data view columns */
  columns: Array<ElementDataViewColumn>

  /** Data view name */
  name: string

  /** Data view description */
  description: string | null


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ElementDataViewRemoteModel) {

    this.id = model.id
    this.persistentId = model.persistentId

    this.name = model.meta.name
    this.description = model.meta.description ?? null
    
    this.targetElementType = model.targetElementType
    this.isDefault = model.isDefault
    this.columns = model.columns.map(c => new ElementDataViewColumn(c))
  }
}
