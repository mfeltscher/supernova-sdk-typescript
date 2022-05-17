//
//  ComponentPropertyValue.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ComponentPropertyValueLink, ComponentPropertyValueLinkRemoteModel } from "./SDKComponentPropertyValueLink"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ComponentPropertyValueRemoteModel {
 
    value: string | boolean | number | ComponentPropertyValueLinkRemoteModel

    id: string // unique
    designSystemVersionId: string
    definitionId: string // column
    targetElementId: string // component / row
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ComponentPropertyValue {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: string | boolean | number | ComponentPropertyValueLink

  id: string
  designSystemVersionId: string
  definitionId: string
  targetElementId: string

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ComponentPropertyValueRemoteModel) {

    this.id = model.id
    this.designSystemVersionId = model.designSystemVersionId

    if (typeof model.value === "object") {
        this.value = new ComponentPropertyValueLink(model.value as ComponentPropertyValueLinkRemoteModel)
    } else {
        this.value = model.value
    }

    this.definitionId = model.definitionId
    this.targetElementId = model.targetElementId
  }
}
