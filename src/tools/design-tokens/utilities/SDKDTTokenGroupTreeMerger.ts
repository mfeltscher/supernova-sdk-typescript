//
//  SDKDTTokenTreeMerger.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Token, TokenGroup, TokenType } from '../../..'
import { DTTokenMergeDiff } from './SDKDTTokenMerger'
import { buildBrandedElementRoots, GroupTree } from './tree/SDKDTGroupTree'
import { GroupTreeNode, TokenTreeElement } from './tree/SDKDTGroupTreeNode'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type DTTokenTreeMergeDiff = {
  toUpdate: Array<TokenTreeElement>
  toCreate: Array<TokenTreeElement>
  toDelete: Array<TokenTreeElement>
  toCreateOrUpdate: Array<TokenTreeElement>
}

export type DTGroupMergeDiffElement = {
  element: TokenTreeElement
  childrenIds: Array<string>
}

export class DTGroupMergeDiff {
  toUpdate: Array<DTGroupMergeDiffElement>
  toCreate: Array<DTGroupMergeDiffElement>
  toDelete: Array<TokenTreeElement>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility allowing merging of two distinct token trees */
export class DTTokenGroupTreeMerger {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merger

  makeGroupsDiff(
    tokensDiff: DTTokenMergeDiff,
    existingElements: Array<Token | TokenGroup>,
  ): DTGroupMergeDiff {

    // Contruct roots to take data from
    const exitingRoots = buildBrandedElementRoots(existingElements)
    const desiredStructures = new Map<string, Map<TokenType, GroupTree>>()

    // Make group structure
    for (let i = 0; i < tokensDiff.toCreateOrUpdate.length; i++) {

      const node = tokensDiff.toCreateOrUpdate[i]
      const nameParts = node.path.map(s => s.trim())
      nameParts.shift()

      let typeRoots = desiredStructures.get(node.token.brandId)
      if (!typeRoots) {
        typeRoots = new Map<TokenType, GroupTree>()
        desiredStructures.set(node.token.brandId, typeRoots)
      }
      let typeRoot = typeRoots.get(node.token.tokenType)

      if (!typeRoot) {
        const rootElem = exitingRoots.get(node.token.brandId).get(node.token.tokenType).element
        typeRoot = new GroupTree(rootElem)
        typeRoots.set(node.token.tokenType, typeRoot)
      }

      const group = typeRoot.getOrCreateGroup(nameParts)
      group.children.push(new GroupTreeNode(node.token, typeRoot))
      // if (elem instanceof TokenGroup) {
        // Ensure tokens are above groups by sorting
        // group.applyDefaultSorting()
      // }
    }

    // Next up - construct results
    const toUpdate: Array<DTGroupMergeDiffElement> = []
    const toCreate: Array<DTGroupMergeDiffElement> = []
    const toDelete: Array<TokenTreeElement> = []

    const compareDesiredAndExisting = (importNode: GroupTreeNode, existingNode: GroupTreeNode) => {
      if (importNode.isGroup) {
        for (const c of importNode.children) {
          const existingChild = (existingNode?.children ?? []).find(
            exc => exc.name === c.name && exc.isGroup === c.isGroup
          )
          compareDesiredAndExisting(c, existingChild)
        }

        const importChildrenIds = importNode.children.map(c => c.element.id)

        if (existingNode) {
          importNode.element.id = existingNode.element.id
          importNode.element.versionedId = existingNode.element.versionedId
          const existingChildrenIds = existingNode.children.map(c => c.element.id)
          if (JSON.stringify(importChildrenIds) !== JSON.stringify(existingChildrenIds)) {
            toUpdate.push({
              element: importNode.element,
              childrenIds: importChildrenIds
            })
          }
        } else {
          toCreate.push({
            element: importNode.element,
            childrenIds: importChildrenIds
          })
        }
      }
    }

    for (const [brandId, typeRoots] of desiredStructures.entries()) {
      for (const type of typeRoots.keys()) {
        compareDesiredAndExisting(typeRoots.get(type), exitingRoots.get(brandId).get(type))
      }
    }

    return {
      toCreate,
      toUpdate,
      toDelete
    }
  }
}
