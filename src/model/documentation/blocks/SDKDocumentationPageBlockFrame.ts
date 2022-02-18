//
//  DocumentationPageBlockFrame.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

import { ColorTokenRemoteData } from "model/tokens/remote/SDKRemoteTokenData"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockFrameModel {

    sourceFileId: string,
    sourceFrameId: string,

    title?: string
    description?: string
    backgroundColor?: ColorTokenRemoteData

    origin: {
        sourceFileName: string
        title: string
        previewUrl: string
        valid: boolean
    }
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockFrame {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

    sourceFileId: string
    sourceFrameId: string
    sourceFileName: string

    title: string | null
    description: string | null
    previewUrl: string
    backgroundColor: ColorTokenRemoteData | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockFrameModel, blockBackgroundColor: ColorTokenRemoteData | null) {

    this.sourceFileId = model.sourceFileId
    this.sourceFrameId = model.sourceFrameId
    this.sourceFileName = model.origin.sourceFileName

    this.title = model.title.length > 0 ? model.title : model.origin.title ?? null
    this.description = model.description.length > 0 ? model.description : null
    this.previewUrl = model.origin.previewUrl
    this.backgroundColor = model.backgroundColor ?? blockBackgroundColor ?? null
  }
}
