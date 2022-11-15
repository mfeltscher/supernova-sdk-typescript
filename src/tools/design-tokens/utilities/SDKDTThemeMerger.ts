//
//  SDKDTThemeMerger.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ColorToken, DesignSystemVersion, Token } from '../../..'
import { ThemeUtilities } from '../../../model/themes/SDKThemeUtilities'
import { TokenTheme } from '../../../model/themes/SDKTokenTheme'
import { TokenComparator } from '../../../model/tokens/SDKTokenCompator'
import { DTProcessedTokenNode } from './SDKDTJSONConverter'
import { DTTokenMerger } from './SDKDTTokenMerger'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type DTThemeMergeDiff = {
  toUpdate: Array<DTProcessedTokenNode>
  toCreate: Array<DTProcessedTokenNode>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Utility allowing merging of two pools of tokens */
export class DTThemeMerger {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private version: DesignSystemVersion

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion) {

    this.version = version
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merger

  makeTheme(upstreamTokens: Array<Token>, upstreamTheme: TokenTheme, processedNodes: Array<DTProcessedTokenNode>): TokenTheme {

    // Build map of existing tokens using path keys
    let existingOverrides = new Map<string, Token>()
    for (let token of upstreamTheme.overriddenTokens) {
        let key = this.buildKey(this.buildPath(token), token.name)
        existingOverrides.set(key, token)
    }

    let newTokenSet = new Map<string, DTProcessedTokenNode>()
    for (let token of processedNodes) {
        let key = this.buildKey(token.path, token.token.name)
        newTokenSet.set(key, token)
    } 

    // Create theme replica to fill with tokens
    let themeReplica = new TokenTheme({
        persistentId: upstreamTheme.id,
        id: upstreamTheme.versionedId,
        brandId: upstreamTheme.brandId,
        meta: {
            name: upstreamTheme.name,
            description: upstreamTheme.description
        },
        createdAt: upstreamTheme.createdAt ? upstreamTheme.createdAt.toISOString() : undefined,
        updatedAt: upstreamTheme.updatedAt ? upstreamTheme.updatedAt.toISOString() : undefined,
        codeName: upstreamTheme.codeName,
        overrides: [],
        designSystemVersionId: upstreamTheme.designSystemVersionId
    }, {
        id: this.version.id
    } as DesignSystemVersion)

    // Resolve each existing token that belong to the theme
    for (let token of upstreamTokens) {
        let key = this.buildKey(this.buildPath(token), token.name)

        let incomingThemeOverride = newTokenSet.get(key)
        if (incomingThemeOverride) {
            this.replaceIdAcrossAllPossibleReferences(incomingThemeOverride, token.id, processedNodes)
            // console.log(`overriding token from FT for key ${key}`)
            // For any defined override, use the new token, and align its id with the original token, if the token has different value
            if (!TokenComparator.isEqualTokenValue(token, incomingThemeOverride.token)) {
                // console.log(`value is not the same for token ${key}, using override`)
                incomingThemeOverride.token.id = token.id
                themeReplica.overriddenTokens.push(incomingThemeOverride.token)
            } else {
                // console.log(`skipping override`)
                // Otherwise use override that already exists without modifications
                let currentThemeOverride = existingOverrides.get(key)
                if (currentThemeOverride) {
                    // console.log(`overriding token from existing overrides ${key}`)
                    themeReplica.overriddenTokens.push(currentThemeOverride)
                } else {
                    // console.log(`using default value for token ${key}, no override found`)
                }
            }
        } else {
            // Otherwise use override that already exists without modifications
            let currentThemeOverride = existingOverrides.get(key)
            if (currentThemeOverride) {
                // console.log(`overriding token from existing overrides ${key}`)
                themeReplica.overriddenTokens.push(currentThemeOverride)
            } else {
                // console.log(`using default value for token ${key}, no override found`)
            }
        }
    }

    return themeReplica
  }

  replaceIdAcrossAllPossibleReferences(override: DTProcessedTokenNode, newId: string, allTokens: Array<DTProcessedTokenNode>) {

    let currentId = override.token.id
    override.token.id = newId
    for (let token of allTokens) {
        if (token.token instanceof ColorToken) {
            if (token.token.value.referencedToken && token.token.value.referencedToken.id === currentId) {
                token.token.value.referencedToken.id = newId
            }
        }
        // TODO
    }
  }

  buildKey(path: Array<string>, name: string): string {
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
}
