//
//  SDKDesignComponentGroupResolver.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignComponent } from "../../model/components/SDKDesignComponent"
import { DesignComponentGroup, DesignComponentGroupRemoteModel } from "../../model/groups/SDKDesignComponentGroup"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class DesignComponentGroupResolver {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  designComponents: Array<DesignComponent>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(designComponents: Array<DesignComponent>) {
      this.designComponents = designComponents
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Resolution

  async resolveGroupData(data: Array<DesignComponentGroupRemoteModel>): Promise<Array<DesignComponentGroup>> {
    var hashedGroups = new Map<string, DesignComponentGroupRemoteModel>()
    var resolvedGroups = new Map<string, DesignComponentGroup>()

    // Convert raw groups to resolved groups, not caring about the references just yet
    for (let rawGroup of data) {
      let group = new DesignComponentGroup(rawGroup)
      hashedGroups.set(rawGroup.persistentId, rawGroup)
      resolvedGroups.set(rawGroup.persistentId, group)
    }

    // Build the reference tree and list of designComponents
    for (let rawGroup of data) {
      let filteredDesignComponentIds = new Array<string>()
      let referencedGroup = resolvedGroups.get(rawGroup.persistentId)
      for (let id of rawGroup.childrenIds) {
        // Find if reference is group - if it is not, it is a designComponent
        let childGroup = resolvedGroups.get(id)
        if (childGroup) {
          referencedGroup.addChild(childGroup)
        } else {
            // Note: All designComponents are valid. In case of asset tree however, only some are valid
            // Here, we don't filter out anything
            filteredDesignComponentIds.push(id)
        }
      }
      referencedGroup.componentIds = filteredDesignComponentIds
    }

    // Retrieve resolved groups
    let groups = Array.from(resolvedGroups.values())
    this.recomputePaths(groups)
    this.recomputeParents(groups)
    return this.reorderGroupsByRoots(groups)
  }

  private recomputePaths(groups: Array<DesignComponentGroup>) {
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

  private recomputePathsFromRoot(root: DesignComponentGroup, segments: Array<string>) {
    // Recursively go down the tree(s) and add segments to each
    let extendedPath = segments.concat(root.name)
    for (let group of root.subgroups) {
      group.path = extendedPath.concat()
      this.recomputePathsFromRoot(group, extendedPath)
    }
  }

  private reorderGroupsByRoots(groups: Array<DesignComponentGroup>): Array<DesignComponentGroup> {
    let sortedGroups = new Array<DesignComponentGroup>()

    // Find the root groups, which will be initial sorting points
    let roots = groups.filter(g => g.isRoot)
    for (const root of roots) {
      // For each group, traverse and add proper order
      sortedGroups = sortedGroups.concat(this.traverseSortGroup(root))
    }

    return sortedGroups
  }

  private traverseSortGroup(group: DesignComponentGroup): Array<DesignComponentGroup> {
    let output = new Array<DesignComponentGroup>()
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

  private recomputeParents(groups: Array<DesignComponentGroup>) {
    // Find roots, and compute the references down the chain. Root groups don't have parents
    for (let group of groups) {
      if (group.isRoot) {
        this.recomputeParentsFromRoot(group)
        group.parent = null
      }
    }
  }

  private recomputeParentsFromRoot(rootGroup: DesignComponentGroup) {
    for (let group of rootGroup.subgroups) {
      group.setParent(rootGroup)
      this.recomputeParentsFromRoot(group)
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Authenticated data fetching
}
