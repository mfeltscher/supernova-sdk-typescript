//
//  SDKToolsDesignTokensPlugin.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { TokenGroup } from '../../model/groups/SDKTokenGroup'
import { Token } from '../../model/tokens/SDKToken'
import _ from 'lodash'
import { DTJSONLoader, DTParsedNode, DTParsedTheme, DTParsedTokenSet } from './utilities/SDKDTJSONLoader'
import { DTJSONConverter, DTProcessedTokenNode } from './utilities/SDKDTJSONConverter'
import { DTJSONGroupBuilder } from './utilities/SDKDTJSONGroupBuilder'
import { DTTokenGroupTreeMerger } from './utilities/SDKDTTokenGroupTreeMerger'
import { DTTokenMerger } from './utilities/SDKDTTokenMerger'
import { Brand } from '../../core/SDKBrand'
import { DTMapResolver } from './utilities/SDKDTMapResolver'
import { TokenTheme } from '../../model/themes/SDKTokenTheme'
import { DTThemeMerger } from './utilities/SDKDTThemeMerger'
import { DTMapLoader, DTPluginToSupernovaMapPack } from './utilities/SDKDTMapLoader'
import { DTJSONParser } from './utilities/SDKDTJSONParser'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type SupernovaToolsDesignTokensLoadingResult = {
  processedNodes: Array<DTProcessedTokenNode>
  tokens: Array<Token>
  groups: Array<TokenGroup>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Design Tokens Plugin Manipulation Tool */
export class SupernovaToolsDesignTokensPlugin {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private version: DesignSystemVersion
  private sortMultiplier: number = 100

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion) {
    this.version = version
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Primary synchronization

  /** Synchronizes tokens with specified version of design system using all JSONs in a specific directory. Will load mapping configuration from the provided mapping file path as well. */
  async synchronizeTokensFromDirectory(directoryPath: string, mappingPath: string): Promise<boolean> {
    // Load mapping from file
    let mapLoader = new DTMapLoader()
    let mapping = await mapLoader.loadFromPath(mappingPath)

    // Load data from path, and construct the final object
    let jsonLoader = new DTJSONLoader()
    let data = await jsonLoader.loadDSObjectsFromTokenFileDirectory(directoryPath)
    return this.synchronizeTokensFromData(data, mapping)
  }

  /** Synchronizes tokens with specified version of design system from the tokens file provided. Will load mapping configuration from the provided mapping file path as well. */
  async synchronizeTokensFromFile(filePath: string, mappingPath: string): Promise<boolean> {
    // Load mapping from file
    let mapLoader = new DTMapLoader()
    let mapping = await mapLoader.loadFromPath(mappingPath)

    // Load data from provided file and retrieve the data
    let jsonLoader = new DTJSONLoader()
    let data = await jsonLoader.loadDSObjectsFromTokenFile(filePath)
    return this.synchronizeTokensFromData(data, mapping)
  }

  async synchronizeTokensFromData(data: object, mapping: DTPluginToSupernovaMapPack): Promise<boolean> {
    // Fetch brand and themes
    let brands = await this.version.brands()
    let themes = await this.version.themes()

    // Parse data from object
    let parser = new DTJSONParser()
    let parsedData = await parser.processPluginDataRepresentation(data)

    // Post process the data
    this.processTokenNodes(parsedData, mapping, brands)

    for (let map of mapping) {
      // First, process default values for tokens, for each brand, separately, skipping themes as they need to be created later
      if (map.bindToTheme) {
        continue
      }
      // Find the destination brand
      let brand = brands.find(b => b.persistentId === map.bindToBrand)
      if (!brand) {
        throw new Error(`Unknown brand ${map.bindToBrand} provided in binding`)
      }
      await this.mergeWithRemoteSource(map.processedNodes, brand, true)
      console.log(`Finished map synchronization: Synchronized base tokens for brand ${brand.name}`)
    }

    for (let map of mapping) {
      // Merge all remaining themes
      if (!map.bindToTheme) {
        continue
      }
      // Find the destination brand
      let brand = brands.find(b => b.persistentId === map.bindToBrand)
      if (!brand) {
        throw new Error(`Unknown brand ${map.bindToBrand} provided in binding`)
      }
      // Find the destination theme
      let theme = themes.find(t => t.id === map.bindToTheme)
      if (!theme) {
        throw new Error(`Unknown theme provided in binding`)
      }
      await this.mergeThemeWithRemoteSource(map.processedNodes, brand, theme, true)
      console.log(
        `Finished map synchronization: Synchronized themed tokens for brand ${brand.name}, theme ${theme.name}`
      )
    }

    return true
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Data processing

  private processTokenNodes(
    parseResult: { nodes: Array<DTParsedNode>; themes: Array<DTParsedTheme>; sets: Array<DTParsedTokenSet> },
    mapping: DTPluginToSupernovaMapPack,
    brands: Array<Brand>
  ): DTPluginToSupernovaMapPack {
    // Create base objects
    let mapResolver = new DTMapResolver(this.version)

    // Resolve each theme or set separately
    for (let map of mapping) {
      let resolvedMap = mapResolver.mappedNodePools(map, parseResult.themes, parseResult.sets)
      if (!resolvedMap.nodes) {
        throw new Error("Resolved map doesn't contain resulting nodes")
      }
    }

    for (let map of mapping) {
      // Find appropriate brand
      let brand = brands.find(b => b.persistentId === map.bindToBrand)

      if (!brand) {
        throw new Error(`Unknown brand ${map.bindToBrand} provided in binding`)
      }
      let converter = new DTJSONConverter(this.version, mapping)
      let groupBuilder = new DTJSONGroupBuilder(this.version, mapping)

      let processedNodes = converter.convertNodesToTokens(map.nodes, brand)
      let processedGroups = groupBuilder.constructAllDefinableGroupsTrees(processedNodes, brand)
      map.processedNodes = processedNodes
      map.processedGroups = processedGroups

      console.log(`:: COMPLETED CONVERSION RESULT OF SINGULAR MAP:`)
      console.log(`-----------`)
      console.log(`Processed nodes: ${processedNodes.length}`)
      console.log(`Processed groups: ${processedGroups.length}`)
      console.log(`-----------`)
    }
    return mapping
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merging

  /** Loads remote source connected to this tool, then merges tokens and groups with it, creating union. Can optionally write to the source as well */
  async mergeWithRemoteSource(
    processedNodes: Array<DTProcessedTokenNode>,
    brand: Brand,
    write: boolean
  ): Promise<{
    tokens: Array<Token>
    groups: Array<TokenGroup>
  }> {
    // Get remote token data
    let upstreamTokenGroups = await brand.tokenGroups()
    let upstreamTokens = await brand.tokens()

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

    console.log(`:: COMPLETED MERGE OF TREES OF SINGULAR MAP:`)
    console.log(`-----------`)
    console.log(`Writing token groups: ${tokenGroupsToWrite.length}`)
    console.log(`-----------`)

    if (write) {
      let writer = brand.writer()
      await writer.writeTokens(
        tokenMergeResult.toCreateOrUpdate.map(r => r.token),
        tokenGroupsToWrite,
        tokenMergeResult.toDelete.map(r => r.token)
      )
    }

    console.log(`:: COMPLETED REMOTE SYNC:`)
    console.log(`-----------`)
    console.log(`Merge result (to create): ${tokenMergeResult.toCreate.length}`)
    console.log(`Merge result (to create or update): ${tokenMergeResult.toCreateOrUpdate.length}`)
    console.log(`Merge result (to delete): ${tokenMergeResult.toDelete.length}`)
    console.log(`Merge result (to update): ${tokenMergeResult.toUpdate.length}`)
    console.log(`-----------`)

    return {
      tokens: tokensToWrite,
      groups: tokenGroupsToWrite
    }
  }

  /** Loads remote source connected to this tool, then creates the diff from the base tree and updates the associated theme. Can optionally write to the source as well */
  async mergeThemeWithRemoteSource(
    processedNodes: Array<DTProcessedTokenNode>,
    brand: Brand,
    theme: TokenTheme,
    write: boolean
  ): Promise<{
    theme: TokenTheme
  }> {
    // Get remote token data
    let upstreamTokens = await brand.tokens()
    let upstreamTheme = theme

    let themeMerger = new DTThemeMerger(this.version)
    let themeMergerResult = themeMerger.makeTheme(upstreamTokens, upstreamTheme, processedNodes)

    if (write) {
      let writer = brand.writer()
      await writer.writeTheme(themeMergerResult)
    }

    console.log(`:: COMPLETED REMOTE SYNC:`)
    console.log(`-----------`)
    console.log(`Merge result (theme overrides): ${themeMergerResult.overriddenTokens.length}`)
    console.log(`-----------`)

    return {
      theme: theme
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

  flattenedIdsFromRoot(
    root: TokenGroup,
    tokenMap: Map<string, Token>,
    groupMap: Map<string, TokenGroup>
  ): Array<string> {
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
