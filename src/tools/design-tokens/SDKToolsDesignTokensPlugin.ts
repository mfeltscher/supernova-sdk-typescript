
//
//  SDKToolsDesignTokensPlugin.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from "../../core/SDKDesignSystemVersion"
import { Supernova } from "../../core/SDKSupernova"
import { TokenType } from "../../model/enums/SDKTokenType"
import { TokenGroup } from "../../model/groups/SDKTokenGroup"
import { Token } from "../../model/tokens/SDKToken"
import _ from "lodash"
import { Brand } from "../.."
import { TokenWriteResponse } from "../../core/SDKBrandWriter"
import { DTJSONLoader } from "./utilities/SDKDTJSONLoader"
import { DTJSONConverter } from "./utilities/SDKDTJSONConverter"
import { DTJSONGroupBuilder } from "./utilities/SDKDTJSONGroupBuilder"
import { DTTokenTreeMerger } from "./utilities/SDKDTTokenTreeMerger"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Design Tokens Plugin Manipulation Tool */
export class SupernovaToolsDesignTokensPlugin {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private instance: Supernova
  private version: DesignSystemVersion
  private brand: Brand
  private sortMultiplier: number = 100


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(instance: Supernova, version: DesignSystemVersion, brand: Brand) {
    this.instance = instance
    this.version = version
    this.brand = brand
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Loader

  /** Load token definitions from multiple sources */
  /*
  async loadTokensFromDefinitions(definitions: Array<string>): Promise<{
      tokens: Array<Token>
      groups: Array<TokenGroup>
  }> {

    for (let definition of definitions) {
        let result = this.loadTokensFromDefinition(definition)
    }
    throw new Error("Not implemented")
  }
  */

  /** Load token definitions from */
  async loadTokensFromDefinition(definition: string): Promise<{
    tokens: Array<Token>
    groups: Array<TokenGroup>
  }> {
    let loader = new DTJSONLoader()
    let converter = new DTJSONConverter(this.version, this.brand)
    let groupBuilder = new DTJSONGroupBuilder(this.version, this.brand)

    let nodes = await loader.loadDSObjectsFromDefinition(definition)
    let processedNodes = await converter.convertNodesToTokens(nodes)
    let processedGroups = await groupBuilder.constructAllDefinableGroupsTrees(processedNodes)
    
    return {
        tokens: processedNodes.map(n => n.token),
        groups: processedGroups
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merging

  /** Loads remote source connected to this tool, then merges tokens and groups with it, creating union. Can optionally write to the source as well */
  async mergeWithRemoteSource(tokens: Array<Token>, tokenGroups: Array<TokenGroup>, write: boolean): Promise<{
      tokens: Array<Token>
      groups: Array<TokenGroup>
  }> {
    // Get remote token data
    let upstreamTokens = await this.brand.tokens()
    let upstreamTokenGroups = await this.brand.tokenGroups()

    // Assign correct sorting order to incoming tokens and token groups
    this.correctSortOrder(upstreamTokens, upstreamTokenGroups)

    // Merge trees
    let pack: Array<Token | TokenGroup> = [...upstreamTokens, ...upstreamTokenGroups]
    let merger = new DTTokenTreeMerger()
    let result = merger.makeGroupsDiff({
      toCreateOrUpdate: tokens,
      toCreate: [],
      toDelete: [],
      toUpdate: []
    }, 
    pack)

    console.log(result)
    console.log(result.toUpdate)
    
    throw new Error("Not implemented")
  }

  correctSortOrder(tokens: Array<Token>, tokenGroups: Array<TokenGroup>) {

    // Build maps so lookup is faster
    let tokenMap = new Map<string, Token>()
    let groupMap = new Map<string, TokenGroup>()
    tokens.forEach(t => tokenMap.set(t.id, t))
    tokenGroups.forEach(g => groupMap.set(g.id, g))

    // Correct order for each root
    let roots = tokenGroups.filter(g => g.isRoot)
    roots.forEach(r => this.correctSortOrderFromTypeRoot(r, tokenMap, groupMap))
  }

  correctSortOrderFromTypeRoot(root: TokenGroup, tokenMap: Map<string, Token>, groupMap: Map<string, TokenGroup>) {

    let ids = this.flattenedIdsFromRoot(root, tokenMap, groupMap)
    for (let i = 0; i < ids.length; i++) {
      let element = tokenMap.get(ids[i]) ?? groupMap.get(ids[i])
      element.sortOrder = i * this.sortMultiplier
    }
  }

  flattenedIdsFromRoot(root: TokenGroup, tokenMap: Map<string, Token>, groupMap: Map<string, TokenGroup>): Array<string> {

    let result: Array<string> = [root.id]
    let ids = root.childrenIds
    for (let id of ids) {
      result.push(id)
      let tokenGroup = groupMap.get(id)
      if (tokenGroup) {
        result = result.concat(this.flattenedIdsFromRoot(tokenGroup, tokenMap, groupMap))
      } else {
        let token = tokenMap.get(id)
        if (token) {
          result.push(id)
        } else {
          throw new Error(`Unable to find token or group ${id} of type ${root.tokenType}`)
        }
      }
    }

    return result
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  private async writeToRemoteSource(tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Promise<boolean> {

    let writer = this.brand.writer()
    await writer.writeTokens(tokens, tokenGroups)
    return true
  }
}
