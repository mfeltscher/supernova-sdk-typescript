
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
import { TokenGroup } from "../../model/groups/SDKTokenGroup"
import { Token } from "../../model/tokens/SDKToken"
import _ from "lodash"
import { DTJSONLoader, DTParsedNode } from "./utilities/SDKDTJSONLoader"
import { DTJSONConverter, DTProcessedTokenNode } from "./utilities/SDKDTJSONConverter"
import { DTJSONGroupBuilder } from "./utilities/SDKDTJSONGroupBuilder"
import { DTTokenGroupTreeMerger } from "./utilities/SDKDTTokenGroupTreeMerger"
import { DTTokenMerger } from "./utilities/SDKDTTokenMerger"
import { Brand } from "../../core/SDKBrand"


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
  /** Load token definitions from path */
  /*
  async loadTokensFromPath(path: string): Promise<{
    processedNodes: Array<DTProcessedTokenNode>,
    tokens: Array<Token>,
    groups: Array<TokenGroup>
  }> {
    let loader = new DTJSONLoader()
    let nodes = await loader.loadDSObjectsFromPath(path)
    return this.processTokenNodes(nodes)
  }*/

  /** Load token definitions from a JSON file */
  loadTokensFromDefinition(definition: string): {
    processedNodes: Array<DTProcessedTokenNode>,
    tokens: Array<Token>,
    groups: Array<TokenGroup>
  } {
    let loader = new DTJSONLoader()
    let nodes = loader.loadDSObjectsFromDefinition(definition)
    return this.processTokenNodes(nodes)
  }

  /** Load token definitions from a definition object */
  loadTokensFromObject(definition: object): {
    processedNodes: Array<DTProcessedTokenNode>,
    tokens: Array<Token>,
    groups: Array<TokenGroup>
  } {
    let loader = new DTJSONLoader()
    let nodes = loader.loadDSObjectsFromObject(definition)
    return this.processTokenNodes(nodes)
  }

  private processTokenNodes(nodes: Array<DTParsedNode>): {
    processedNodes: Array<DTProcessedTokenNode>,
    tokens: Array<Token>,
    groups: Array<TokenGroup>
  } {
    let converter = new DTJSONConverter(this.version, this.brand)
    let groupBuilder = new DTJSONGroupBuilder(this.version, this.brand)
    let processedNodes = converter.convertNodesToTokens(nodes)
    let processedGroups = groupBuilder.constructAllDefinableGroupsTrees(processedNodes)
    return {
        processedNodes,
        tokens: processedNodes.map(n => n.token),
        groups: processedGroups
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merging

  /** Loads remote source connected to this tool, then merges tokens and groups with it, creating union. Can optionally write to the source as well */
  async mergeWithRemoteSource(processedNodes: Array<DTProcessedTokenNode>, write: boolean): Promise<{
      tokens: Array<Token>
      groups: Array<TokenGroup>
  }> {
    // Get remote token data
    let upstreamTokenGroups = await this.brand.tokenGroups()
    let upstreamTokens = await this.brand.tokens()

    // Assign correct sorting order to incoming tokens and token groups
    this.correctSortOrder(upstreamTokens, upstreamTokenGroups)

    // Merge trees
    let pack: Array<Token | TokenGroup> = [...upstreamTokens, ...upstreamTokenGroups]
    let treeMerger = new DTTokenGroupTreeMerger()
    let tokenMerger = new DTTokenMerger()
    let tokenMergeResult = tokenMerger.makeTokensDiff(upstreamTokens, processedNodes)
    let result = treeMerger.makeGroupsDiff(tokenMergeResult, pack)

    // Update referenced tokens in group based on the result
    let groups: Array<TokenGroup> = []
    for (let item of result.toCreate) {
      if (item.element instanceof TokenGroup) {
        item.element.childrenIds = item.childrenIds
        groups.push(item.element)
      }
    }
    for (let item of result.toUpdate) {
      if (item.element instanceof TokenGroup) {
        item.element.childrenIds = item.childrenIds
        groups.push(item.element)
      }
    }

    // Synchronize changes if enabled
    let tokensToWrite = processedNodes.map(n => n.token)
    let tokenGroupsToWrite = groups

    if (write) {
      let writer = this.brand.writer()
      await writer.writeTokens(tokenMergeResult.toCreateOrUpdate.map(r => r.token), tokenGroupsToWrite, tokenMergeResult.toDelete.map(r => r.token))
    }

    return {
      tokens: tokensToWrite,
      groups: tokenGroupsToWrite
    }
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
}
