//
//  SDKDTThemeMerger.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from "../../../core/SDKDesignSystemVersion"
import { DTProcessedTokenNode } from "./SDKDTJSONConverter"
import { AnyToken } from "../../../model/tokens/SDKTokenValue"
import { TokenTheme } from "../../../model/themes/SDKTokenTheme"
import { Token } from "../../../model/tokens/SDKToken"
import { TokenComparator } from "../../../model/tokens/SDKTokenCompator"
import { BlurToken, BorderToken, GradientToken, RadiusToken, ShadowToken, TypographyToken } from "../../.."

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

  makeTheme(
    upstreamTokens: Array<Token>,
    upstreamTheme: TokenTheme,
    processedNodes: Array<DTProcessedTokenNode>,
    preciseCopy: boolean = false
  ): TokenTheme {

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

    let tokensInThemeButNotInUpstream = new Map<string, DTProcessedTokenNode>(newTokenSet)

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
        let currentThemeOverride = existingOverrides.get(key)
        tokensInThemeButNotInUpstream.delete(key)

        if (incomingThemeOverride) {
            this.replaceIdAcrossAllPossibleReferences(incomingThemeOverride, token.id, processedNodes)
            // console.log(`overriding token from FT for key ${key}`)
            let incomingThemeDiffersFromBase = !TokenComparator.isEqualTokenValue(token, incomingThemeOverride.token)
            let incomingThemeDiffersFromUpstreamTheme =
                currentThemeOverride && !TokenComparator.isEqualTokenValue(currentThemeOverride, incomingThemeOverride.token)
            // For any defined override, use the new token, and align its id with the original token, if the token has different value
            if (incomingThemeDiffersFromBase) {
                // console.log(`value is not the same for token ${key}, using override`)
                incomingThemeOverride.token.id = token.id
                themeReplica.overriddenTokens.push(incomingThemeOverride.token)
            } else if (incomingThemeDiffersFromUpstreamTheme) {
                // base same as incoming theme, but differs from existing theme => we should remove override completely
            } else {
                // console.log(`skipping override`)
                // Otherwise use override that already exists without modifications
                if (currentThemeOverride) {
                    // console.log(`overriding token from existing overrides ${key}`)
                    themeReplica.overriddenTokens.push(currentThemeOverride)
                } else {
                    // console.log(`using default value for token ${key}, no override found`)
                }
            }
        } else {
            // Otherwise use override that already exists without modifications
            // Unless preciseCopy = true and we need to remove currentThemeOverride
            if (currentThemeOverride && !preciseCopy) {
                // console.log(`overriding token from existing overrides ${key}`)
                themeReplica.overriddenTokens.push(currentThemeOverride)
            } else {
                // console.log(`using default value for token ${key}, no override found`)
            }
        }
    }

    // Process tokens that were not in upstream, but are referenced in this theme
    this.inlineTokens(themeReplica, tokensInThemeButNotInUpstream)

    return themeReplica
  }

  inlineTokens(themeReplica: TokenTheme, tokensInThemeButNotInUpstream: Map<string, DTProcessedTokenNode>) {
    let idsCandidates = [...tokensInThemeButNotInUpstream.values()]
    let themeOverrideRefs = themeReplica.overriddenTokens
        .map(t => (t as AnyToken).value?.referencedToken?.id)
        .filter(Boolean)
    let candidates = idsCandidates.filter(c => themeOverrideRefs.includes(c.token.id))

    for (let candidate of candidates) {
        for (let override of themeReplica.overriddenTokens) {
            let token = (override as AnyToken)
            if (token && token.value.referencedToken?.id === candidate.token.id) {
                // Do we need to copy something else apart from value?
                token.value = (candidate.token as AnyToken).value
            }
        }
    }
}

  replaceIdAcrossAllPossibleReferences(override: DTProcessedTokenNode, newId: string, allTokens: Array<DTProcessedTokenNode>) {

    let currentId = override.token.id
    override.token.id = newId
    for (let t of allTokens) {
        let token = t.token as AnyToken
        // Generic check for reference
        if (token.value.referencedToken && token.value.referencedToken.id === currentId) {
            token.value.referencedToken.id = newId
        }

        // Specific checks for tokens that can reference other values internally
        if (token instanceof TypographyToken) {
            if (token.value.font?.referencedToken && token.value.font?.referencedToken?.id === currentId) {
                token.value.font.referencedToken.id = newId
            }
            if (token.value.fontSize?.referencedToken && token.value.fontSize?.referencedToken?.id === currentId) {
                token.value.fontSize.referencedToken.id = newId
            }
            if (token.value.letterSpacing?.referencedToken && token.value.letterSpacing?.referencedToken?.id === currentId) {
                token.value.letterSpacing.referencedToken.id = newId
            }
            if (token.value.lineHeight?.referencedToken && token.value.lineHeight?.referencedToken?.id === currentId) {
                token.value.lineHeight.referencedToken.id = newId
            }
            if (token.value.paragraphIndent?.referencedToken && token.value.paragraphIndent?.referencedToken?.id === currentId) {
                token.value.paragraphIndent.referencedToken.id = newId
            }
            if (token.value.paragraphSpacing?.referencedToken && token.value.paragraphSpacing?.referencedToken?.id === currentId) {
                token.value.paragraphSpacing.referencedToken.id = newId
            }
        } else if (token instanceof RadiusToken) {
            if (token.value.radius?.referencedToken && token.value.radius?.referencedToken?.id === currentId) {
                token.value.radius.referencedToken.id = newId
            }
            if (token.value.topLeft?.referencedToken && token.value.topLeft?.referencedToken?.id === currentId) {
                token.value.topLeft.referencedToken.id = newId
            }
            if (token.value.topRight?.referencedToken && token.value.topRight?.referencedToken?.id === currentId) {
                token.value.topRight.referencedToken.id = newId
            }
            if (token.value.bottomLeft?.referencedToken && token.value.bottomLeft?.referencedToken?.id === currentId) {
                token.value.bottomLeft.referencedToken.id = newId
            }
            if (token.value.bottomRight?.referencedToken && token.value.bottomRight?.referencedToken?.id === currentId) {
                token.value.bottomRight.referencedToken.id = newId
            }
        } else if (token instanceof ShadowToken) {
            if (token.value.color?.referencedToken && token.value.color?.referencedToken?.id === currentId) {
                token.value.color.referencedToken.id = newId
            }
            if (token.value.x?.referencedToken && token.value.x?.referencedToken?.id === currentId) {
                token.value.x.referencedToken.id = newId
            }
            if (token.value.y?.referencedToken && token.value.y?.referencedToken?.id === currentId) {
                token.value.y.referencedToken.id = newId
            }
            if (token.value.radius?.referencedToken && token.value.radius?.referencedToken?.id === currentId) {
                token.value.radius.referencedToken.id = newId
            }
            if (token.value.spread?.referencedToken && token.value.spread?.referencedToken?.id === currentId) {
                token.value.spread.referencedToken.id = newId
            }
        } else if (token instanceof BorderToken) {
            if (token.value.color?.referencedToken && token.value.color?.referencedToken?.id === currentId) {
                token.value.color.referencedToken.id = newId
            }
            if (token.value.width?.referencedToken && token.value.width?.referencedToken?.id === currentId) {
                token.value.width.referencedToken.id = newId
            }
        } else if (token instanceof GradientToken) {
            for (let stop of token.value.stops) {
                if (stop.color?.referencedToken && stop.color?.referencedToken?.id === currentId) {
                    stop.color.referencedToken.id = newId
                }
            }
        } else if (token instanceof BlurToken) {
            if (token.value.radius?.referencedToken && token.value.radius?.referencedToken?.id === currentId) {
                token.value.radius.referencedToken.id = newId
            }
        } 
    }
  }

  buildKey(path: Array<string>, name: string): string {
    
    return [...path, name].join('/').toLowerCase().replace(" ", "-").replace("(", "").replace(")", "")
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
