//
//  SDKTokenGroup.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DesignComponentGroupRemoteModel {
  id: string
  designSystemVersionId: string
  persistentId: string
  brandId: string
  isRoot: boolean
  meta: {
    name: string
    description: string
  }
  childrenIds: string[]
  createdAt?: string
  updatedAt?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DesignComponentGroup {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  brandId: string
  name: string
  description: string
  path: Array<string>
  subgroups: Array<DesignComponentGroup>
  isRoot: boolean
  childrenIds: Array<string>
  componentIds: Array<string>
  parent: DesignComponentGroup | null
  
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
    this.componentIds = new Array<string>()
    this.subgroups = new Array<DesignComponentGroup>()
    this.parent = null

    this.createdAt = model.createdAt ? new Date(model.createdAt) : null
    this.updatedAt = model.updatedAt ? new Date(model.updatedAt) : null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  addChild(group: DesignComponentGroup) {
    this.subgroups.push(group)
  }

  addChildren(groups: Array<DesignComponentGroup>) {
    this.subgroups = this.subgroups.concat(groups)
  }

  setPath(segments: Array<string>) {
    this.path = segments
  }

  setParent(parent: DesignComponentGroup | null) {
    this.parent = parent ?? null
  }
}
