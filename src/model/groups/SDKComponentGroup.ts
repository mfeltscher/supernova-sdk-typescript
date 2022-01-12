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

export interface ComponentGroupRemoteModel {
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
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ComponentGroup {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  brandId: string
  name: string
  description: string
  path: Array<string>
  subgroups: Array<ComponentGroup>
  isRoot: boolean
  childrenIds: Array<string>
  componentIds: Array<string>
  parent: ComponentGroup | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ComponentGroupRemoteModel) {
    this.id = model.persistentId
    this.brandId = model.brandId
    this.name = model.meta.name
    this.description = model.meta.description
    this.isRoot = model.isRoot
    this.childrenIds = model.childrenIds

    this.path = new Array<string>()
    this.componentIds = new Array<string>()
    this.subgroups = new Array<ComponentGroup>()
    this.parent = null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  addChild(group: ComponentGroup) {
    this.subgroups.push(group)
  }

  addChildren(groups: Array<ComponentGroup>) {
    this.subgroups = this.subgroups.concat(groups)
  }

  setPath(segments: Array<string>) {
    this.path = segments
  }

  setParent(parent: ComponentGroup | null) {
    this.parent = parent ?? null
  }
}
