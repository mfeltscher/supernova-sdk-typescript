//
//  SDKComponentResolver.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Component, ComponentRemoteModel } from "../../model/components/SDKComponent"
import { ElementProperty, ElementPropertyRemoteModel } from "../../model/components/SDKElementProperty"
import { ElementPropertyValue, ElementPropertyValueRemoteModel } from "../../model/components/values/SDKElementPropertyValue"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class ComponentResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Resolution

  async resolveComponentData(components: Array<ComponentRemoteModel>, properties: Array<ElementPropertyRemoteModel>, values: Array<ElementPropertyValueRemoteModel>): Promise<Array<Component>> {
    
    let resolvedProperties = properties.map(p => new ElementProperty(p))
    let resolvedValues = values.map(v => new ElementPropertyValue(v))
    let resolvedComponents = components.map(c => new Component(c, resolvedProperties, resolvedValues))

    return resolvedComponents
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Authenticated data fetching
}
