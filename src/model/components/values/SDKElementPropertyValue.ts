//
//  ElementPropertyValue.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ElementPropertyValueRemoteModel {
 
    value: string | boolean | number

    id: string // unique
    designSystemVersionId: string // unique
    definitionId: string // corresponds to column - property persistentID
    targetElementId: string // corresponds to linked component - component persistentID
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ElementPropertyValue {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: string | boolean | number

  id: string
  designSystemVersionId: string
  definitionId: string
  targetElementId: string

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ElementPropertyValueRemoteModel) {

    this.id = model.id
    this.designSystemVersionId = model.designSystemVersionId

    if (model.hasOwnProperty("value")) {
      this.value = model.value
    } else {
      this.value = null
    }
    this.definitionId = model.definitionId
    this.targetElementId = model.targetElementId
  }
}
