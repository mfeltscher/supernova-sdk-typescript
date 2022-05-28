//
//  DKDTTokenCollection.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DTProcessedTokenNode } from "../SDKDTJSONConverter"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - DTProcessedTokenNode collection

export class DTProcessedTokenNodeCollection {

  // ---------------------
  // MARK: - Properties

  readonly index: Map<string, DTProcessedTokenNode>
  readonly added = new Set<string>()
  readonly deleted = new Map<string, DTProcessedTokenNode>()
  readonly dirty = new Set<string>()
  public readonly list: Array<DTProcessedTokenNode>

  // ---------------------
  // MARK: - Constructor

  constructor(source: Array<DTProcessedTokenNode> | Map<string, DTProcessedTokenNode>) {

    if (Array.isArray(source)) {
      this.list = source
      this.index = new Map()
      for (const node of source) {
        this.index.set(node.token.id, node)
      }
    } else {
      this.index = source
      this.list = []
      for (const elem of source.values()) {
        this.list.push(elem)
      }
    }
  }

  // ---------------------
  // MARK: - Manipulation with collection

  public markDeleted(element: DTProcessedTokenNode) {
    this.removeFromCollection(element.token.id)
    this.deleted.set(element.token.id, element)
  }

  public removeFromCollection(persistentId: string) {
    if (!this.index.has(persistentId)) {
      throw new Error(`Token ${persistentId} does not exist in collection`)
    }
    this.added.delete(persistentId)
    this.dirty.delete(persistentId)
    this.index.delete(persistentId)
    this.deleted.delete(persistentId)
    const idx = this.list.findIndex(p => p.token.id === persistentId)

    if (idx === -1) {
      throw new Error('Unable to find token in list: ' + persistentId)
    }

    this.list.splice(idx, 1)
  }

  markDirty(node: DTProcessedTokenNode) {
    if (!this.index.has(node.token.id)) {
      throw new Error(`Token ${node.token.id} does not exist in collection`)
    }
    if (!this.added.has(node.token.id)) {
      this.dirty.add(node.token.id)
    }
  }

  add(node: DTProcessedTokenNode) {
    
    if (this.index.has(node.token.id)) {
      throw new Error(`Element ${node.token.id} is already exists in collection`)
    }
    this.list.push(node)
    this.index.set(node.token.id, node)
    this.added.add(node.token.id)
  }
}
