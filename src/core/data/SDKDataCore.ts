//
//  SDKDataCore.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2020 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Mutex } from 'async-mutex'
import { Asset } from '../../model/assets/SDKAsset'
import { RenderedAsset, RenderedAssetModel } from '../../model/assets/SDKRenderedAsset'
import { AssetFormat } from '../../model/enums/SDKAssetFormat'
import { AssetScale } from '../../model/enums/SDKAssetScale'
import { DesignComponent, DesignComponentRemoteModel } from '../../model/components/SDKDesignComponent'
import {
  ExporterCustomBlock,
  ExporterCustomBlockModel
} from '../../model/exporters/custom_blocks/SDKExporterCustomBlock'
import { DocumentationConfiguration } from '../../model/documentation/SDKDocumentationConfiguration'
import { DocumentationGroupModel } from '../../model/documentation/SDKDocumentationGroup'
import { DocumentationItem } from '../../model/documentation/SDKDocumentationItem'
import { DocumentationPageModel } from '../../model/documentation/SDKDocumentationPage'
import { AssetGroup } from '../../model/groups/SDKAssetGroup'
import { DesignComponentGroup, DesignComponentGroupRemoteModel } from '../../model/groups/SDKDesignComponentGroup'
import { TokenGroup, TokenGroupRemoteModel } from '../../model/groups/SDKTokenGroup'
import { TokenRemoteModel } from '../../model/tokens/remote/SDKRemoteTokenModel'
import { Token } from '../../model/tokens/SDKToken'
import { AssetGroupResolver } from '../resolvers/SDKAssetGroupResolver'
import { DesignComponentGroupResolver } from '../resolvers/SDKDesignComponentGroupResolver'
import { DocumentationItemResolver } from '../resolvers/SDKDocumentationItemResolver'
import { TokenGroupResolver } from '../resolvers/SDKTokenGroupResolver'
import { TokenResolver } from '../resolvers/SDKTokenResolver'
import { DesignSystemVersion } from '../SDKDesignSystemVersion'
import { Documentation, DocumentationModel } from '../SDKDocumentation'
import { DataBridge } from './SDKDataBridge'
import { ExporterConfigurationProperty } from '../../model/exporters/custom_properties/SDKExporterConfigurationProperty'
import { Exporter, ExporterModel } from '../../model/exporters/SDKExporter'
import { DesignSystem } from '../SDKDesignSystem'
import { ExporterCustomBlockVariant } from '../../model/exporters/custom_blocks/SDKExporterCustomBlockVariant'
import { Component, ComponentRemoteModel } from '../../model/components/SDKComponent'
import { ComponentResolver } from '../resolvers/SDKComponentResolver'
import { ElementPropertyRemoteModel } from '../../model/elements/SDKElementProperty'
import { ElementPropertyValueRemoteModel } from '../../model/elements/values/SDKElementPropertyValue'
import { Workspace, WorkspaceRemoteModel } from '../SDKWorkspace'
import { WorkspaceNPMRegistry, WorkspaceNPMRegistryModel } from '../../model/support/SDKWorkspaceNPMRegistry'
import { TokenTheme, TokenThemeRemoteModel } from '../../model/themes/SDKTokenTheme'
import { ElementDataView, ElementDataViewRemoteModel } from '../../model/elements/SDKElementDataView'
import { Brand, ElementProperty, ElementPropertyTargetElementType } from '../..'
import { DocumentationEnvironment } from '../../model/enums/SDKDocumentationEnvironment'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class DataCore {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  // Synchronization
  private tokensSynced: boolean
  private tokenGroupsSynced: boolean
  private themesSynced: boolean
  private componentsSynced: boolean
  private designComponentAssetSynced: boolean
  private designComponentAssetGroupsSynced: boolean
  private documentationItemsSynced: boolean
  private documentationSynced: boolean
  private exporterCustomBlocksSynced: boolean
  private elementPropertiesSynced: boolean
  private elementDataViewsSynced: boolean

  // Data store
  private tokens: Array<Token>
  private tokenGroups: Array<TokenGroup>
  private themes: Array<TokenTheme>
  private components: Array<Component>
  private designComponents: Array<DesignComponent>
  private designComponentGroups: Array<DesignComponentGroup>
  private assets: Array<Asset>
  private assetGroups: Array<AssetGroup>
  private documentation: Documentation
  private documentationItems: Array<DocumentationItem>
  private exporterCustomBlocks: Array<ExporterCustomBlock>
  private elementProperties: Array<ElementProperty>
  private elementDataViews: Array<ElementDataView>

  private bridge: DataBridge

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(bridge: DataBridge) {
    this.bridge = bridge

    this.tokensSynced = false
    this.tokens = new Array<Token>()

    this.tokenGroupsSynced = false
    this.tokenGroups = new Array<TokenGroup>()

    this.themesSynced = false
    this.themes = new Array<TokenTheme>()

    this.componentsSynced = false
    this.components = new Array<Component>()

    this.documentationItemsSynced = false
    this.documentationItems = new Array<DocumentationItem>()

    this.exporterCustomBlocksSynced = false
    this.exporterCustomBlocks = new Array<ExporterCustomBlock>()

    this.designComponentAssetSynced = false
    this.designComponents = new Array<DesignComponent>()
    this.assets = new Array<Asset>()

    this.designComponentAssetGroupsSynced = false
    this.designComponentGroups = new Array<DesignComponentGroup>()
    this.assetGroups = new Array<AssetGroup>()

    this.elementDataViewsSynced = false
    this.elementPropertiesSynced = false
    this.elementProperties = new Array<ElementProperty>()
    this.elementDataViews = new Array<ElementDataView>()

    this.documentationSynced = false
    this.documentation = null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Private Accessors - Auxiliary helper functions

  /** Get workspace handle from server */
  private async currentWorkspaceHandle(workspaceId: string): Promise<string> {
    // Download workspace details
    // Get remote data
    const endpoint = `workspaces/${workspaceId}`
    let remoteWorkspace = (await this.bridge.getDSMGenericDataFromEndpoint(endpoint)).result
      .workspace as WorkspaceRemoteModel

    // Extend with information coming from pulsar
    return remoteWorkspace.profile.handle
  }

  /** Get deisgn system documentation url from server */
  private async currentDeployedDocumentationUrl(
    designSystemId: string,
    versionId: string
  ): Promise<string | undefined> {
    // Download detail of the last build that successfully deployed docs
    const endpoint = `design-systems/${designSystemId}/versions/${versionId}/documentation/url`
    let deployedUrl = (await this.bridge.getDSMGenericDataFromEndpoint(endpoint)).result.url as string
    return deployedUrl ?? undefined
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Themes

  async currentDesignSystemThemes(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<TokenTheme>> {
    if (!this.themesSynced) {
      await this.updateThemesData(designSystemId, designSystemVersion)
    }
    return this.themes
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Tokens

  async currentDesignSystemTokens(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    forceRefreshCache?: boolean
  ): Promise<Array<Token>> {
    if (!this.tokensSynced || forceRefreshCache) {
      await this.updateTokenData(designSystemId, designSystemVersion)
    }
    return this.tokens
  }

  async currentDesignSystemTokenGroups(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<TokenGroup>> {
    if (!this.tokenGroupsSynced) {
      await this.updateTokenGroupData(designSystemId, designSystemVersion)
    }
    return this.tokenGroups
  }

  async currentDesignSystemElementProperties(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    forceRefreshCache?: boolean
  ): Promise<Array<ElementProperty>> {
    if (!this.elementPropertiesSynced || forceRefreshCache) {
      await this.updateElementData(designSystemId, designSystemVersion)
    }
    return this.elementProperties
  }

  async currentDesignSystemElementDataViews(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    forceRefreshCache?: boolean
  ): Promise<Array<ElementDataView>> {
    if (!this.elementDataViewsSynced || forceRefreshCache) {
      await this.updateElementData(designSystemId, designSystemVersion)
    }
    return this.elementDataViews
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Assets

  async currentDesignSystemAssets(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<Asset>> {
    if (!this.designComponentAssetSynced) {
      await this.updateDesignComponentAndAssetData(designSystemId, designSystemVersion)
    }
    return this.assets
  }

  async currentDesignSystemAssetGroups(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<AssetGroup>> {
    if (!this.designComponentAssetSynced) {
      await this.updateDesignComponentAndAssetData(designSystemId, designSystemVersion)
    }
    if (!this.designComponentAssetGroupsSynced) {
      await this.updateDesignComponentAndAssetGroupData(designSystemId, designSystemVersion)
    }
    return this.assetGroups
  }

  async renderAssetsForConfiguration(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    assets: Array<Asset>,
    groups: Array<AssetGroup>,
    format: AssetFormat,
    scale: AssetScale
  ): Promise<Array<RenderedAsset>> {
    // Configure payload
    let configuration = {
      settings: [
        {
          prefix: '',
          suffix: '',
          scale: scale,
          format: format
        }
      ],
      persistentIds: assets.map(a => a.id)
    }

    // Render items
    const endpoint = `components/assets/download-list`
    const items = (
      await this.bridge.postDSMDataToEndpoint(designSystemId, designSystemVersion.id, endpoint, configuration)
    ).result.items as Array<RenderedAssetModel>

    // Create rendered items index
    const renderedItemsMap = new Map<string, RenderedAssetModel>()
    for (const renderedItem of items) {
      renderedItemsMap.set(renderedItem.assetId, renderedItem)
    }

    if (Array.from(renderedItemsMap.entries()).length !== assets.length) {
      throw new Error("Number of rendered assets doesn't align with number of requested assets")
    }

    const assetsMap = new Map<string, Asset>()
    for (const asset of assets) {
      assetsMap.set(asset.id, asset)
    }

    let resultingAssets: Array<RenderedAsset> = []

    // For duplicates
    let names = new Map<string, number>()

    for (const asset of assets) {
      const item = renderedItemsMap.get(asset.id)
      let renderedGroup: AssetGroup

      for (let group of groups) {
        if (group.assetIds.includes(asset.id)) {
          renderedGroup = group
          break
        }
      }

      let assetPath = this.assetPath(asset, renderedGroup)
      if (!names.get(assetPath)) {
        names.set(assetPath, 0)
      }

      if (!renderedGroup) {
        throw new Error(`Each asset must be assigned to some group`)
      }
      let renderedAsset = new RenderedAsset(item, asset, renderedGroup, names.get(assetPath))

      // Increase number of duplicates
      names.set(assetPath, names.get(assetPath) + 1)

      // Store
      resultingAssets.push(renderedAsset)
    }

    return resultingAssets
  }

  assetPath(asset: Asset, parent: AssetGroup): string {
    let segments = [asset.name]
    while (parent) {
      segments.push(parent.name)
      parent = parent.parent
    }
    return segments.reverse().join('/')
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Components

  async currentDesignSystemComponents(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<Component>> {
    if (!this.componentsSynced) {
      await this.updateComponentData(designSystemId, designSystemVersion)
    }

    return this.components
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Design Components

  async currentDesignSystemDesignComponents(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<DesignComponent>> {
    if (!this.designComponentAssetSynced) {
      await this.updateDesignComponentAndAssetData(designSystemId, designSystemVersion)
    }

    return this.designComponents
  }

  async currentDesignSystemDesignComponentGroups(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<DesignComponentGroup>> {
    if (!this.designComponentAssetSynced) {
      await this.updateDesignComponentAndAssetData(designSystemId, designSystemVersion)
    }
    if (!this.designComponentAssetGroupsSynced) {
      await this.updateDesignComponentAndAssetGroupData(designSystemId, designSystemVersion)
    }

    // Retrieve the data
    return this.designComponentGroups
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Documentation

  async currentDesignSystemDocumentationItems(
    designSystem: DesignSystem,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<DocumentationItem>> {
    // Acquire custom blocks and doc configuration first, so they can be used for resolution
    let blocks = await this.currentExporterCustomBlocks(designSystem.id, designSystemVersion)
    let documentation = (await this.currentDesignSystemDocumentation(designSystem, designSystemVersion)).settings

    // Acquire data
    if (!this.documentationItemsSynced) {
      await this.updateDocumentationItemData(designSystem.id, designSystemVersion, blocks, documentation)
    }

    // Retrieve the data
    return this.documentationItems
  }

  async currentDesignSystemDocumentation(
    designSystem: DesignSystem,
    designSystemVersion: DesignSystemVersion
  ): Promise<Documentation> {
    // Acquire data
    if (!this.documentationSynced) {
      await this.updateDocumentationData(designSystem, designSystemVersion)
    }

    // Retrieve the data
    return this.documentation
  }

  async currentExporterCustomBlocks(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<ExporterCustomBlock>> {
    // Acquire data
    if (!this.exporterCustomBlocksSynced) {
      await this.updateExporterCustomBlocksData(designSystemId, designSystemVersion)
    }

    // Retrieve the data
    return this.exporterCustomBlocks
  }

  async currentExporterConfigurationProperties(
    workspaceId: string,
    designSystemId: string,
    exporterId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<ExporterConfigurationProperty>> {
    // TODO: This call is currently not cached as we need multi-cache because of exporterId. Easy to implement, but will have to wait for later as ideally we create more sophisticated caching system
    let exporter = await this.getExporter(workspaceId, exporterId, designSystemVersion)
    let propertyValues = await this.getExporterConfigurationPropertyUserValues(
      designSystemId,
      exporterId,
      designSystemVersion
    )

    // Update properties with the downloaded data
    for (let property of exporter.contributes.configuration) {
      for (let settings of propertyValues) {
        if (property.key === settings.key) {
          property.updateValue(settings.value)
        }
      }
    }

    // Retrieve the data
    return exporter.contributes.configuration
  }

  async currentExporterBlockVariants(
    workspaceId: string,
    designSystemId: string,
    exporterId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<ExporterCustomBlockVariant>> {
    // TODO: This call is currently not cached as we need multi-cache because of exporterId. Easy to implement, but will have to wait for later as ideally we create more sophisticated caching system
    let exporter = await this.getExporter(workspaceId, exporterId, designSystemVersion)
    let variants = exporter.contributes.blockVariants

    return variants
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Element properties

  /** Update current element views of the documentation */
  async updateElementData(designSystem: string, designSystemVersion: DesignSystemVersion) {
    // Download core documentation settings
    const data = await this.getElementData(designSystem, designSystemVersion)

    this.elementDataViews = data.views
    this.elementProperties = data.properties

    if (this.bridge.cache) {
      this.elementDataViewsSynced = true
      this.elementPropertiesSynced = true
    }
  }

  private async getElementData(
    designSystem: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<{
    views: Array<ElementDataView>
    properties: Array<ElementProperty>
  }> {
    const data = await this.getRawElementPropertyData(designSystem, designSystemVersion)

    let resolvedProperties = data.properties.map(p => new ElementProperty(p))
    let resolvedViews = data.views.map(v => new ElementDataView(v))

    // Sort properties using views
    let firstView = resolvedViews.filter(
      v => v.isDefault && v.targetElementType === ElementPropertyTargetElementType.component
    )[0]
    let indexes = new Map<string, number>()
    for (let column of firstView.columns) {
      if (column.propertyDefinitionId) {
        indexes.set(column.propertyDefinitionId, firstView.columns.indexOf(column))
      }
    }

    resolvedProperties = resolvedProperties.sort((a, b) => indexes.get(a.persistentId) - indexes.get(b.persistentId))

    return {
      views: resolvedViews,
      properties: resolvedProperties
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Documentation

  /** Prepare design configuration, merging it with pulsar data */
  async updateDocumentationData(designSystem: DesignSystem, designSystemVersion: DesignSystemVersion) {
    // Download core documentation settings
    this.documentation = await this.getDocumentation(designSystem, designSystemVersion)
    if (this.bridge.cache) {
      this.documentationSynced = true
    }
  }

  private async getDocumentation(
    designSystem: DesignSystem,
    designSystemVersion: DesignSystemVersion
  ): Promise<Documentation> {
    // Download design system documentation from the API
    // Get remote data
    const endpoint = `documentation`
    let remoteDocumentation = (
      await this.bridge.getDSMDataFromEndpoint(designSystem.id, designSystemVersion.id, endpoint)
    ).result.documentation as DocumentationModel
    let registry = await this.getNPMRegistry(designSystem, designSystemVersion)

    // Extend with information coming from pulsar
    let configuration = new Documentation(designSystemVersion, designSystem, remoteDocumentation, registry)
    return configuration
  }

  private async getNPMRegistry(
    designSystem: DesignSystem,
    designSystemVersion: DesignSystemVersion
  ): Promise<WorkspaceNPMRegistry | null> {
    try {
      // Download NPM registry from the API, if exists
      const endpoint = `workspaces/${designSystem.workspaceId}/npm-registry`
      let registry = (await this.bridge.getDSMGenericDataFromEndpoint(endpoint)).result
        .npmRegistrySettings as WorkspaceNPMRegistryModel

      if (registry) {
        return new WorkspaceNPMRegistry(registry)
      } else {
        return null
      }
    } catch (error) {
      return null
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Exporter custom blocks

  /** Download all custom blocks provided by the currently active exporter */
  async updateExporterCustomBlocksData(designSystemId: string, designSystemVersion: DesignSystemVersion) {
    // Download core design system token data
    this.exporterCustomBlocks = await this.getExporterCustomBlocks(designSystemId, designSystemVersion)
    if (this.bridge.cache) {
      this.exporterCustomBlocksSynced = true
    }
  }

  private async getExporterCustomBlocks(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<ExporterCustomBlock>> {
    // Download the raw token data and resolve them
    let rawBlocks = await this.getExporterCustomBlockData(designSystemId, designSystemVersion)
    let resolvedBlocks = await this.resolveExporterCustomBlockData(rawBlocks)
    return resolvedBlocks
  }

  private async getExporterCustomBlockData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<ExporterCustomBlockModel>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = 'documentation/custom-blocks'
    let result: Array<ExporterCustomBlockModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.customBlocks
    return result
  }

  private async resolveExporterCustomBlockData(
    data: Array<ExporterCustomBlockModel>
  ): Promise<Array<ExporterCustomBlock>> {
    return data.map(b => new ExporterCustomBlock(b))
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Exporter custom properties / values

  private async getExporterConfigurationPropertyUserValues(
    designSystemId: string,
    exporterId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<{ key: string; value: any }>> {
    // Download the raw token data and resolve them
    let userValues = await this.getExporterConfigurationPropertiesUserValuesData(
      designSystemId,
      exporterId,
      designSystemVersion
    )
    // let resolvedProperties = await this.resolveExporterConfigurationPropertiesUserValuesData(rawProperties) // no resolution needed
    return userValues
  }

  private async getExporterConfigurationPropertiesUserValuesData(
    designSystemId: string,
    exporterId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<{ key: string; value: any }>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = `design-systems/${designSystemId}/exporter-properties/${exporterId}`
    let result: Array<{ key: string; value: any }> = (await this.bridge.getDSMGenericDataFromEndpoint(endpoint)).result
      .items
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Exporter

  private async getExporter(
    workspaceId: string,
    exporterId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Exporter> {
    // Download the raw token data and resolve them
    let rawExporter = await this.getExporterData(workspaceId, exporterId)
    let resolvedExporter = await this.resolveExporterData(rawExporter)
    return resolvedExporter
  }

  private async getExporterData(workspaceId: string, exporterId: string): Promise<ExporterModel> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = `codegen/workspaces/${workspaceId}/exporters/${exporterId}`
    let result: ExporterModel = (await this.bridge.getDSMGenericDataFromEndpoint(endpoint)).result.exporter
    return result
  }

  private async resolveExporterData(data: ExporterModel): Promise<Exporter> {
    return new Exporter(data)
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---e
  // MARK: - Tokens

  /** Prepare design system data for use for the entire design system, downloading and resolving all tokens */
  async updateTokenData(designSystemId: string, designSystemVersion: DesignSystemVersion) {
    // Download core design system token data
    this.tokens = await this.getTokens(designSystemId, designSystemVersion)
    if (this.bridge.cache) {
      this.tokensSynced = true
    }
  }

  private async getTokens(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<Token>> {
    // Get token groups
    let tokenGroups = await this.getTokenGroups(designSystemId, designSystemVersion)

    // Download the raw token data and resolve them
    let result = await Promise.all([
      this.getRawTokenData(designSystemId, designSystemVersion),
      this.getRawElementPropertyData(designSystemId, designSystemVersion),
      this.getRawElementPropertyValuesData(designSystemId, designSystemVersion)
    ])

    let rawData = result[0]
    let propPack = result[1]
    let rawValues = await result[2]
    let resolvedTokens = await this.resolveTokenData(
      rawData,
      propPack.properties,
      propPack.views,
      rawValues,
      tokenGroups,
      designSystemVersion
    )
    return resolvedTokens
  }

  private async getRawTokenData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<TokenRemoteModel>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = 'tokens'
    let result: Array<TokenRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.tokens
    return result
  }

  private async resolveTokenData(
    data: Array<TokenRemoteModel>,
    properties: Array<ElementPropertyRemoteModel>,
    views: Array<ElementDataViewRemoteModel>,
    values: Array<ElementPropertyValueRemoteModel>,
    tokenGroups: Array<TokenGroup>,
    version: DesignSystemVersion
  ): Promise<Array<Token>> {
    let resolver = new TokenResolver(version)
    let result = resolver.resolveTokenData(data, tokenGroups, properties, views, values)
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Token Groups

  /** Prepare design system data for use for the entire design system, downloading and resolving all groups */
  async updateTokenGroupData(designSystemId: string, designSystemVersion: DesignSystemVersion) {
    // Download core design system token data
    this.tokenGroups = await this.getTokenGroups(designSystemId, designSystemVersion)
    if (this.bridge.cache) {
      this.tokenGroupsSynced = true
    }
  }

  private async getTokenGroups(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<TokenGroup>> {
    // Download the raw token data and resolve them
    let rawData = await this.getRawTokenGroupData(designSystemId, designSystemVersion)
    let resolvedGroups = await this.resolveTokenGroupData(rawData)
    return resolvedGroups
  }

  private async getRawTokenGroupData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<TokenGroupRemoteModel>> {
    // Download token group data from the design system endpoint
    const endpoint = 'token-groups'
    let result: Array<TokenGroupRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.groups
    return result
  }

  private async resolveTokenGroupData(data: Array<TokenGroupRemoteModel>): Promise<Array<TokenGroup>> {
    let resolver = new TokenGroupResolver()
    let result = await resolver.resolveGroupData(data)
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---e
  // MARK: - Token & Component Properties

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---e
  // MARK: - Tokens

  /** Prepare design system data for use for the entire design system, downloading and resolving all tokens */
  async updateThemesData(designSystemId: string, designSystemVersion: DesignSystemVersion) {
    // Download core design system token data
    this.themes = await this.getThemes(designSystemId, designSystemVersion)
    if (this.bridge.cache) {
      this.themesSynced = true
    }
  }

  private async getThemes(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<TokenTheme>> {
    // Get token groups
    let baseTokens = await this.currentDesignSystemTokens(designSystemId, designSystemVersion)
    let baseTokenGroups = await this.currentDesignSystemTokenGroups(designSystemId, designSystemVersion)

    // Download the raw token data and resolve them
    let rawData = await this.getRawThemeData(designSystemId, designSystemVersion)
    let resolvedThemes = await this.resolveThemeData(rawData, baseTokens, baseTokenGroups, designSystemVersion)
    return resolvedThemes
  }

  private async getRawThemeData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<TokenThemeRemoteModel>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = 'themes'
    let result: Array<TokenThemeRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.themes
    return result
  }

  private async resolveThemeData(
    data: Array<TokenThemeRemoteModel>,
    tokens: Array<Token>,
    tokenGroups: Array<TokenGroup>,
    version: DesignSystemVersion
  ): Promise<Array<TokenTheme>> {
    let resolvedThemes = new Array<TokenTheme>()
    for (let themeModel of data) {
      // Note that each resolution must be done individually with new resolver to clean its state
      // Some possible optimizations can eventually be possible (fasters hashes with more themes), but
      // because we considering that there will only be very few themes at once, this is not needed now
      let resolver = new TokenResolver(version)
      let result = resolver.resolveThemeData(themeModel, tokens, tokenGroups)
      resolvedThemes.push(result)
    }
    return resolvedThemes
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Components

  /** Prepare design system data for use for the entire design system, downloading and resolving all components - and indirectly, assets as well */
  async updateComponentData(designSystemId: string, designSystemVersion: DesignSystemVersion) {
    // Download core design system component data
    let result = await this.getComponents(designSystemId, designSystemVersion)
    this.components = result
    if (this.bridge.cache) {
      this.componentsSynced = true
    }
  }

  private async getComponents(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<Component>> {
    // Download the raw component data, including their properties, and resolve them
    let result = await Promise.all([
      this.getRawComponentData(designSystemId, designSystemVersion),
      this.getRawElementPropertyData(designSystemId, designSystemVersion),
      this.getRawElementPropertyValuesData(designSystemId, designSystemVersion)
    ])
    let rawComponents = result[0]
    let propPack = result[1]
    let rawValues = result[2]
    let resolvedComponents = await this.resolveComponentData(
      rawComponents,
      propPack.properties,
      propPack.views,
      rawValues,
      designSystemVersion
    )
    return resolvedComponents
  }

  private async getRawComponentData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<ComponentRemoteModel>> {
    // Download component data from the design system endpoint. This downloads components of all types
    const endpoint = 'design-system-components'
    let result: Array<ComponentRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.designSystemComponents
    return result
  }

  private async getRawElementPropertyData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<{
    properties: Array<ElementPropertyRemoteModel>
    views: Array<ElementDataViewRemoteModel>
  }> {
    // Download component data from the design system endpoint. This downloads components of all types
    const endpoint = 'element-properties/definitions'
    let result: Array<ElementPropertyRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.definitions

    // Download data views (columns)
    const dvEndpoint = 'element-data-views'
    let dvResult: Array<ElementDataViewRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, dvEndpoint)
    ).result.elementDataViews

    return {
      properties: result,
      views: dvResult
    }
  }

  private async getRawElementPropertyValuesData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<ElementPropertyValueRemoteModel>> {
    // Download component data from the design system endpoint. This downloads components of all types
    const endpoint = 'element-properties/values'
    let result: Array<ElementPropertyValueRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.values
    return result
  }

  private async resolveComponentData(
    components: Array<ComponentRemoteModel>,
    properties: Array<ElementPropertyRemoteModel>,
    views: Array<ElementDataViewRemoteModel>,
    values: Array<ElementPropertyValueRemoteModel>,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<Component>> {
    let resolver = new ComponentResolver()
    let result = await resolver.resolveComponentData(components, properties, views, values)
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Assets & Design Components

  /** Prepare design system data for use for the entire design system, downloading and resolving all design components - and indirectly, assets as well */
  async updateDesignComponentAndAssetData(designSystemId: string, designSystemVersion: DesignSystemVersion) {
    // Download core design system designComponent data without frame definitions
    let result = await this.getDesignComponentsAndAssets(designSystemId, designSystemVersion)
    this.designComponents = result.designComponents
    this.assets = result.assets
    if (this.bridge.cache) {
      this.designComponentAssetSynced = true
    }
  }

  private async getDesignComponentsAndAssets(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<{
    designComponents: Array<DesignComponent>
    assets: Array<Asset>
  }> {
    // Download the raw token data and resolve them
    let rawData = await this.getRawDesignComponentAndAssetData(designSystemId, designSystemVersion)
    let resolvedDesignComponentsAndAssets = await this.resolveDesignComponentAndAssetData(rawData, designSystemVersion)
    return resolvedDesignComponentsAndAssets
  }

  private async getRawDesignComponentAndAssetData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<DesignComponentRemoteModel>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = 'components'
    let result: Array<DesignComponentRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.components
    return result
  }

  private async resolveDesignComponentAndAssetData(
    data: Array<DesignComponentRemoteModel>,
    version: DesignSystemVersion
  ): Promise<{
    designComponents: Array<DesignComponent>
    assets: Array<Asset>
  }> {
    // For now, transform all designComponents into designComponents
    let designComponents: Array<DesignComponent> = []
    let ds = version.designSystem
    let sources = await ds.sources()

    for (let designComponent of data) {
      designComponents.push(new DesignComponent(designComponent, sources))
    }

    // For duplicates
    let assetNames = new Map<string, number>()
    for (let item of data) {
      if (item.exportProperties.isAsset) {
        assetNames.set(item.meta.name.toLowerCase(), 0)
      }
    }

    // Transform only exportable designComponents into assets
    let assets: Array<Asset> = []
    for (let asset of data) {
      let lowercasedName = asset.meta.name.toLowerCase()
      if (asset.exportProperties.isAsset) {
        assets.push(new Asset(asset, assetNames.get(lowercasedName), sources))
        // Increase number of duplicates
        assetNames.set(lowercasedName, assetNames.get(lowercasedName) + 1)
      }
    }

    return {
      designComponents: designComponents,
      assets: assets
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - DesignComponent & Assets Groups

  /** Prepare design system data for use for the entire design system, downloading and resolving all groups */
  async updateDesignComponentAndAssetGroupData(designSystemId: string, designSystemVersion: DesignSystemVersion) {
    // Download core design system token data
    let result = await this.getDesignComponentAndAssetGroups(
      designSystemId,
      designSystemVersion,
      this.designComponents,
      this.assets
    )
    this.designComponentGroups = result.designComponentGroups
    this.assetGroups = result.assetGroups
    if (this.bridge.cache) {
      this.designComponentAssetGroupsSynced = true
    }
  }

  private async getDesignComponentAndAssetGroups(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    designComponents: Array<DesignComponent>,
    assets: Array<Asset>
  ): Promise<{
    designComponentGroups: Array<DesignComponentGroup>
    assetGroups: Array<AssetGroup>
  }> {
    // Download the raw token data and resolve them
    let rawData = await this.getRawDesignComponentAndAssetGroupData(designSystemId, designSystemVersion)
    let resolvedDesignComponentGroups = await this.resolveDesignComponentGroupData(rawData, designComponents)
    let resolvedAssetGroups = await this.resolveAssetGroupData(rawData, assets)
    return {
      designComponentGroups: resolvedDesignComponentGroups,
      assetGroups: resolvedAssetGroups
    }
  }

  private async getRawDesignComponentAndAssetGroupData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<Array<DesignComponentGroupRemoteModel>> {
    // Download token group data from the design system endpoint
    const endpoint = 'component-groups'
    let result: Array<DesignComponentGroupRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result.groups
    return result
  }

  private async resolveDesignComponentGroupData(
    data: Array<DesignComponentGroupRemoteModel>,
    designComponents: Array<DesignComponent>
  ): Promise<Array<DesignComponentGroup>> {
    let resolver = new DesignComponentGroupResolver(designComponents)
    let result = await resolver.resolveGroupData(data)
    return result
  }

  private async resolveAssetGroupData(
    data: Array<DesignComponentGroupRemoteModel>,
    assets: Array<Asset>
  ): Promise<Array<AssetGroup>> {
    let resolver = new AssetGroupResolver(assets)
    let result = await resolver.resolveGroupData(data)
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Documentation Items

  async updateDocumentationItemData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    blocks: Array<ExporterCustomBlock>,
    configuration: DocumentationConfiguration
  ) {
    // Download core design documentation item data
    this.documentationItems = await this.getDocumentationItems(
      designSystemId,
      designSystemVersion,
      blocks,
      configuration
    )
    if (this.bridge.cache) {
      this.documentationItemsSynced = true
    }
  }

  private async getDocumentationItems(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    blocks: Array<ExporterCustomBlock>,
    configuration: DocumentationConfiguration
  ): Promise<Array<DocumentationItem>> {
    // Download the raw documentation data and resolve them
    let rawData = await this.getRawDocumentationItemData(designSystemId, designSystemVersion)
    let workspaceHandle = await this.currentWorkspaceHandle(designSystemVersion.designSystem.workspaceId)
    const deployedVersionUrl = await this.currentDeployedDocumentationUrl(
      designSystemVersion.designSystem.id,
      designSystemVersion.id
    )
    let resolvedItems = await this.resolveDocumentationItemData(
      rawData.pageDetails,
      rawData.groupDetails,
      blocks,
      configuration,
      designSystemVersion,
      workspaceHandle,
      deployedVersionUrl
    )
    return resolvedItems
  }

  private async getRawDocumentationItemData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion
  ): Promise<{
    pageDetails: Array<DocumentationPageModel>
    groupDetails: Array<DocumentationGroupModel>
  }> {
    // Request documentation content
    const endpointDetails = 'documentation/all'
    let detailResult: {
      groups: Array<DocumentationGroupModel>
      pages: Array<DocumentationPageModel>
    } = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpointDetails)).result

    return {
      pageDetails: detailResult.pages,
      groupDetails: detailResult.groups
    }
  }

  private async resolveDocumentationItemData(
    pageDetails: Array<DocumentationPageModel>,
    groupDetails: Array<DocumentationGroupModel>,
    blocks: Array<ExporterCustomBlock>,
    configuration: DocumentationConfiguration,
    version: DesignSystemVersion,
    workspaceHandle: string,
    docsUrl: string | undefined
  ): Promise<Array<DocumentationItem>> {
    let resolver = new DocumentationItemResolver(blocks, configuration, version, workspaceHandle, docsUrl)
    let result = await resolver.resolveItemData(pageDetails, groupDetails)
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - TS Data

  async getTokenStudioData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<object> {
    // Download component data from the design system endpoint. This downloads components of all types
    const endpoint = 'bff/token-studio'
    let result: Array<ElementPropertyRemoteModel> = (
      await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)
    ).result

    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  async writeTokenData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    tokens: Array<TokenRemoteModel>,
    groups: Array<TokenGroupRemoteModel>,
    deleteTokens: Array<Token>
  ): Promise<{ tokens: Array<TokenRemoteModel>; tokenGroups: Array<TokenGroup> }> {
    const endpoint = 'bff/import'
    const payload = {
      tokens: tokens,
      tokenGroups: groups,
      bulkDelete: {
        tokenIds: deleteTokens.map(t => t.versionedId)
      }
    }

    let result: {
      tokens: Array<TokenRemoteModel>
      tokenGroups: Array<TokenGroup>
    } = await this.bridge.postDSMDataToEndpoint(designSystemId, designSystemVersion.id, endpoint, payload)
    return result
  }

  async writeTokenThemeData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    theme: TokenThemeRemoteModel
  ): Promise<TokenThemeRemoteModel> {
    const endpoint = `themes/${theme.id}`
    const payload = theme

    let result: {
      theme: TokenThemeRemoteModel
    } = await this.bridge.postDSMDataToEndpoint(designSystemId, designSystemVersion.id, endpoint, payload, true)
    return result.theme
  }

  async writeTokenStudioJSONData(
    designSystemId: string,
    designSystemVersion: DesignSystemVersion,
    data: object
  ): Promise<boolean> {
    const endpoint = `bff/token-studio`
    await this.bridge.postDSMDataToEndpoint(designSystemId, designSystemVersion.id, endpoint, data)
    return true
  }

  async documetationJobs(
    version: DesignSystemVersion,
    environment: DocumentationEnvironment,
    limit: number = 10
  ): Promise<
    Array<{
      status: 'InProgress' | 'Success' | 'Failed'
      id: string | null
      exporterId: string | null
    }>
  > {
    const endpoint = `codegen/workspaces/${version.designSystem.workspaceId}/jobs?designSystemVersionId=${version.id}&destinations[]=documentation&docsEnvironment=${environment}&offset=0&limit=${limit}`
    let jobs = (await this.bridge.getDSMGenericDataFromEndpoint(endpoint)).result.jobs as any
    return jobs
  }

  async publishDocumentation(
    version: DesignSystemVersion,
    environment: DocumentationEnvironment
  ): Promise<{
    status: 'Queued' | 'InProgress' | 'Failure'
    jobId: string | null
    exporterId: string | null
  }> {
    const endpoint = `codegen/workspaces/${version.designSystem.workspaceId}/jobs/documentation`
    const payload = {
      designSystemId: version.designSystem.id,
      designSystemVersionId: version.id,
      environment
    }

    let result: {
      job: {
        id: string
        status: string
        scheduledId: string
        exporterId: string
      }
    } = (await this.bridge.postDSMDataToGenericEndpoint(endpoint, payload, false)).result

    // Check status
    let resultingStatus: 'Queued' | 'InProgress' | 'Failure'
    if (result.job.status === 'InProgress' || result.job.status === 'Success') {
      resultingStatus = 'Queued'
    } else if (result.job.status === 'Failed') {
      resultingStatus = 'Failure'
    } else {
      throw new Error(`Unsupported status ${result.job.status}`)
    }

    return {
      status: resultingStatus,
      jobId: result.job.id,
      exporterId: result.job.exporterId
    }
  }
}
