//
//  SDKToolsDesignTokensPluginTokenTreeMerger.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Token, TokenGroup } from '../../..'
import { SupernovaError } from '../../../core/errors/SDKSupernovaError'


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility allowing merging of two distinct token trees */

export class DTTokenTreeMerger {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties
  
    existingTokens: Array<Token>
    existingGroups: Array<TokenGroup>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(existingTokens: Array<Token>, existingGroups: Array<TokenGroup>) {

    this.existingTokens = existingTokens
    this.existingGroups = existingGroups
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merger

  /** Merge existing trees with new tokens and groups, so the diff can be written */
  merge(newTokens: Array<Token>, newGroups: Array<TokenGroup>): Promise<{
      mergedTokens: Array<Token>,
      mergedGroups: Array<TokenGroup>
  }> {
    throw new Error("Not implemented yet")
  }


  createRootGroups(brandId: string, versionId: string): Array<TokenGroup> {

    let mapping: Array<DTRootNodeDefinition> = [
      {
        name: "Colors",
        type: TokenType.color
      }
    ]
    
    let roots = new Array<TokenGroup>()
    for (let map of mapping) {
      let rootGroup = this.createGroup(brandId, versionId, map.name, map.type, true)
      roots.push(rootGroup)
    }

    return roots
  }

  convertNodesOfSpecificTypeToTokens(nodes: Array<DTParsedNode>, type: TokenType): Array<DTProcessedTokenNode> {

  }

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
        description: ""
      },
      childrenIds: []
    })
  }
}


/*
function constructTokens(version: DesignSystemVersion, brand: Brand, root: TokenGroup, definitions: Array<{
    name: string
    path: Array<string>
    color: string
}>): {
    tokens: Array<Token>
    tokenGroups: Array<TokenGroup>
} {

    let tokens = new Array<Token>()

    // Set main root group
    let mappedGroups: Map<string, TokenGroup> = new Map<string, TokenGroup>()
    mappedGroups.set("", root)

    for (let definition of definitions) {
        let groupKey = definition.path.join(".")
        let constructedToken = ColorToken.create(version, brand, definition.name, "", definition.color, undefined)
        tokens.push(constructedToken)
        constructGroupChain(version, brand, mappedGroups, definition.path)
        let group = mappedGroups.get(groupKey)
        group = group.toMutatedObject(group.childrenIds.concat(constructedToken.id))
        mappedGroups.set(groupKey, group)
    }

    return {
        tokens: tokens,
        tokenGroups: Array.from(mappedGroups.values()),
    }
}


function constructGroupChain(version: DesignSystemVersion, brand: Brand, groups: Map<string, TokenGroup>, path: Array<string>) {

    if (path.length === 0) {
        return
    }

    // Get parent object
    let parentPath = ""
    let parent = groups.get(parentPath)

    let partialPath: Array<string> = []
    for (let segment of path) {
        partialPath.push(segment)
        let partialKey = partialPath.join(".")
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
                  description: ""
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
}*/