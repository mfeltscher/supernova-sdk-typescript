//
//  Supernova SDK
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignComponentRemoteModel } from "../components/SDKDesignComponent"
import { DesignComponentOrigin } from "../support/SDKDesignComponentOrigin"
import { Source } from "../support/SDKSource"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class Asset {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  brandId: string
  thumbnailUrl: string | null
  
  name: string
  description: string

  componentId: string | null
  previouslyDuplicatedNames: number
  
  origin: DesignComponentOrigin | null
  createdAt: Date | null
  updatedAt: Date | null


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DesignComponentRemoteModel, duplicates: number, sources: Array<Source>) {
    
    this.id = model.persistentId
    this.brandId = model.brandId
    this.thumbnailUrl = model.thumbnailUrl ?? null
    this.previouslyDuplicatedNames = duplicates

    this.name = model.meta.name
    this.description = model.meta.description
    
    this.componentId = model.id
    
    this.origin = new DesignComponentOrigin(model.originComponent, sources)

    this.createdAt = model.createdAt ? new Date(model.createdAt) : null
    this.updatedAt = model.updatedAt ? new Date(model.updatedAt) : null
  }
}
