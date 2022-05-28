//
//  SDKDTJSONGroupBuilder.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { uuid } from 'uuidv4'
import { Brand, DesignSystemVersion, Token, TokenGroup, TokenType } from '../../..'
import { DTProcessedTokenNode } from './SDKDTJSONConverter'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type DTRootGroupMapping = {
  snType: TokenType
  dtType: string
  snRootName: string
  dtRootName: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility for building token trees */

export class DTJSONGroupBuilder {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  version: DesignSystemVersion
  brand: Brand

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion, brand: Brand) {
    this.version = version
    this.brand = brand
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Tree builder

  /** Create mapping between DT <> SN and assign all tokens into their respective newly created groups */
  constructAllDefinableGroupsTrees(processedNodes: Array<DTProcessedTokenNode>): Array<TokenGroup> {
    
    // Base mapping function
    let mapping: Array<DTRootGroupMapping> = [
      { snType: TokenType.color, dtType: 'color', snRootName: 'Color', dtRootName: 'color' }
    ]

    let groups: Array<TokenGroup> = []
    for (let map of mapping) {
        groups = groups.concat(this.constructGroupTree(processedNodes, map))
    }

    return groups
  }

  /** Create group tree needed to contain entire token tree for particular mapping combination */
  constructGroupTree(processedNodes: Array<DTProcessedTokenNode>, mapping: DTRootGroupMapping): Array<TokenGroup> {

    // Select only nodes with types corresponding to the group
    let nodes = processedNodes.filter(n => n.token.tokenType === mapping.snType)
    let rootGroup = this.createGroup(this.brand.persistentId, this.version.id, mapping.snRootName, mapping.snType, true)

    // Set main root group
    let mappedGroups: Map<string, TokenGroup> = new Map<string, TokenGroup>()
    mappedGroups.set('', rootGroup)

    for (let node of nodes) {
      let key = node.path.join('.')
      this.constructGroupChain(this.version, this.brand, mappedGroups, node.path)
      let group = mappedGroups.get(key)
      group = group.toMutatedObject(group.childrenIds.concat(node.token.id))
      mappedGroups.set(key, group)
    }

    return Array.from(mappedGroups.values())
  }

  constructGroupChain(
    version: DesignSystemVersion,
    brand: Brand,
    groups: Map<string, TokenGroup>,
    path: Array<string>
  ) {
    if (path.length === 0) {
      return
    }

    // Get parent object
    let parentPath = ''
    let parent = groups.get(parentPath)

    let partialPath: Array<string> = []
    for (let segment of path) {
      partialPath.push(segment)
      let partialKey = partialPath.join('.')
      let object = groups.get(partialKey)
      if (object) {
        // Path exists so we don't do anything else
      } else {
        // Path doesn't exist, we create it
        let group = new TokenGroup({
          brandId: brand.persistentId,
          tokenType: TokenType.color,
          designSystemVersionId: version.id,
          persistentId: uuid(),
          isRoot: false,
          id: undefined,
          meta: {
            name: segment,
            description: ''
          },
          childrenIds: []
        })

        // Assign to parent
        parent = parent.toMutatedObject(parent.childrenIds.concat(group.id))
        groups.set(parentPath, parent)
        parent = group

        // Store group
        groups.set(partialKey, group)
        parentPath = partialKey
      }
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Group manipulation

  createGroup(brandId: string, versionId: string, name: string, type: TokenType, isRoot: boolean): TokenGroup {
    return new TokenGroup({
      brandId: brandId,
      tokenType: type,
      designSystemVersionId: versionId,
      persistentId: uuid(),
      isRoot: isRoot,
      id: undefined,
      meta: {
        name: name,
        description: ''
      },
      childrenIds: []
    })
  }
}
