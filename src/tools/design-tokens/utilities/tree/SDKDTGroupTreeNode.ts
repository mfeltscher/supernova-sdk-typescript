//
//  SDKDTGroupTreeNode.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import lodash from 'lodash';
const { sortBy } = lodash;
import { uuid } from 'uuidv4'
import { Token, TokenGroup } from '../../../..'
import { GroupTree } from './SDKDTGroupTree'


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

export type GroupTreeNodeWalker = (node: GroupTreeNode, path: GroupTreeNode[]) => void
export type TokenTreeElement = Token | TokenGroup

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tree Node Implementation

export class GroupTreeNode {

  // ------------------
  // MARK: - Properties

  children: GroupTreeNode[]
  element: TokenTreeElement
  tree: GroupTree

  get isGroup() {
    return this.element instanceof TokenGroup
  }
  get name() {
    return this.element.name
  }

  // -------------------
  // MARK: - Constructor
  
  constructor(element: TokenTreeElement, tree: GroupTree) {
    this.element = element
    this.tree = tree
    if (this.isGroup) {
      this.children = []
    }
  }

  // ----------------
  // MARK: - Mutation
  
  applyDefaultSorting() {
    this.children = sortBy(this.children, child => (child.isGroup ? 1 : 0))
  }

  protected addChildInternal(child: GroupTreeNode, atIndex = -1) {
    if (atIndex === -1) {
      this.children.push(child)
    } else {
      this.children.splice(atIndex, 0, child)
    }
    
    this.applyDefaultSorting()
  }

  protected populate(childrenMap: Map<string, TokenTreeElement[]>) {
    const { tree, element } = this
    const children = childrenMap.get(element.id) ?? []

    for (const element of children) {
      const child = new GroupTreeNode(element, tree)
      this.children.push(child)
      if (element instanceof TokenGroup) {
        child.populate(childrenMap)
      }
    }
  }

  private createGroupChild(name: string) {

    return this.addChildGroup(
      new TokenGroup({
        brandId: this.tree.element.brandId,
        tokenType: this.tree.element.tokenType,
        designSystemVersionId: this.tree.element.designSystemVersionId,
        persistentId: uuid(),
        isRoot: false,
        id: undefined,
        meta: {
          name: name,
          description: ''
        },
        childrenIds: []
      })
    )
  }

  addChildGroup(groupElement: TokenTreeElement) {
    const { tree } = this

    // Only groups can be added as children through this
    if ((groupElement instanceof TokenGroup) === false) {
      throw new Error(`Can't add ${groupElement.id} as group, is ${groupElement}`)
    }

    // Add child
    const child = new GroupTreeNode(groupElement, tree)
    this.addChildInternal(child)

    return child
  }

  getOrCreateGroup(path: Array<string>): GroupTreeNode {

    if (path.length === 0) {
      return this
    }

    const [name, ...rest] = path
    let child: GroupTreeNode = this.children.find(c => c.isGroup && c.element.name === name)

    if (!child) {
      child = this.createGroupChild(name)
    }
    return child.getOrCreateGroup(rest)
  }

  // ----------------
  // MARK: - Iterators

  forEach(callback: GroupTreeNodeWalker, leafsFirst = true) {
    this.forEachInternal(callback, [], leafsFirst)
  }

  private forEachInternal(callback: GroupTreeNodeWalker, path: GroupTreeNode[], leafsFirst: boolean) {
    if (!leafsFirst) {
      callback(this, path)
    }
    const newPath = path.concat([this])
    for (const c of this.children) {
      if (c.isGroup) {
        c.forEachInternal(callback, newPath, leafsFirst)
      }
    }
    if (leafsFirst) {
      callback(this, path)
    }
  }
}