//
//  SDKDocumentationPageBlockAsset.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ColorTokenRemoteData } from "../../../model/tokens/remote/SDKRemoteTokenData"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockAssetModel {

    componentAssetId: string

    title?: string
    description?: string
    backgroundColor?: ColorTokenRemoteData // Will be changed to `backgroundColor`
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockAsset {
  
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

    assetId: string

    title: string | null
    description: string | null
    previewUrl: string | null
    backgroundColor: ColorTokenRemoteData | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockAssetModel, blockBackgroundColor: ColorTokenRemoteData | null) {
    
    this.assetId = model.componentAssetId

    this.title = model.title?.length > 0 ? model.title : null
    this.description = model.description?.length > 0 ? model.description : null
    this.backgroundColor = model.backgroundColor ?? blockBackgroundColor ?? null
  }
}
