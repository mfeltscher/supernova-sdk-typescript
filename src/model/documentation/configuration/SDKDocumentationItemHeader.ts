//
//  SDKDocumentationItemHeader.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ColorTokenRemoteData } from "../../../model/tokens/remote/SDKRemoteTokenData"
import { Alignment } from "../../../model/enums/SDKAlignment"
import { AssetScaleType } from "../../../model/enums/SDKAssetScaleType"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationItemHeaderModel {
  backgroundImageAssetUrl?: string
  description: string
  alignment: Alignment
  foregroundColor?: ColorTokenRemoteData
  backgroundColor?: ColorTokenRemoteData
  backgroundImageAssetId?: string
  backgroundImageScaleType:  AssetScaleType
  showBackgroundOverlay: boolean
  showCoverText: boolean
  minHeight: number
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationItemHeader {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  backgroundImageAssetUrl: string | null
  backgroundImageAssetId: string | null
  backgroundImageScaleType:  AssetScaleType

  description: string

  alignment: Alignment
  foregroundColor: ColorTokenRemoteData | null
  backgroundColor: ColorTokenRemoteData | null
  showBackgroundOverlay: boolean
  showCoverText: boolean
  minHeight: number

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationItemHeaderModel) {

    this.backgroundImageAssetUrl = model.backgroundImageAssetUrl ?? null
    this.backgroundImageAssetId = model.backgroundImageAssetId ?? null
    this.backgroundImageScaleType = model.backgroundImageScaleType

    this.description = model.description

    this.alignment = model.alignment
    this.foregroundColor = model.foregroundColor ?? null
    this.backgroundColor = model.backgroundColor ?? null
    this.showBackgroundOverlay = model.showBackgroundOverlay
    this.showCoverText = model.showCoverText
    this.minHeight = model.minHeight
  }
}
