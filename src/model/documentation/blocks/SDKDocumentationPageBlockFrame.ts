//
//  DocumentationPageBlockFrame.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

import { ColorTokenRemoteData } from "../../../model/tokens/remote/SDKRemoteTokenData"
import { FrameOrigin, FrameOriginModel } from "../../support/SDKFrameOrigin"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockFrameModel {

    sourceId: string,
    sourceFrameId: string,

    title?: string
    description?: string
    backgroundColor?: ColorTokenRemoteData

    origin: FrameOriginModel
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockFrame {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

    title: string | null
    description: string | null
    previewUrl: string
    backgroundColor: ColorTokenRemoteData | null
    origin: FrameOrigin | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockFrameModel, blockBackgroundColor: ColorTokenRemoteData | null) {

    this.title = model.title.length > 0 ? model.title : model.origin.title ?? null
    this.description = model.description.length > 0 ? model.description : null
    this.previewUrl = model.origin.previewUrl
    this.backgroundColor = model.backgroundColor ?? blockBackgroundColor ?? null
    this.origin = model.origin ? new FrameOrigin(model.origin, model.sourceId, model.sourceFrameId) : null
  }
}
