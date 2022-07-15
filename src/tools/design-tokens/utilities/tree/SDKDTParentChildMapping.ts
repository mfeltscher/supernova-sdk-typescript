//
//  SDKDTParentChildMapping.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenGroup } from "../../../../model/groups/SDKTokenGroup"
import { TokenTreeElement } from "./SDKDTGroupTreeNode"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export const MAX_SORT_ORDER = 1000 * 1000 * 100
const LAST = MAX_SORT_ORDER + 1

const sortOrderComparator = (a: TokenTreeElement, b: TokenTreeElement) => (a.sortOrder ?? LAST) - (b.sortOrder ?? LAST);


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Implementation

export function buildParentChildrenMap(elements: TokenTreeElement[]) {
    const parentIdToChildren = new Map<string, TokenTreeElement[]>();
    const put = (element: TokenTreeElement) => {
        if (!(element instanceof TokenGroup && element.isRoot)) {
            const parentId = element.parent?.id
            const arr = parentIdToChildren.get(parentId)
            if (arr) {
                arr.push(element)
            } else {
                parentIdToChildren.set(parentId, [element])
            }
        }
    }

    for (const e of elements) {
        put(e)
    }

    const sortedChildrenMap = new Map<string, TokenTreeElement[]>();

    for (const [groupId, children] of parentIdToChildren) {
        children.sort(sortOrderComparator)
        sortedChildrenMap.set(groupId, children)
    }

    // fill empty groups data
    for (const possibleGroup of elements) {
        if (possibleGroup instanceof TokenGroup) {
            const key = possibleGroup.id
            if (!sortedChildrenMap.has(key)) {
                sortedChildrenMap.set(key, [])
            }
        }
    }

    return {
        childrenMap: sortedChildrenMap
    }
}