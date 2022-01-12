//
//  Supernova SDK
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ComponentRemoteModel } from "../components/SDKComponent"


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


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ComponentRemoteModel, duplicates: number) {
    
    this.id = model.persistentId
    this.brandId = model.brandId
    this.thumbnailUrl = model.thumbnailUrl ?? null
    this.previouslyDuplicatedNames = duplicates

    this.name = model.meta.name
    this.description = model.meta.description
    
    this.componentId = model.id
  }
}
