//
//  SDKTokenGroup.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenType } from '../enums/SDKTokenType'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface TokenGroupRemoteModel {
  id: string
  brandId: string
  tokenType: TokenType
  designSystemVersionId: string
  persistentId: string
  isRoot: boolean
  meta: {
    name: string
    description: string
  }
  childrenIds: string[]
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class TokenGroup {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  brandId: string
  name: string
  description: string
  path: Array<string>
  subgroups: Array<TokenGroup>
  tokenType: TokenType
  isRoot: boolean
  childrenIds: Array<string>
  tokenIds: Array<string>
  parent: TokenGroup | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: TokenGroupRemoteModel) {
    this.id = model.persistentId
    this.brandId = model.brandId
    this.name = model.meta.name
    this.description = model.meta.description
    this.isRoot = model.isRoot
    this.tokenType = model.tokenType
    this.childrenIds = model.childrenIds

    this.path = new Array<string>()
    this.tokenIds = new Array<string>()
    this.subgroups = new Array<TokenGroup>()
    this.parent = null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  addChild(group: TokenGroup) {
    this.subgroups.push(group)
  }

  addChildren(groups: Array<TokenGroup>) {
    this.subgroups = this.subgroups.concat(groups)
  }

  setPath(segments: Array<string>) {
    this.path = segments
  }

  setParent(parent: TokenGroup | null) {
    this.parent = parent ?? null
  }
}
