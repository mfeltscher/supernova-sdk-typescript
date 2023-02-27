//
//  SDKDTMapResolver.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from '../../../core/SDKDesignSystemVersion'
import { DTParsedNode, DTParsedTheme, DTParsedThemeSetPriority, DTParsedTokenSet } from './SDKDTJSONLoader'
import { DTPluginToSupernovaMap } from './SDKDTMapLoader'
import { DTTokenMerger } from './SDKDTTokenMerger'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility to resolve token maps */
export class DTMapResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private version: DesignSystemVersion

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion) {
    this.version = version
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Conversion

  mappedNodePools(
    map: DTPluginToSupernovaMap,
    themes: Array<DTParsedTheme>,
    sets: Array<DTParsedTokenSet>
  ): DTPluginToSupernovaMap {
    // Remap for performance
    let setMap = new Map<string, DTParsedTokenSet>()
    for (let set of sets) {
      setMap.set(set.id, set)
    }

    // Resolve which sets we need to use
    let tokenSetToUse = new Array<DTParsedTokenSet>()
    if ((map.pluginSets && map.pluginTheme) || (!map.pluginSets && !map.pluginTheme)) {
      throw new Error(`Either token theme or token set should be defined in the mapping`)
    }
    else if (map.pluginSets) {
      for (let pluginSet of map.pluginSets) {
        let set = setMap.get(pluginSet)
        if (!set) {
          throw new Error(`Mapping references token set '${pluginSet}' that wasn't defined in the sourced data`)
        }
        tokenSetToUse.push(set)
      }
    } else if (map.pluginTheme) {
      let theme = themes.find(t => t.id === map.pluginTheme || t.name === map.pluginTheme)
      if (!theme) {
        throw new Error(`Incorrect plugin theme ${map.pluginTheme} referenced by the mapping.\n\nAvailable plugin themes are: [${themes.map(t => t.name)}]\nYou can also use any of loaded sets: [${sets.map(s => s.name)}]`)
      }
      // Find if there is a source first
      for (let pair of theme.selectedTokenSets) {
        if (pair.priority === DTParsedThemeSetPriority.source) {
          let set = setMap.get(pair.set.id)
          if (!set) {
            throw new Error(`Incorrect plugin set ${pair.set.id} referenced by the mapping.\n\nAvailable plugin sets are: [${sets.map(s => s.name)}]\nYou can also use any of loaded themes: [${themes.map(t => t.name)}]`)
          }
          tokenSetToUse.push(set)
        }
      }

      // Find other enabled sources
      for (let pair of theme.selectedTokenSets) {
        if (pair.priority === DTParsedThemeSetPriority.enabled) {
          let set = setMap.get(pair.set.id)
          if (!set) {
            throw new Error(`Incorrect plugin set ${pair.set.id} referenced by the mapping.\n\nAvailable plugin sets are: [${sets.map(s => s.name)}]\nYou can also use any of loaded themes: [${themes.map(t => t.name)}]`)
          }
          tokenSetToUse.push(set)
        }
      }
    }

    // Compute unique nodes based on the set combination provided, and retrieve enhanced map
    let uniqueNodes = this.computeUniqueNodesFromSets(tokenSetToUse)
    map.nodes = uniqueNodes
    return map
  }

  private computeUniqueNodesFromSets(sets: Array<DTParsedTokenSet>): Array<DTParsedNode> {
    // This method will compute unique nodes based on the created key for the node.
    // If some sets override previous nodes, they'll be overriden, otherwise union is constructed.
    // There can always only be a single path-unique node, the last one applied from all overrides
    let uniqueNodes = new Map<string, DTParsedNode>()
    for (let set of sets) {
      for (let node of set.contains) {
        let key = DTTokenMerger.buildKey(node.path, node.name)
        uniqueNodes.set(key, node)
      }
    }

    return Array.from(uniqueNodes.values())
  }
}
