//
//  SDKCustomTokenProperty.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { CustomTokenPropertyType } from '../../enums/SDKCustomTokenPropertyType'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface CustomTokenPropertyModel {
  id: string
  name: string
  codeName: string
  type: CustomTokenPropertyType
  defaultValue: string | number | boolean
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

/** Token property definition which can be configured by the user */
export class CustomTokenProperty {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  /** Unique id of the property */
  id: string

  /** User-readable name of the property */
  name: string

  /** Code-safe name of the property */
  codeName: string

  /** Property type */
  type: CustomTokenPropertyType

  /** Default value which should be used if the user didn't provide any value (no overrides) */
  defaultValue: string | number | boolean

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: CustomTokenPropertyModel) {
    this.id = model.id
    this.name = model.name
    this.codeName = model.codeName
    this.type = model.type
    this.defaultValue = model.defaultValue
  }
}
