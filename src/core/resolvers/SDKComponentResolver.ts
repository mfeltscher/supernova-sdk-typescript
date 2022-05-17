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
import { ComponentProperty, ComponentPropertyRemoteModel } from "../../model/components/SDKComponentProperty"
import { ComponentPropertyValue, ComponentPropertyValueRemoteModel } from "../../model/components/values/SDKComponentPropertyValue"


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

  async resolveComponentData(components: Array<ComponentRemoteModel>, properties: Array<ComponentPropertyRemoteModel>, values: Array<ComponentPropertyValueRemoteModel>): Promise<Array<Component>> {
    
    let resolvedProperties = properties.map(p => new ComponentProperty(p))
    let resolvedValues = values.map(v => new ComponentPropertyValue(v))
    let resolvedComponents = components.map(c => new Component(c, resolvedProperties, resolvedValues))

    return resolvedComponents
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Authenticated data fetching
}
