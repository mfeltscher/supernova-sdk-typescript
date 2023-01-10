//
//  SDKDesignComponent.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignComponentOrigin, DesignComponentOriginModel } from '../support/SDKDesignComponentOrigin'
import { Source } from '../support/SDKSource'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DesignComponentRemoteModel {

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
    
    originComponent?: DesignComponentOriginModel

    // Not used RN, so not properly defined - will be defined properly when we extend  model with components as well
    properties: Array<any> 
    rootNode?: any
    createdAt?: string
    updatedAt?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DesignComponent {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  brandId: string
  thumbnailUrl: string | null
  
  name: string
  description: string

  origin: DesignComponentOrigin | null
  createdAt: Date | null
  updatedAt: Date | null


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DesignComponentRemoteModel, sources: Array<Source>) {
    this.id = model.persistentId
    this.brandId = model.brandId
    this.thumbnailUrl = model.thumbnailUrl ?? null

    this.name = model.meta.name
    this.description = model.meta.description
    
    this.origin = new DesignComponentOrigin(model.originComponent, sources)

    this.createdAt = model.createdAt ? new Date(model.createdAt) : null
    this.updatedAt = model.updatedAt ? new Date(model.updatedAt) : null
  }
}
