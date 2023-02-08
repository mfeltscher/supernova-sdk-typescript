//
//  FrameOriginModel.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2023 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface FrameOriginModel {
  title?: string
  previewUrl?: string
  referenceId?: string
  sourceFileName?: string
  valid?: boolean
  assetId?: string
  assetScale?: string
  width?: number
  height?: number
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class FrameOrigin {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  sourceFileName: string | null
  sourceFrameId: string | null
  sourceId: string | null

  title: string | null
  previewUrl: string | null
  referenceId: string | null
  valid: boolean | null
  assetId: string | null
  assetScale: string | null
  width: number | null
  height: number | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: FrameOriginModel, sourceId: string | null, sourceFrameId: string | null) {
    this.sourceFileName = model.sourceFileName ?? null
    this.sourceFrameId = sourceFrameId
    this.sourceId = sourceId
    this.title = model.title ?? null
    this.previewUrl = model.previewUrl ?? null
    this.referenceId = model.referenceId ?? null
    this.valid = model.valid ?? null
    this.assetId = model.assetId ?? null
    this.assetScale = model.assetScale ?? null
    this.width = model.width ?? null
    this.height = model.height ?? null
  }
}
