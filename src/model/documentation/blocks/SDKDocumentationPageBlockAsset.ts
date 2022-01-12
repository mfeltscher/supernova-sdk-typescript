//
//  SDKDocumentationPageBlockAsset.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockAssetModel {

    componentAssetId: string

    title?: string
    description?: string
    backgroundColor?: {
      value?: string | null
    }
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
    backgroundColor: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockAssetModel, color: string | null) {
    
    this.assetId = model.componentAssetId

    this.title = model.title?.length > 0 ? model.title : null
    this.description = model.description?.length > 0 ? model.description : null
    this.backgroundColor = model.backgroundColor?.value ?? color ?? null
  }
}
