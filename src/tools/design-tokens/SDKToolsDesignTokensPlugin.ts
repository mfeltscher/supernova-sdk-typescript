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
import { DTTokenMergeDiff, DTTokenMerger } from './utilities/SDKDTTokenMerger'
import { Brand } from '../../core/SDKBrand'
import { DTMapResolver } from './utilities/SDKDTMapResolver'
import { TokenTheme } from '../../model/themes/SDKTokenTheme'
import { DTThemeMerger } from './utilities/SDKDTThemeMerger'
import { DTMapLoader, DTPluginToSupernovaMap, DTPluginToSupernovaMapPack, DTPluginToSupernovaSettings } from './utilities/SDKDTMapLoader'
import { DTJSONParser } from './utilities/SDKDTJSONParser'
import { SourceType } from '../../model/enums/SDKSourceType'
import { Source } from '../../model/support/SDKSource'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type SupernovaToolsDesignTokensLoadingResult = {
  processedNodes: Array<DTProcessedTokenNode>
  tokens: Array<Token>
  groups: Array<TokenGroup>
}

export type SupernovaToolsDesignTokensResult = {
  map: Pick<DTPluginToSupernovaMap, 'bindToBrand' | 'bindToTheme' | 'pluginSets' | 'pluginTheme' | 'type'>
  tokensCreated: Array<string>;
  tokensUpdated: Array<string>;
  tokensDeleted: Array<string>;
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
    let configuration = await mapLoader.loadFromPath(mappingPath)

    // Load data from path, and construct the final object
    let jsonLoader = new DTJSONLoader()
    let data = await jsonLoader.loadDSObjectsFromTokenFileDirectory(directoryPath, mappingPath)
    return this.synchronizeTokensFromData(data, configuration.mapping, configuration.settings)
  }

  /** Synchronizes tokens with specified version of design system from the tokens file provided. Will load mapping configuration from the provided mapping file path as well. */
  async synchronizeTokensFromFile(filePath: string, mappingPath: string): Promise<boolean> {
    // Load mapping from file
    let mapLoader = new DTMapLoader()
    let configuration = await mapLoader.loadFromPath(mappingPath)

    // Load data from provided file and retrieve the data
    let jsonLoader = new DTJSONLoader()
    let data = await jsonLoader.loadDSObjectsFromTokenFile(filePath)
    return this.synchronizeTokensFromData(data, configuration.mapping, configuration.settings)
  }

  async synchronizeTokensFromData(
    data: object,
    mapping: DTPluginToSupernovaMapPack,
    settings: DTPluginToSupernovaSettings
  ): Promise<boolean> {
    await this.synchronizeTokensFromDataWithResults(data, mapping, settings)
    return true
  }

  async synchronizeTokensFromDataWithResults(
    data: object,
    mapping: DTPluginToSupernovaMapPack,
    settings: DTPluginToSupernovaSettings
  ): Promise<SupernovaToolsDesignTokensResult[] > {
    const results: SupernovaToolsDesignTokensResult[] = []

    // Fetch brand and themes
    let brands = await this.version.brands()
    let themes = await this.version.themes()
    let sources = await this.version.designSystem.fetchSources()

    // Parse data from object
    let parser = new DTJSONParser()
    let parsedData = await parser.processPluginDataRepresentation(data)

    // Post process the data
    this.processTokenNodes(parsedData, mapping, brands, settings.verbose)

    for (let map of mapping) {
      // First, process default values for tokens, for each brand, separately, skipping themes as they need to be created later
      if (map.bindToTheme) {
        continue
      }
      // Find the destination brand
      let brand = brands.find(b => b.persistentId === map.bindToBrand || (map.bindToBrand.toLowerCase().trim()) === b.name.toLowerCase().trim())
      if (!brand) {
        throw new Error(`Unknown brand ${map.bindToBrand} provided in binding.\n\nAvailable brands in this design system: [${brands.map(b => `${b.name} (id: ${b.persistentId})`)}]`)
      }
      this.setTokensOrigin(map, brand, sources)
      const mergeResult = await this.mergeWithRemoteSource(map.processedNodes, brand, !settings.dryRun, settings.verbose, settings.preciseCopy)
      results.push({
        map: _.pick(map, ["bindToBrand", "bindToTheme", "pluginSets", "pluginTheme", "type"]),
        tokensCreated: mergeResult.diff.toCreate.map(t => t.token.id),
        tokensUpdated: mergeResult.diff.toUpdate.map(t => t.token.id),
        tokensDeleted: mergeResult.diff.toDelete.map(t => t.token.id)
      });
      if (settings.verbose) {
        console.log(`✅ (task done) Synchronized base tokens for brand ${brand.name}`)
      }
    }

    for (let map of mapping) {
      // Merge all remaining themes
      if (!map.bindToTheme) {
        continue
      }
      // Find the destination brand
      let brand = brands.find(b => b.persistentId === map.bindToBrand || (map.bindToBrand.toLowerCase().trim()) === b.name.toLowerCase().trim())
      if (!brand) {
        throw new Error(`Unknown brand ${map.bindToBrand} provided in binding.\n\nAvailable brands in this design system: [${brands.map(b => `${b.name} (id: ${b.persistentId})`)}]`)
      }
      // Find the destination theme
      let theme = themes.find(t => t.id === map.bindToTheme || (map.bindToTheme.toLowerCase().trim()) === t.name.toLowerCase().trim())
      if (!theme) {
        throw new Error(`Unknown theme ${map.bindToTheme} provided in binding.\n\nAvailable themes in this design system: ${brands.map(b => `Brand: ${b.name} (id: ${b.persistentId})\n${themes.filter(th => th.brandId == b.persistentId).map(t => `    Theme: ${t.name} (id: ${t.id})`)}`)}`)
      }
      this.setTokensOrigin(map, brand, sources)
      const mergeResult = await this.mergeThemeWithRemoteSource(map.processedNodes, brand, theme, !settings.dryRun, settings.verbose)
      results.push({
        map: _.pick(map, ["bindToBrand", "bindToTheme", "pluginSets", "pluginTheme", "type"]),
        tokensCreated: [],
        tokensUpdated: mergeResult.tokens.map(t => t.id),
        tokensDeleted: []
      })
      if (settings.verbose) {
        console.log(
          `✅ (task done) Synchronized themed tokens for brand ${brand.name}, theme ${theme.name}`
        )
      }
    }

    return results
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Primary validation

  /** Loads the token tree as if it was being synchronized from the provided token directory - however, it doesn't ask server for data and constructs it the same as if data were written to empty design system.
   * 
   * Note: This method will additionally validate the integrity of the data, and allows for offline validation as well. */
  async validateLoadingFromDirectory(directoryPath: string, settingsPath: string, mappingSettings: {
    pluginTheme: string | null,
    pluginSets: Array<string> | null,
  }): Promise<boolean> {

    // Load data from path, and construct the final object
    let jsonLoader = new DTJSONLoader()
    let data = await jsonLoader.loadDSObjectsFromTokenFileDirectory(directoryPath, settingsPath)
    return this.validateLoadingFromData(data, mappingSettings)
  }

  /** Loads the token tree as if it was being synchronized from the provided token file - however, it doesn't ask server for data and constructs it the same as if data were written to empty design system.
   * 
   * Note: This method will additionally validate the integrity of the data, and allows for offline validation as well. */
  async validateLoadingFromPath(filePath: string, mappingSettings: {
    pluginTheme: string | null,
    pluginSets: Array<string> | null,
  }): Promise<boolean> {
    // Load data from provided file and retrieve the data
    let jsonLoader = new DTJSONLoader()
    let data = await jsonLoader.loadDSObjectsFromTokenFile(filePath)
    return this.validateLoadingFromData(data, mappingSettings)
  }

  async validateLoadingFromData(
    data: object,
    mappingSettings: {
      pluginTheme: string | null,
      pluginSets: Array<string> | null,
    }
  ): Promise<boolean> {

    // Parse data from object
    let parser = new DTJSONParser()
    let parsedData = await parser.processPluginDataRepresentation(data)

    // Build tree depending on settings
    if (mappingSettings.pluginTheme) {

    } else if (mappingSettings.pluginSets) {

    }

    // Post process the data
    // this.createPureTokenTree(parsedData, mappingSettings)

    return true
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Data processing

  private processTokenNodes(
    parseResult: { nodes: Array<DTParsedNode>; themes: Array<DTParsedTheme>; sets: Array<DTParsedTokenSet> },
    mapping: DTPluginToSupernovaMapPack,
    brands: Array<Brand>,
    verbose: boolean
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

    let count = 0
    for (let map of mapping) {
      count++

      // Find appropriate brand
      let brand = brands.find(b => b.persistentId === map.bindToBrand || (map.bindToBrand.toLowerCase().trim()) === b.name.toLowerCase().trim())

      if (!brand) {
        throw new Error(`Unknown brand ${map.bindToBrand} provided in binding. Available brands in this design system: \n\n ${brands.map(b => `${b.name} (id: ${b.persistentId})`)}`)
      }
      let converter = new DTJSONConverter(this.version, mapping)
      let groupBuilder = new DTJSONGroupBuilder(this.version, mapping)

      let processedNodes = converter.convertNodesToTokens(map.nodes, brand)
      let processedGroups = groupBuilder.constructAllDefinableGroupsTrees(processedNodes, brand)
      map.processedNodes = processedNodes
      map.processedGroups = processedGroups

      if (verbose) {
        console.log(`\n----- Processing mapping entry #${count}:`)
        console.log(`Processed nodes: ${processedNodes.length}`)
        console.log(`Processed groups: ${processedGroups.length}`)
      }
    }
    return mapping
  }

  private setTokensOrigin(map: DTPluginToSupernovaMap, brand: Brand, sources: Source[]): DTPluginToSupernovaMap {
    const sourceId = sources.find(s => s.type === SourceType.tokenStudio && s.brandId === brand.persistentId)?.id
    for (let node of map.processedNodes) {
      node.token.origin = {
        name: node.token.name,
        sourceId,
        id: node.key,
      }
    }

    return map
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Validation

  /** Creates pure tree for validation purposes, ignoring any existing token state in workspaces. This method works offline. */
  async createPureTokenTree(
    processedNodes: Array<DTProcessedTokenNode>,
    verbose: boolean
  ): Promise<{
    tokens: Array<Token>
    groups: Array<TokenGroup>
  }> {
    // Fake remote token data
    let upstreamTokenGroups = new Array<TokenGroup>()
    let upstreamTokens = new Array<Token>()

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

    // Prepare data for take synchronization
    let tokensToWrite = processedNodes.map(n => n.token)
    let tokenGroupsToWrite = groups

    // Log if needed
    if (verbose) {
      console.log(`\n----- Token tree constructed: `)
      console.log(`Token groups updated: ${tokenGroupsToWrite.length}`)
      console.log(`Tokens created: ${tokenMergeResult.toCreate.length}`)
      console.log(`\n`)
    }

    return {
      tokens: tokensToWrite,
      groups: tokenGroupsToWrite
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Merging

  /** Loads remote source connected to this tool, then merges tokens and groups with it, creating union. Can optionally write to the source as well */
  async mergeWithRemoteSource(
    processedNodes: Array<DTProcessedTokenNode>,
    brand: Brand,
    write: boolean,
    verbose: boolean,
    preciseCopy: boolean
  ): Promise<{
    tokens: Array<Token>
    groups: Array<TokenGroup>
    diff: DTTokenMergeDiff
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

    if (write) {
      let writer = brand.writer()
      await writer.writeTokens(
        tokenMergeResult.toCreateOrUpdate.map(r => r.token),
        tokenGroupsToWrite,
        preciseCopy ? tokenMergeResult.toDelete.map(r => r.token) : [] // If precise copy is enabled, we'll delete the tokens that were not in the source
      )
    }

    if (verbose) {
      console.log(`\n----- Base values synchronized: `)
      console.log(`Token groups updated: ${tokenGroupsToWrite.length}`)
      console.log(`Tokens created: ${tokenMergeResult.toCreate.length}`)
      console.log(`Tokens updated: ${tokenMergeResult.toUpdate.length}`)
      console.log(`Tokens deleted: ${preciseCopy ? tokenMergeResult.toDelete.length : `Deletion disabled because preciseCopy: false`}`)
      if (!write) {
        console.log(`Data were not written to workspace because dryRun was enabled`)
      }
      console.log(`\n`)
    }

    return {
      tokens: tokensToWrite,
      groups: tokenGroupsToWrite,
      diff: tokenMergeResult
    }
  }

  /** Loads remote source connected to this tool, then creates the diff from the base tree and updates the associated theme. Can optionally write to the source as well */
  async mergeThemeWithRemoteSource(
    processedNodes: Array<DTProcessedTokenNode>,
    brand: Brand,
    theme: TokenTheme,
    write: boolean,
    verbose: boolean
  ): Promise<{
    theme: TokenTheme
    tokens: Array<Token>
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

    if (verbose) {
      console.log(`----- Theme values synchronized:`)
      console.log(`Created or updated overrides: ${themeMergerResult.overriddenTokens.length}`)
      if (!write) {
        console.log(`Data were not written to workspace because dryRun was enabled`)
      }
    }

    return {
      theme: theme,
      tokens: themeMergerResult.overriddenTokens
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
