//
//  SDKComponent.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ComponentProperty } from './SDKComponentProperty'
import { ComponentPropertyValue } from './values/SDKComponentPropertyValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ComponentRemoteModel {
  id: string
  persistentId: string
  designSystemVersionId: string
  brandId: string
  meta: {
    name: string
    description: string
  }
  createdAt: string
  updatedAt: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class Component {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  persistentId: string
  designSystemVersionId: string
  brandId: string

  name: string
  description: string
  createdAt: string
  updatedAt: string

  properties: Array<ComponentProperty> 
  propertyValues: object

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    model: ComponentRemoteModel,
    properties: Array<ComponentProperty>,
    propertyValues: Array<ComponentPropertyValue>
  ) {
    this.id = model.id
    this.persistentId = model.persistentId
    this.designSystemVersionId = model.designSystemVersionId
    this.brandId = model.brandId

    this.name = model.meta.name
    this.description = model.meta.description
    this.createdAt = model.createdAt
    this.updatedAt = model.updatedAt

    this.properties = properties
    this.propertyValues = {}

    for (let value of propertyValues) {
      if (value.targetElementId === this.persistentId) {
        // Property value refers to this element
        for (let property of properties) {
          if (property.persistentId === value.definitionId) {
            // Property value refers to the correct property, we get codeName from it and add it to quick-access
            this.propertyValues[property.codeName] = value.value
          }
        }
      }
    }
  }
}
