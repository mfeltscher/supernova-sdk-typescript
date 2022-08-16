//
//  SDKDataCore.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2020 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Mutex } from "async-mutex"
import { Asset } from "../../model/assets/SDKAsset"
import { RenderedAsset, RenderedAssetModel } from "../../model/assets/SDKRenderedAsset"
import { AssetFormat } from "../../model/enums/SDKAssetFormat"
import { AssetScale } from "../../model/enums/SDKAssetScale"
import { DesignComponent, DesignComponentRemoteModel } from "../../model/components/SDKDesignComponent"
import { ExporterCustomBlock, ExporterCustomBlockModel } from "../../model/exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../../model/documentation/SDKDocumentationConfiguration"
import { DocumentationGroupModel } from "../../model/documentation/SDKDocumentationGroup"
import { DocumentationItem } from "../../model/documentation/SDKDocumentationItem"
import { DocumentationPageModel } from "../../model/documentation/SDKDocumentationPage"
import { AssetGroup } from "../../model/groups/SDKAssetGroup"
import { DesignComponentGroup, DesignComponentGroupRemoteModel } from "../../model/groups/SDKDesignComponentGroup"
import { TokenGroup, TokenGroupRemoteModel } from "../../model/groups/SDKTokenGroup"
import { TokenRemoteModel } from "../../model/tokens/remote/SDKRemoteTokenModel"
import { Token } from "../../model/tokens/SDKToken"
import { AssetGroupResolver } from "../resolvers/SDKAssetGroupResolver"
import { DesignComponentGroupResolver } from "../resolvers/SDKDesignComponentGroupResolver"
import { DocumentationItemResolver } from "../resolvers/SDKDocumentationItemResolver"
import { TokenGroupResolver } from "../resolvers/SDKTokenGroupResolver"
import { TokenResolver } from "../resolvers/SDKTokenResolver"
import { DesignSystemVersion } from "../SDKDesignSystemVersion"
import { Documentation, DocumentationModel } from "../SDKDocumentation"
import { DataBridge } from "./SDKDataBridge"
import { ExporterConfigurationProperty, ExporterConfigurationPropertyModel } from "../../model/exporters/custom_properties/SDKExporterConfigurationProperty"
import { Exporter, ExporterModel } from "../../model/exporters/SDKExporter"
import { DesignSystem } from "../SDKDesignSystem"
import { ExporterCustomBlockVariant } from "../../model/exporters/custom_blocks/SDKExporterCustomBlockVariant"
import { Component, ComponentRemoteModel } from "../../model/components/SDKComponent"
import { ComponentResolver } from "../resolvers/SDKComponentResolver"
import { ComponentProperty, ComponentPropertyRemoteModel } from "../../model/components/SDKComponentProperty"
import { ComponentPropertyValue, ComponentPropertyValueRemoteModel } from "../../model/components/values/SDKComponentPropertyValue"
import { Workspace, WorkspaceRemoteModel } from "../SDKWorkspace"
import { WorkspaceNPMRegistry, WorkspaceNPMRegistryModel } from "../../model/support/SDKWorkspaceNPMRegistry"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class DataCore {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  // Synchronization 
  private tokensSynced: boolean
  private tokenGroupsSynced: boolean
  private componentsSynced: boolean
  private designComponentAssetSynced: boolean
  private designComponentAssetGroupsSynced: boolean
  private documentationItemsSynced: boolean
  private documentationSynced: boolean
  private exporterCustomBlocksSynced: boolean

  // Synchronization mutexes
  private tokenMutex = new Mutex()
  private tokenGroupMutex = new Mutex()
  private componentMutex = new Mutex()
  private designComponentAssetMutex = new Mutex()
  private designComponentAssetGroupMutex = new Mutex()
  private documentationItemMutex = new Mutex()
  private configurationMutex = new Mutex()
  private exporterCustomBlocksMutex = new Mutex()

  // Data store
  private tokens: Array<Token>
  private tokenGroups: Array<TokenGroup>
  private components: Array<Component>
  private designComponents: Array<DesignComponent>
  private designComponentGroups: Array<DesignComponentGroup>
  private assets: Array<Asset>
  private assetGroups: Array<AssetGroup>
  private documentation: Documentation
  private documentationItems: Array<DocumentationItem>
  private exporterCustomBlocks: Array<ExporterCustomBlock>

  private bridge: DataBridge


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(bridge: DataBridge) {
    this.bridge = bridge

    this.tokensSynced = false
    this.tokens = new Array<Token>()

    this.tokenGroupsSynced = false
    this.tokenGroups = new Array<TokenGroup>()

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
    let remoteWorkspace = (await this.bridge.getDSMGenericDataFromEndpoint(
      endpoint
    )).workspace as WorkspaceRemoteModel

    // Extend with information coming from pulsar
    return remoteWorkspace.profile.handle
  }

  /** Get deisgn system documentation url from server */
  private async currentDeployedDocumentationUrl(workspaceId: string, versionId: string): Promise<string | undefined> {
      
    // Download detail of the last build that successfully deployed docs
    const endpoint = `codegen/workspaces/${workspaceId}/jobs?designSystemVersionId=${versionId}&destinations[]=documentation&offset=0&limit=1`
    let remoteJob = (await this.bridge.getDSMGenericDataFromEndpoint(
      endpoint
    )).jobs as any
    if (remoteJob[0]) {
      // Note: So far, there is no build functionality in SDK, so we are not doing this properly. This will change going forward as we introduce build CLI/SDK
      return remoteJob[0]?.result?.documentation?.url ?? undefined
    }

    return undefined
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Tokens

  async currentDesignSystemTokens(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<Token>> {
    // Thread-lock the call
    const release = await this.tokenMutex.acquire()

    // Acquire data
    if (!this.tokensSynced) {
      await this.updateTokenData(designSystemId, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.tokens
  }

  async currentDesignSystemTokenGroups(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<TokenGroup>> {
    // Thread-lock the call
    const release = await this.tokenGroupMutex.acquire()

    // Acquire data
    if (!this.tokenGroupsSynced) {
      await this.updateTokenGroupData(designSystemId, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.tokenGroups
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Assets

  async currentDesignSystemAssets(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<Asset>> {
    // Thread-lock the call
    const release = await this.designComponentAssetMutex.acquire()

    // Acquire data
    if (!this.designComponentAssetSynced) {
      await this.updateDesignComponentAndAssetData(designSystemId, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.assets
  }

  async currentDesignSystemAssetGroups(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<AssetGroup>> {
    // Thread-lock the call
    const release = await this.designComponentAssetGroupMutex.acquire()

    // Acquire data
    if (!this.designComponentAssetSynced) {
      await this.updateDesignComponentAndAssetData(designSystemId, designSystemVersion)
    }
    if (!this.designComponentAssetGroupsSynced) {
      await this.updateDesignComponentAndAssetGroupData(designSystemId, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.assetGroups
  }


  async renderAssetsForConfiguration(designSystemId: string, designSystemVersion: DesignSystemVersion, assets: Array<Asset>, groups: Array<AssetGroup>, format: AssetFormat, scale: AssetScale): Promise<Array<RenderedAsset>> {
    
    // Configure payload
    let configuration = {
        "settings": [{
            prefix: "",
            suffix: "",
            scale: scale,
            format: format
        }],
        "persistentIds": assets.map(a => a.id)
    }

    // Render items
    const endpoint = `components/assets/download-list`
    let items = (await this.bridge.postDSMDataToEndpoint(
      designSystemId, 
      designSystemVersion.id,
      endpoint,
      configuration
    )).items as Array<RenderedAssetModel>

    if (items.length !== assets.length) {
      throw new Error("Number of rendered assets doesn't align with number of requested assets")
    }

    let counter = 0
    let resultingAssets: Array<RenderedAsset> = []
    
    // For duplicates
    let names = new Map<string, number>()
    for (let item of items) {
      names.set(item.originalName.toLowerCase(), 0)
    }

    // Create asset
    for (let item of items) {
      let asset = assets[counter]
      let renderedGroup: AssetGroup
      counter++

      for (let group of groups) {
        if (group.assetIds.includes(asset.id)) {
          renderedGroup = group
          break
        }
      }

      if (!renderedGroup) {
        throw new Error(`Each asset must be assigned to some group`)
      }
      let lowercasedName = item.originalName.toLowerCase()
      let renderedAsset = new RenderedAsset(item, asset, renderedGroup, names.get(lowercasedName))

      // Increase number of duplicates
      names.set(lowercasedName, names.get(lowercasedName) + 1)

      // Store
      resultingAssets.push(renderedAsset)
    }

    return resultingAssets
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Components

  async currentDesignSystemComponents(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<Component>> {
    // Thread-lock the call
    const release = await this.componentMutex.acquire()

    // Acquire data
    if (!this.componentsSynced) {
      await this.updateComponentData(designSystemId, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.components
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Design Components

  async currentDesignSystemDesignComponents(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<DesignComponent>> {
    // Thread-lock the call
    const release = await this.designComponentAssetMutex.acquire()

    // Acquire data
    if (!this.designComponentAssetSynced) {
      await this.updateDesignComponentAndAssetData(designSystemId, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.designComponents
  }

  async currentDesignSystemDesignComponentGroups(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<DesignComponentGroup>> {
    // Thread-lock the call
    const release = await this.designComponentAssetGroupMutex.acquire()

    // Acquire data
    if (!this.designComponentAssetSynced) {
      await this.updateDesignComponentAndAssetData(designSystemId, designSystemVersion)
    }
    if (!this.designComponentAssetGroupsSynced) {
      await this.updateDesignComponentAndAssetGroupData(designSystemId, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.designComponentGroups
  }

  
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public Accessors - Documentation

  async currentDesignSystemDocumentationItems(designSystem: DesignSystem, designSystemVersion: DesignSystemVersion): Promise<Array<DocumentationItem>> {
    // Thread-lock the call
    const release = await this.documentationItemMutex.acquire()

    // Acquire custom blocks and doc configuration first, so they can be used for resolution
    let blocks = await this.currentExporterCustomBlocks(designSystem.id, designSystemVersion)
    let documentation = (await this.currentDesignSystemDocumentation(designSystem, designSystemVersion)).settings

    // Acquire data
    if (!this.documentationItemsSynced) {
      await this.updateDocumentationItemData(designSystem.id, designSystemVersion, blocks, documentation)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.documentationItems
  }

  async currentDesignSystemDocumentation(designSystem: DesignSystem, designSystemVersion: DesignSystemVersion): Promise<Documentation> {
    // Thread-lock the call
    const release = await this.configurationMutex.acquire()

    // Acquire data
    if (!this.documentationSynced) {
      await this.updateDocumentationData(designSystem, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.documentation
  }

  async currentExporterCustomBlocks(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<ExporterCustomBlock>> {
 
    // Thread-lock the call
    const release = await this.exporterCustomBlocksMutex.acquire()

    // Acquire data
    if (!this.exporterCustomBlocksSynced) {
      await this.updateExporterCustomBlocksData(designSystemId, designSystemVersion)
    }

    // Unlock the thread
    release()

    // Retrieve the data
    return this.exporterCustomBlocks
  }

  async currentExporterConfigurationProperties(workspaceId: string, designSystemId: string, exporterId: string, designSystemVersion: DesignSystemVersion): Promise<Array<ExporterConfigurationProperty>> {
 
    // TODO: This call is currently not cached as we need multi-cache because of exporterId. Easy to implement, but will have to wait for later as ideally we create more sophisticated caching system
    let exporter = await this.getExporter(workspaceId, exporterId, designSystemVersion)
    let propertyValues = await this.getExporterConfigurationPropertyUserValues(designSystemId, exporterId, designSystemVersion)

    
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

  async currentExporterBlockVariants(workspaceId: string, designSystemId: string, exporterId: string, designSystemVersion: DesignSystemVersion): Promise<Array<ExporterCustomBlockVariant>> {
 
    // TODO: This call is currently not cached as we need multi-cache because of exporterId. Easy to implement, but will have to wait for later as ideally we create more sophisticated caching system
    let exporter = await this.getExporter(workspaceId, exporterId, designSystemVersion)
    let variants = exporter.contributes.blockVariants

    return variants
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

  private async getDocumentation(designSystem: DesignSystem, designSystemVersion: DesignSystemVersion): Promise<Documentation> {

    // Download design system documentation from the API
    // Get remote data
    const endpoint = `documentation`
    let remoteDocumentation = (await this.bridge.getDSMDataFromEndpoint(
      designSystem.id, 
      designSystemVersion.id,
      endpoint
    )).documentation as DocumentationModel
    let registry = await this.getNPMRegistry(designSystem, designSystemVersion)

    // Extend with information coming from pulsar
    let configuration = new Documentation(designSystemVersion, designSystem, remoteDocumentation, registry)
    return configuration
  }

  private async getNPMRegistry(designSystem: DesignSystem, designSystemVersion: DesignSystemVersion): Promise<WorkspaceNPMRegistry | null> {

    // Download NPM registry from the API, if exists
    const endpoint = `workspaces/${designSystem.workspaceId}/npm-registry`
    let registry = (await this.bridge.getDSMGenericDataFromEndpoint(
      endpoint
    )).npmRegistrySettings as WorkspaceNPMRegistryModel

    if (registry) {
      return new WorkspaceNPMRegistry(registry)
    } else {
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

  private async getExporterCustomBlocks(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<ExporterCustomBlock>> {
    // Download the raw token data and resolve them
    let rawBlocks = await this.getExporterCustomBlockData(designSystemId, designSystemVersion)
    let resolvedBlocks = await this.resolveExporterCustomBlockData(rawBlocks)
    return resolvedBlocks
  }

  private async getExporterCustomBlockData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<ExporterCustomBlockModel>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = 'documentation/custom-blocks'
    let result: Array<ExporterCustomBlockModel> = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)).customBlocks
    return result
  }

  private async resolveExporterCustomBlockData(
    data: Array<ExporterCustomBlockModel>
  ): Promise<Array<ExporterCustomBlock>> {
    return data.map(b => new ExporterCustomBlock(b))
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Exporter custom properties / values

  private async getExporterConfigurationPropertyUserValues(designSystemId: string, exporterId: string, designSystemVersion: DesignSystemVersion): Promise<Array<{key: string, value: any}>> {
    // Download the raw token data and resolve them
    let userValues = await this.getExporterConfigurationPropertiesUserValuesData(designSystemId, exporterId, designSystemVersion)
    // let resolvedProperties = await this.resolveExporterConfigurationPropertiesUserValuesData(rawProperties) // no resolution needed
    return userValues
  }

  private async getExporterConfigurationPropertiesUserValuesData(designSystemId: string, exporterId: string, designSystemVersion: DesignSystemVersion): Promise<Array<{key: string, value: any}>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = `design-systems/${designSystemId}/exporter-properties/${exporterId}`
    let result: Array<{key: string, value: any}> = (await this.bridge.getDSMGenericDataFromEndpoint(endpoint)).items
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Exporter

  private async getExporter(workspaceId: string, exporterId: string, designSystemVersion: DesignSystemVersion): Promise<Exporter> {
    // Download the raw token data and resolve them
    let rawExporter = await this.getExporterData(workspaceId, exporterId)
    let resolvedExporter = await this.resolveExporterData(rawExporter)
    return resolvedExporter
  }

  private async getExporterData(workspaceId: string, exporterId: string): Promise<ExporterModel> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = `codegen/workspaces/${workspaceId}/exporters/${exporterId}`
    let result: ExporterModel = (await this.bridge.getDSMGenericDataFromEndpoint(endpoint)).exporter
    return result
  }

  private async resolveExporterData(
    data: ExporterModel,
  ): Promise<Exporter> {
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
    let rawData = await this.getRawTokenData(designSystemId, designSystemVersion)
    let resolvedTokens = await this.resolveTokenData(rawData, tokenGroups, designSystemVersion)
    return resolvedTokens
  }

  private async getRawTokenData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<TokenRemoteModel>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = 'tokens'
    let result: Array<TokenRemoteModel> = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)).tokens
    return result
  }

  private async resolveTokenData(
    data: Array<TokenRemoteModel>,
    tokenGroups: Array<TokenGroup>,
    version: DesignSystemVersion
  ): Promise<Array<Token>> {
    let resolver = new TokenResolver(version)
    let result = resolver.resolveTokenData(data, tokenGroups)
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

  private async getTokenGroups(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<TokenGroup>> {
    // Download the raw token data and resolve them
    let rawData = await this.getRawTokenGroupData(designSystemId, designSystemVersion)
    let resolvedGroups = await this.resolveTokenGroupData(rawData)
    return resolvedGroups
  }

  private async getRawTokenGroupData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<TokenGroupRemoteModel>> {
    // Download token group data from the design system endpoint
    const endpoint = 'token-groups'
    let result: Array<TokenGroupRemoteModel> = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)).groups
    return result
  }

  private async resolveTokenGroupData(data: Array<TokenGroupRemoteModel>): Promise<Array<TokenGroup>> {
    let resolver = new TokenGroupResolver()
    let result = await resolver.resolveGroupData(data)
    return result
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

  private async getComponents(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<Component>> {
    // Download the raw component data, including their properties, and resolve them
    let rawComponents = await this.getRawComponentData(designSystemId, designSystemVersion)
    let rawProperties = await this.getRawComponentPropertyData(designSystemId, designSystemVersion)
    let rawValues = await this.getRawComponentPropertyValuesData(designSystemId, designSystemVersion)
    let resolvedComponents = await this.resolveComponentData(rawComponents, rawProperties, rawValues, designSystemVersion)
    return resolvedComponents
  }

  private async getRawComponentData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<ComponentRemoteModel>> {
    // Download component data from the design system endpoint. This downloads components of all types
    const endpoint = 'design-system-components'
    let result: Array<ComponentRemoteModel> = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)).designSystemComponents
    return result
  }

  private async getRawComponentPropertyData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<ComponentPropertyRemoteModel>> {
    // Download component data from the design system endpoint. This downloads components of all types
    const endpoint = 'element-properties/definitions'
    let result: Array<ComponentPropertyRemoteModel> = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)).definitions
    return result
  }

  private async getRawComponentPropertyValuesData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<ComponentPropertyValueRemoteModel>> {
    // Download component data from the design system endpoint. This downloads components of all types
    const endpoint = 'element-properties/values'
    let result: Array<ComponentPropertyValueRemoteModel> = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)).values
    return result
  }

  private async resolveComponentData(components: Array<ComponentRemoteModel>, properties: Array<ComponentPropertyRemoteModel>, values: Array<ComponentPropertyValueRemoteModel>, designSystemVersion: DesignSystemVersion): Promise<Array<Component>> {
    let resolver = new ComponentResolver()
    let result = await resolver.resolveComponentData(components, properties, values)
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

  private async getDesignComponentsAndAssets(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<{ 
    designComponents: Array<DesignComponent>, 
    assets: Array<Asset> 
  }> {
    // Download the raw token data and resolve them
    let rawData = await this.getRawDesignComponentAndAssetData(designSystemId, designSystemVersion)
    let resolvedDesignComponentsAndAssets = await this.resolveDesignComponentAndAssetData(rawData, designSystemVersion)
    return resolvedDesignComponentsAndAssets
  }

  private async getRawDesignComponentAndAssetData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<DesignComponentRemoteModel>> {
    // Download token data from the design system endpoint. This downloads tokens of all types
    const endpoint = 'components'
    let result: Array<DesignComponentRemoteModel> = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)).components
    return result
  }

  private async resolveDesignComponentAndAssetData(
    data: Array<DesignComponentRemoteModel>,
    version: DesignSystemVersion
  ): Promise<{ 
    designComponents: Array<DesignComponent>, 
    assets: Array<Asset> 
  }> {
    // For now, transform all designComponents into designComponents
    let designComponents: Array<DesignComponent> = []
    let ds = version.designSystem

    for (let designComponent of data) {
      designComponents.push(new DesignComponent(designComponent, ds.sources))
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
        assets.push(new Asset(asset, assetNames.get(lowercasedName)))
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
    let result = await this.getDesignComponentAndAssetGroups(designSystemId, designSystemVersion, this.designComponents, this.assets)
    this.designComponentGroups = result.designComponentGroups
    this.assetGroups = result.assetGroups
    if (this.bridge.cache) {
      this.designComponentAssetGroupsSynced = true
    }
  }

  private async getDesignComponentAndAssetGroups(designSystemId: string, designSystemVersion: DesignSystemVersion, designComponents: Array<DesignComponent>, assets: Array<Asset>): Promise<{
    designComponentGroups: Array<DesignComponentGroup>,
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

  private async getRawDesignComponentAndAssetGroupData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<Array<DesignComponentGroupRemoteModel>> {
    // Download token group data from the design system endpoint
    const endpoint = 'component-groups'
    let result: Array<DesignComponentGroupRemoteModel> = (await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpoint)).groups
    return result
  }

  private async resolveDesignComponentGroupData(data: Array<DesignComponentGroupRemoteModel>, designComponents: Array<DesignComponent>): Promise<Array<DesignComponentGroup>> {
    let resolver = new DesignComponentGroupResolver(designComponents)
    let result = await resolver.resolveGroupData(data)
    return result
  }

  private async resolveAssetGroupData(data: Array<DesignComponentGroupRemoteModel>, assets: Array<Asset>): Promise<Array<AssetGroup>> {
    let resolver = new AssetGroupResolver(assets)
    let result = await resolver.resolveGroupData(data)
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Documentation Items

  async updateDocumentationItemData(designSystemId: string, designSystemVersion: DesignSystemVersion, blocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    // Download core design documentation item data
    this.documentationItems = await this.getDocumentationItems(designSystemId, designSystemVersion, blocks, configuration)
    if (this.bridge.cache) {
      this.documentationItemsSynced = true
    }
  }

  private async getDocumentationItems(designSystemId: string, designSystemVersion: DesignSystemVersion, blocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration): Promise<Array<DocumentationItem>> {
    // Download the raw documentation data and resolve them
    let rawData = await this.getRawDocumentationItemData(designSystemId, designSystemVersion)
    let workspaceHandle = await this.currentWorkspaceHandle(designSystemVersion.designSystem.workspaceId)
    const deployedVersionUrl = await this.currentDeployedDocumentationUrl(designSystemVersion.designSystem.workspaceId, designSystemVersion.id)
    let resolvedItems = await this.resolveDocumentationItemData(rawData.pageDetails, rawData.groupDetails, blocks, configuration, designSystemVersion, workspaceHandle, deployedVersionUrl)
    return resolvedItems
  }

  private async getRawDocumentationItemData(designSystemId: string, designSystemVersion: DesignSystemVersion): Promise<{
    pageDetails: Array<DocumentationPageModel>
    groupDetails: Array<DocumentationGroupModel>
  }> {
    // Request documentation content
    const endpointDetails = 'documentation/all'
    let detailResult: {
      groups: Array<DocumentationGroupModel>
      pages: Array<DocumentationPageModel>
    } = await this.bridge.getDSMDataFromEndpoint(designSystemId, designSystemVersion.id, endpointDetails)

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
    docsUrl: string | undefined,
  ): Promise<Array<DocumentationItem>> {
    let resolver = new DocumentationItemResolver(blocks, configuration, version, workspaceHandle, docsUrl)
    let result = await resolver.resolveItemData(pageDetails, groupDetails)
    return result
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  async writeTokenData(designSystemId: string, designSystemVersion: DesignSystemVersion, tokens: Array<TokenRemoteModel>, groups: Array<TokenGroupRemoteModel>, deleteTokens: Array<Token>): Promise<{ tokens: Array<TokenRemoteModel>, tokenGroups: Array<TokenGroup> }> {

    const endpoint = 'bff/import'
    const payload = {
      tokens: tokens,
      tokenGroups: groups,
      bulkDelete: {
        tokenIds: deleteTokens.map(t => t.versionedId)
      }
    }

    let result: { tokens: Array<TokenRemoteModel>, tokenGroups: Array<TokenGroup> } = await this.bridge.postDSMDataToEndpoint(designSystemId, designSystemVersion.id, endpoint, payload)
    return result
  }
}
