//
//  SDKTokenGroupResolver.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenGroup, TokenGroupRemoteModel } from "../../model/groups/SDKTokenGroup"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class TokenGroupResolver {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Resolution

  async resolveGroupData(data: Array<TokenGroupRemoteModel>): Promise<Array<TokenGroup>> {
    var hashedGroups = new Map<string, TokenGroupRemoteModel>()
    var resolvedGroups = new Map<string, TokenGroup>()

    // Convert raw groups to resolved groups, not caring about the references just yet
    for (let rawGroup of data) {
      let group = new TokenGroup(rawGroup)
      hashedGroups.set(rawGroup.persistentId, rawGroup)
      resolvedGroups.set(rawGroup.persistentId, group)
    }

    // Build the reference tree and list of tokens
    for (let rawGroup of data) {
      let filteredTokenIds = new Array<string>()
      let referencedGroup = resolvedGroups.get(rawGroup.persistentId)
      for (let id of rawGroup.childrenIds) {
        // Find if reference is group - if it is not, it is a token
        let childGroup = resolvedGroups.get(id)
        if (childGroup) {
          referencedGroup.addChild(childGroup)
        } else {
          filteredTokenIds.push(id)
        }
      }
      referencedGroup.tokenIds = filteredTokenIds
    }

    // Retrieve resolved groups
    let groups = Array.from(resolvedGroups.values())
    this.recomputePaths(groups)
    this.recomputeParents(groups)
    return this.reorderGroupsByRoots(groups)
  }

  private recomputePaths(groups: Array<TokenGroup>) {
    // Find roots, and compute the segments down from the roots
    for (let group of groups) {
      if (group.isRoot) {
        this.recomputePathsFromRoot(group, [])
      }
    }
    // Drop first item because we don't want the core root category to be there
    for (let group of groups) {
      group.path.shift()
    }
  }

  private recomputePathsFromRoot(root: TokenGroup, segments: Array<string>) {
    // Recursively go down the tree(s) and add segments to each
    let extendedPath = segments.concat(root.name)
    for (let group of root.subgroups) {
      group.path = extendedPath.concat()
      this.recomputePathsFromRoot(group, extendedPath)
    }
  }

  private reorderGroupsByRoots(groups: Array<TokenGroup>): Array<TokenGroup> {
    let sortedGroups = new Array<TokenGroup>()

    // Find the root groups, which will be initial sorting points
    let roots = groups.filter(g => g.isRoot)
    for (const root of roots) {
      // For each group, traverse and add proper order
      sortedGroups = sortedGroups.concat(this.traverseSortGroup(root))
    }

    return sortedGroups
  }

  private traverseSortGroup(group: TokenGroup): Array<TokenGroup> {
    let output = new Array<TokenGroup>()
    // Iterated group always first
    output.push(group)

    // Add sorted groups to the array
    let sortedGroups = group.subgroups.sort(
      (g1, g2) => group.childrenIds.indexOf(g1.id) - group.childrenIds.indexOf(g2.id)
    )

    for (let subgroup of sortedGroups) {
      output = output.concat(this.traverseSortGroup(subgroup))
    }

    return output
  }

  private recomputeParents(groups: Array<TokenGroup>) {
    // Find roots, and compute the references down the chain. Root groups don't have parents
    for (let group of groups) {
      if (group.isRoot) {
        this.recomputeParentsFromRoot(group)
        group.parent = null
      }
    }
  }

  private recomputeParentsFromRoot(rootGroup: TokenGroup) {
    for (let group of rootGroup.subgroups) {
      group.setParent(rootGroup)
      this.recomputeParentsFromRoot(group)
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Authenticated data fetching
}
