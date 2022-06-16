//
//  SDKDTTokenMerger.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { uuid } from 'uuidv4'
import { Token } from '../../../model/tokens/SDKToken'
import { DTProcessedTokenNode } from './SDKDTJSONConverter'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type DTTokenMergeDiff = {
    toUpdate: Array<DTProcessedTokenNode>
    toCreate: Array<DTProcessedTokenNode>
    toDelete: Array<DTProcessedTokenNode>
    toCreateOrUpdate: Array<DTProcessedTokenNode>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility allowing merging of two pools of tokens */
export class DTTokenMerger {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merger

  static buildKey(path: Array<string>, name: string): string {

    return [...path, name].join('/')
  }

  buildPath(token: Token): Array<string> {

    if (!token.parent) {
        throw new Error('Keys can only be built for tokens that have parents')
    }

    let parent = token.parent
    let segments = []
    while (parent) {
      segments = [parent.name, ...segments]
      parent = parent.parent
    }
    return segments
  }

  buildNodeMap(nodes: Array<DTProcessedTokenNode>): Map<string, DTProcessedTokenNode> {

    const result = new Map<string, DTProcessedTokenNode>()
    for (let node of nodes) {
      // Possibly filter out tokens with styles associated with them?
      result.set(node.key, node)
    }
    return result
  }

  convertBaseTokensToProcessedNode(tokens: Array<Token>): Array<DTProcessedTokenNode> {

    return tokens.map(t => {
        let path = this.buildPath(t)
        let key = DTTokenMerger.buildKey(path, t.name)
        return {
            token: t,
            key: key,
            originalType: undefined, // Note this is correct - we don't need the original type anywhere in merging
            path: path
        }
    })
  }
  
  makeTokensDiff(existing: Array<Token>, extracted: Array<DTProcessedTokenNode>): DTTokenMergeDiff {

    const toUpdate: Array<DTProcessedTokenNode> = []
    const toCreate: Array<DTProcessedTokenNode> = []
    const toDelete: Array<DTProcessedTokenNode> = []
    const toCreateOrUpdate: Array<DTProcessedTokenNode> = []
    const existingAsProcessedNodes = this.convertBaseTokensToProcessedNode(existing)
    const existingMap = this.buildNodeMap(existingAsProcessedNodes)
    const extractedMap = this.buildNodeMap(extracted)

    for (const node of extracted) {
      const key = DTTokenMerger.buildKey(node.path, node.token.name)
      const oldToken = existingMap.get(key)
      if (oldToken) {
        node.token.id = oldToken.token.id
        node.token.versionedId = oldToken.token.versionedId
        toUpdate.push(node)
      } else {
        node.token.id = uuid()
        toCreate.push(node)
      }
      toCreateOrUpdate.push(node)
    }

    // const existingCollection = new DTProcessedTokenNodeCollection(existing)
    // const extractedCollectionToUpdate = new DTProcessedTokenNodeCollection(toUpdate)

    // Reiterate over `toUpdate` again to set or break aliases
    // we can't do that during first iteration, because during first
    // iteration we don't have correct `persistentId` attr set
    // This is only experimental, TODO: get to it later
    /*
    for (const token of toUpdate) {
      const oldToken = existingCollection.index.get(token.id)

      if (oldToken..aliasTo) {
        const alias = oldToken.data.aliasTo
        // NOTE: currently one level supported
        const aliasedToken = extractedCollectionToUpdate.index.get(alias) ?? existingCollection.index.get(alias)
        if (aliasedToken) {
          const tokenValue = stringify(token.toTokenDTO().data.value)
          const aliasedValue = stringify(aliasedToken.toTokenDTO().data.value)

          if (tokenValue === aliasedValue) {
            token.data.aliasTo = alias
          } 
        }
      }
    }
    */

    for (const node of existingAsProcessedNodes) {
      const key = DTTokenMerger.buildKey(node.path, node.token.name)
      if (!extractedMap.has(key)) {
        toDelete.push(node)
      }
    }

    return {
      toUpdate,
      toCreate,
      toDelete,
      toCreateOrUpdate
    }
  }
}
