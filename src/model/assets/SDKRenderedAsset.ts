//
//  Supernova SDK
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { AssetGroup } from "../../model/groups/SDKAssetGroup"
import { AssetFormat } from "../../model/enums/SDKAssetFormat"
import { AssetScale } from "../../model/enums/SDKAssetScale"
import { Asset } from "./SDKAsset"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface RenderedAssetModel {

    assetId: string
    fileName: string
    sourceUrl: string
    settings: {
        prefix: string
        suffix: string
        scale: AssetScale
        format: AssetFormat
    }
    originalName: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class RenderedAsset {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  assetId: string
  fileName: string
  originalName: string
  sourceUrl: string
  asset: Asset
  group: AssetGroup
  
  scale: AssetScale
  format: AssetFormat
  previouslyDuplicatedNames: number


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: RenderedAssetModel, asset: Asset, group: AssetGroup, duplicates: number) {
    
    this.assetId = model.assetId
    this.fileName = model.fileName
    this.sourceUrl = model.sourceUrl
    this.originalName = model.originalName

    this.asset = asset
    this.group = group

    this.scale = model.settings.scale
    this.format = model.settings.format
    this.previouslyDuplicatedNames = duplicates
  }
}
