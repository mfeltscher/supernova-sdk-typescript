//
//  SDKComponent.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ComponentOrigin, ComponentOriginModel } from '../support/SDKComponentOrigin'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ComponentRemoteModel {

    id: string
    persistentId: string
    designSystemVersionId: string
    brandId: string
    thumbnailUrl?: string
    exportProperties: {
        isAsset: boolean
    }
    meta: {
        name: string,
        description: string,
    }
    originComponent?: ComponentOriginModel

    // Not used RN, so not properly defined - will be defined properly when we extend  model with components as well
    properties: Array<any> 
    rootNode?: any
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class Component {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  brandId: string
  thumbnailUrl: string | null
  
  name: string
  description: string

  origin: ComponentOrigin | null


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ComponentRemoteModel) {
    this.id = model.persistentId
    this.brandId = model.brandId
    this.thumbnailUrl = model.thumbnailUrl ?? null

    this.name = model.meta.name
    this.description = model.meta.description
    
    this.origin = new ComponentOrigin(model.originComponent)
  }
}
