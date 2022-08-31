//
//  SDKAssetGroup.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

import { DesignComponentGroupRemoteModel } from "./SDKDesignComponentGroup"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions
  
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: -  Object Definition
  
  export class AssetGroup {
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Public properties
  
    id: string
    brandId: string
    name: string
    description: string
    path: Array<string>
    subgroups: Array<AssetGroup>
    isRoot: boolean
    childrenIds: Array<string>
    assetIds: Array<string>
    parent: AssetGroup | null
    
    createdAt: Date | null
    updatedAt: Date | null
  
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor
  
    constructor(model: DesignComponentGroupRemoteModel) {
      this.id = model.persistentId
      this.brandId = model.brandId
      this.name = model.meta.name
      this.description = model.meta.description
      this.isRoot = model.isRoot
      this.childrenIds = model.childrenIds
  
      this.path = new Array<string>()
      this.assetIds = new Array<string>()
      this.subgroups = new Array<AssetGroup>()
      this.parent = null

      this.createdAt = model.createdAt ? new Date(model.createdAt) : null
      this.updatedAt = model.updatedAt ? new Date(model.updatedAt) : null
    }
  
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Convenience
  
    addChild(group: AssetGroup) {
      this.subgroups.push(group)
    }
  
    addChildren(groups: Array<AssetGroup>) {
      this.subgroups = this.subgroups.concat(groups)
    }
  
    setPath(segments: Array<string>) {
      this.path = segments
    }
  
    setParent(parent: AssetGroup | null) {
      this.parent = parent ?? null
    }
  }
  