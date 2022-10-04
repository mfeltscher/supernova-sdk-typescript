//
//  DesignSystemVersion.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//



// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Supernova } from "../core/SDKSupernova"
import { AssetFormat, AssetScale, RenderedAsset } from "../exports"
import { Asset } from "../model/assets/SDKAsset"
import { Component } from "../model/components/SDKComponent"
import { DesignComponent } from "../model/components/SDKDesignComponent"
import { TokenType } from "../model/enums/SDKTokenType"
import { AssetGroup } from "../model/groups/SDKAssetGroup"
import { DesignComponentGroup } from "../model/groups/SDKDesignComponentGroup"
import { TokenGroup } from "../model/groups/SDKTokenGroup"
import { Token } from "../model/tokens/SDKToken"
import { DataCore } from "./data/SDKDataCore"
import { SupernovaError } from "./errors/SDKSupernovaError"
import { Brand } from "./SDKBrand"
import { DesignSystem } from "./SDKDesignSystem"
import { Documentation } from "./SDKDocumentation"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DesignSystemVersionRemoteModel {
    id: string
    parentId: string
    version: string
    designSystemId: string
    isReadonly: boolean
    meta: {
        name: string
        description: string
    }
    createdAt: string
    changeLog: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class DesignSystemVersion {

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Properties

    /** Unique identifier of design system version */
    id: string

    /** Design system in which this version was created */
    designSystem: DesignSystem

    /** Design system version name */
    name: string

    /** Design system version description */
    description: string

    /** Semantic name of version. Will be null if the version is in draft mode */
    version: string | null

    /** Change log for the version. Will be null if the version is in draft mode */
    changeLog: string | null

    /** If version is in read-only mode, it can't be modified - only documentation that can be improved */
    isReadOnly: boolean

    /** Internal: Engine */
    engine: Supernova

    /** Internal: Data core */
    dataCore: DataCore

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Constructor

    constructor(engine: Supernova, designSystem: DesignSystem, model: DesignSystemVersionRemoteModel) {

        this.engine = engine

        this.id = model.id
        this.designSystem = designSystem

        this.name = model.meta.name
        this.description = model.meta.description

        this.version = model.version
        this.changeLog = model.changeLog?.length > 0 ? model.changeLog : null
        this.isReadOnly = model.isReadonly

        this.dataCore = this.engine.newDataCore()
    }


    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Methods

    /** Fetches all brands belonging to this design system version. Brand objects can be used to access filtered data belonging to a single brand */
    async brands(): Promise<Array<Brand>> {

        // Fetch the authenticated user
        const dsEndpoint = `design-systems/${this.designSystem.id}/versions/${this.id}/brands`
        let dsData = (await this.engine.dataBridge.getDSMGenericDataFromEndpoint(dsEndpoint)).brands
        if (!dsData) {
            throw SupernovaError.fromSDKError(`Unable to retrieve brands for design system version id ${this.id}`)
        }

        let brands = new Array<Brand>()
        for (let brandData of dsData) {
            let brand = new Brand(this.engine, brandData, this)
            brands.push(brand)
        }

        return brands
    }

    /** Fetches all tokens in this design system version. This method retrieves all groups defined across all brands */
    async tokens(): Promise<Array<Token>> {

        return this.dataCore.currentDesignSystemTokens(this.designSystem.id, this)
    }

    /** Fetches all token groups in this design system version. This method retrieves all groups defined across all brands */
    async tokenGroups(): Promise<Array<TokenGroup>> {

        return this.dataCore.currentDesignSystemTokenGroups(this.designSystem.id, this)
    }

    /** Fetches root of the token group trees. This method returns all roots, one per each brand you have defined, ordered under separate TokenType, one array per category */
    async tokenGroupTrees(): Promise<Map<TokenType, Array<TokenGroup>>> {

        let groups = await this.dataCore.currentDesignSystemTokenGroups(this.designSystem.id, this)
        let rootGroups = groups.filter(g => g.isRoot)

        let trees = new Map<TokenType, Array<TokenGroup>>()
        for (let group of rootGroups) {
            let branch = trees.get(group.tokenType)
            if (branch) {
                branch.push(group)
                trees.set(group.tokenType, branch)
            } else {
                trees.set(group.tokenType, [group])
            }
        }

        return trees
    }

    /** Fetches all assets in this design system version for all defined brands  */
    async components(): Promise<Array<Component>> {

        return this.dataCore.currentDesignSystemComponents(this.designSystem.id, this)
    }

    /** Fetches all assets in this design system version for all defined brands  */
    async designComponents(): Promise<Array<DesignComponent>> {

        return this.dataCore.currentDesignSystemDesignComponents(this.designSystem.id, this)
    }

    /** Fetches all designComponent group in this design system version for all defined brands  */
    async designComponentGroups(): Promise<Array<DesignComponentGroup>> {

        return this.dataCore.currentDesignSystemDesignComponentGroups(this.designSystem.id, this)
    }

    /** Fetches roots of the designComponent group trees. This group will contain any other top-level groups that user created. This method returns all roots, one per each brand you have defined */
    async designComponentGroupTree(): Promise<Array<DesignComponentGroup>> {

        let groups = await this.dataCore.currentDesignSystemDesignComponentGroups(this.designSystem.id, this)
        let rootGroups = groups.filter(g => g.isRoot)
        return rootGroups
    }

    /** Fetches all assets in this design system version for all defined brands */
    async assets(): Promise<Array<Asset>> {

        return this.dataCore.currentDesignSystemAssets(this.designSystem.id, this)
    }


    /** Fetches all asset groups and retrieve them as flat array. You can still access all children of groups with children accessor of group object. This method retrieves all groups across all brands */
    async assetGroups(): Promise<Array<AssetGroup>> {

        return this.dataCore.currentDesignSystemAssetGroups(this.designSystem.id, this)
    }

    /** Fetches root of the asset group trees. This group will contain any other top-level groups that user created. This method returns all roots, one per each brand you have defined */
    async assetGroupTrees(): Promise<Array<AssetGroup>> {

        let groups = await this.dataCore.currentDesignSystemAssetGroups(this.designSystem.id, this)
        let rootGroups = groups.filter(g => g.isRoot)
        return rootGroups
    }

    /** Fetches root documentation object containing the entire documentation structure. This will never be null as there is always documentation object attached to a specific design system version */
    async documentation(): Promise<Documentation> {

        return this.dataCore.currentDesignSystemDocumentation(this.designSystem, this)
    }

    /** Renders all assets in this version and retrieves URLs from which assets can be downloaded as key-value. You can only render one combination of size/format with one request - use more requests if you need to render more.
     * 
     * Assets that are rendered as "png" will use "scale" attribute, however, when the format is "svg" or "pdf", scale attribute is ignored and will always render the original size.
     *  
     * Note that assets are not persistent and URLs will expire quickly - you must download them and store them locally / remotely and can never use this URL publicly as it won't work after a short time */
    async renderedAssets(format: AssetFormat, scale: AssetScale): Promise<Array<RenderedAsset>> {

        let groups = await this.assetGroups()
        let assets = await this.assets()
      
        // Construct rendering request. Only one size can be rendered at once
        return await this.dataCore.renderAssetsForConfiguration(this.designSystem.id, this, assets, groups, format, scale)
    }

    /** Renders specific assets in this version and retrieves URLs from which assets can be downloaded as key-value. You can only render one combination of size/format with one request - use more requests if you need to render more.
     * 
     * Assets that are rendered as "png" will use "scale" attribute, however, when the format is "svg" or "pdf", scale attribute is ignored and will always render the original size.
     *  
     * Note that assets are not persistent and URLs will expire quickly - you must download them and store them locally / remotely and can never use this URL publicly as it won't work after a short time */
    async specificRenderedAssets(assets: Array<Asset>, format: AssetFormat, scale: AssetScale): Promise<Array<RenderedAsset>> {
      
        let groups = await this.assetGroups()

        // Construct rendering request. Only one size can be rendered at once
        return await this.dataCore.renderAssetsForConfiguration(this.designSystem.id, this, assets, groups, format, scale)
    }
}