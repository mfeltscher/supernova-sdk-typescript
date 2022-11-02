//
//  Brand.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Asset } from '../model/assets/SDKAsset'
import { RenderedAsset } from '../model/assets/SDKRenderedAsset'
import { AssetFormat } from '../model/enums/SDKAssetFormat'
import { AssetScale } from '../model/enums/SDKAssetScale'
import { DesignComponent } from '../model/components/SDKDesignComponent'
import { TokenType } from '../model/enums/SDKTokenType'
import { AssetGroup } from '../model/groups/SDKAssetGroup'
import { DesignComponentGroup } from '../model/groups/SDKDesignComponentGroup'
import { TokenGroup } from '../model/groups/SDKTokenGroup'
import { Token } from '../model/tokens/SDKToken'
import { DataCore } from './data/SDKDataCore'
import { DesignSystemVersion } from './SDKDesignSystemVersion'
import { Component } from '../model/components/SDKComponent'
import { BrandWriter } from './SDKBrandWriter'
import { Supernova } from './SDKSupernova'
import { TokenTheme } from '../model/themes/SDKTokenTheme'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface BrandRemoteModel {
  id: string
  designSystemVersionId: string
  persistentId: string
  meta: {
    name: string
    description: string
  }
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class Brand {
  // --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  /** Unique identifier of the brand in this specific version */
  id: string

  /** Unique identifier of the brand */
  persistentId: string

  /** Design System Version in which this brand exists */
  designSystemVersion: DesignSystemVersion

  /** Brand name */
  name: string

  /** Brand description */
  description: string

  /** Internal: Engine */
  engine: Supernova

  /** Internal: Data core */
  dataCore: DataCore

  // --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(engine: Supernova, model: BrandRemoteModel, version: DesignSystemVersion) {
    this.engine = engine

    this.id = model.id
    this.persistentId = model.persistentId
    this.designSystemVersion = version

    this.name = model.meta.name
    this.description = model.meta.description

    // We are reusing data core from version so the data for all brands are cached across the system
    // Note that this might potentially be further optimized just by requesting specific data for specific... But later, as brands will still be nuanced use :)
    this.dataCore = version.dataCore
  }

  // --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writer

  /** Retrieve write object for this brand */
  writer(): BrandWriter {
    return new BrandWriter(this.engine, this)
  }

  // --- --- --- --- --- --- --- --- --- ---
  // MARK: - Methods

  /** Fetches all tokens available in this design system version belonging to this specific brand */
  async tokens(): Promise<Array<Token>> {
    let tokens = await this.dataCore.currentDesignSystemTokens(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let brandedTokens = tokens.filter(t => t.brandId === this.persistentId)
    return brandedTokens
  }

  /** Fetches all tokens and retrieves resolved array of tokens with applied themes */
  async tokensByApplyingThemes(themeIds: Array<string>): Promise<Array<Token>> {
    // Fetch both tokens and themes
    let tokens = await this.tokens()
    let themes = await this.themes()

    // Create (crude) hashed search index to make this more performant
    var index: { [key: string]: Map<string, Token> } = {}
    for (let id of themeIds) {
      let theme = themes.find(t => t.id === id)
      if (!theme) {
        throw new Error(
          `Can't apply themes to current tokens: Theme id ${id} doesn't exist in the current design system version`
        )
      }
      let overrides = new Map<string, Token>()
      for (let override of theme.overriddenTokens) {
        overrides.set(override.id, override)
      }
      index[id] = overrides
    }

    // Select each correct token by first searching the overrides in reverse order, or fallback to default token if not found in any
    let reverseIds = themeIds.reverse()
    let resolvedTokens: Array<Token> = []
    for (let token of tokens) {
      let override: Token | null = null
      for (let id of reverseIds) {
        let override = index[id].get(id) ?? null
        if (override) {
          // If there is override, prioritize that
          resolvedTokens.push(override)
          break
        }
      }
      if (!override) {
        // When no override was found in this pass, retrieve the token
        resolvedTokens.push(token)
      }
    }

    return resolvedTokens
  }

  /** Fetches all brands available in this design system version belonging to this specific brand */
  async themes(): Promise<Array<TokenTheme>> {
    let themes = await this.dataCore.currentDesignSystemThemes(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let brandedThemes = themes.filter(t => t.brandId === this.persistentId)
    return brandedThemes
  }

  /** Fetches all token groups available in this design system version belonging to this specific brand */
  async tokenGroups(): Promise<Array<TokenGroup>> {
    let groups = await this.dataCore.currentDesignSystemTokenGroups(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let brandedGroups = groups.filter(g => g.brandId === this.persistentId)
    return brandedGroups
  }

  /** Fetches root of the token group trees. This method returns roots specific to this brand, one group per category */
  async tokenGroupTrees(): Promise<Map<TokenType, TokenGroup>> {
    let groups = await this.dataCore.currentDesignSystemTokenGroups(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let rootGroups = groups.filter(g => g.isRoot && g.brandId === this.persistentId)

    let trees = new Map<TokenType, TokenGroup>()
    for (let group of rootGroups) {
      trees.set(group.tokenType, group)
    }

    return trees
  }

  /** Fetches all designComponents available in this design system version belonging to this specific brand */
  async components(): Promise<Array<Component>> {
    let components = await this.dataCore.currentDesignSystemComponents(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let brandedComponents = components.filter(c => c.brandId === this.persistentId)
    return brandedComponents
  }

  /** Fetches all designComponents (Figma for now) available in this design system version belonging to this specific brand */
  async designComponents(): Promise<Array<DesignComponent>> {
    let designComponents = await this.dataCore.currentDesignSystemDesignComponents(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let brandedDesignComponents = designComponents.filter(c => c.brandId === this.persistentId)
    return brandedDesignComponents
  }

  /** Fetches all designComponent groups as flattened array available in this design system version belonging to this specific brand */
  async designComponentGroups(): Promise<Array<DesignComponentGroup>> {
    let groups = await this.dataCore.currentDesignSystemDesignComponentGroups(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let brandedGroups = groups.filter(g => g.brandId === this.persistentId)
    return brandedGroups
  }

  /** Fetches root of the designComponent group tree. This group will contain any other top-level groups that user created and will belong to this specific brand */
  async designComponentGroupTree(): Promise<DesignComponentGroup> {
    let groups = await this.dataCore.currentDesignSystemDesignComponentGroups(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let rootGroups = groups.filter(g => g.isRoot && g.brandId === this.persistentId)
    return rootGroups[0]
  }

  /** Fetches all assets available in this design system version belonging to this specific brand */
  async assets(): Promise<Array<Asset>> {
    let assets = await this.dataCore.currentDesignSystemAssets(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let brandedAssets = assets.filter(a => a.brandId === this.persistentId)
    return brandedAssets
  }

  /** Fetches all asset groups as flattened array available in this design system version belonging to this specific brand */
  async assetGroups(): Promise<Array<AssetGroup>> {
    let groups = await this.dataCore.currentDesignSystemAssetGroups(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let brandedGroups = groups.filter(g => g.brandId === this.persistentId)
    return brandedGroups
  }

  /** Fetches root of the asset group tree. This group will contain any other top-level groups that user created and will be specific to this brand */
  async assetGroupTree(): Promise<AssetGroup> {
    let groups = await this.dataCore.currentDesignSystemAssetGroups(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion
    )
    let rootGroups = groups.filter(g => g.isRoot && g.brandId === this.persistentId)
    return rootGroups[0]
  }

  // --- --- --- --- --- --- --- --- --- ---
  // MARK: - Assets

  /** Renders all assets in this brand and retrieves URLs from which assets can be downloaded as key-value. You can only render one combination of size/format with one request - use more requests if you need to render more.
   *
   * Assets that are rendered as "png" will use "scale" attribute, however, when the format is "svg" or "pdf", scale attribute is ignored and will always render the original size.
   *
   * Note that assets are not persistent and URLs will expire quickly - you must download them and store them locally / remotely and can never use this URL publicly as it won't work after a short time */
  async renderedAssets(format: AssetFormat, scale: AssetScale): Promise<Array<RenderedAsset>> {
    let groups = await this.assetGroups()
    let assets = await this.assets()

    // Construct rendering request. Only one size can be rendered at once
    return await this.dataCore.renderAssetsForConfiguration(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion,
      assets,
      groups,
      format,
      scale
    )
  }

  /** Renders specific assets in this brand and retrieves URLs from which assets can be downloaded as key-value. You can only render one combination of size/format with one request - use more requests if you need to render more.
   *
   * Assets that are rendered as "png" will use "scale" attribute, however, when the format is "svg" or "pdf", scale attribute is ignored and will always render the original size.
   *
   * Note that assets are not persistent and URLs will expire quickly - you must download them and store them locally / remotely and can never use this URL publicly as it won't work after a short time */
  async specificRenderedAssets(
    assets: Array<Asset>,
    format: AssetFormat,
    scale: AssetScale
  ): Promise<Array<RenderedAsset>> {
    let groups = await this.assetGroups()

    // Construct rendering request. Only one size can be rendered at once
    return await this.dataCore.renderAssetsForConfiguration(
      this.designSystemVersion.designSystem.id,
      this.designSystemVersion,
      assets,
      groups,
      format,
      scale
    )
  }
}
