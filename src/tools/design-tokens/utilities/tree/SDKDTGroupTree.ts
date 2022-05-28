//
//  SDKDTGroupTree.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Token, TokenGroup, TokenType } from '../../../..'
import { GroupTreeNode } from './SDKDTGroupTreeNode'
import { buildParentChildrenMap } from './SDKDTParentChildMapping'


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

export type GroupTreeNodeWalker = (node: GroupTreeNode, path: GroupTreeNode[]) => void
export type TokenTreeElement = Token | TokenGroup

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tree Implementation

export class GroupTree extends GroupTreeNode {

  // ---------------------
  // MARK: - Properties

  public childType: TokenType

  // ---------------------
  // MARK: - Constructor

  constructor(backingElement: TokenTreeElement) {

    super(backingElement, null)
    this.childType = backingElement.tokenType
    this.tree = this
  }

  // ---------------------
  // MARK: - Construction

  static populate(root: TokenTreeElement, elements: Array<TokenTreeElement>, parentChildrenMap: Map<string, Array<TokenTreeElement>>) {
    
    if (!root) {
      return null
    }

    const tree = new GroupTree(root)
    tree.populate(parentChildrenMap)
    return tree
  }
}

export function buildBrandedElementRoots(elements: TokenTreeElement[]): Map<string, Map<TokenType, GroupTree>> {

  const result = new Map<string, Map<TokenType, GroupTree>>()
  const { childrenMap } = buildParentChildrenMap(elements)

  const roots = elements.filter(element => (element instanceof TokenGroup) && element.isRoot)
  const brandIds = new Set(roots.map(e => e.brandId))

  for (const brandId of brandIds) {
    const typeRoots = new Map<TokenType, GroupTree>()
    result.set(brandId, typeRoots)

    for (const type of Object.values(TokenType)) {
      const root = roots.find(r => r.brandId === brandId && r.tokenType === type)
      const tree = GroupTree.populate(root, elements, childrenMap)
      if (tree) {
        typeRoots.set(type, tree)
      }
    }
  }

  return result
}
