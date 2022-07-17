//
//  SDKDesignComponentOrigin.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Source } from './SDKSource'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DesignComponentOriginModel {
    id: string,
    sourceId: string
    nodeId: string
    name?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DesignComponentOrigin {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  sourceType: "Figma"
  sourceId: string | null
  fileId: string | null
  fileName: string | null
  id: string | null
  nodeId: string | null
  name: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DesignComponentOriginModel, sources: Array<Source>) {
    this.sourceId = model.sourceId ?? null
    this.id = model.id ?? null
    this.nodeId = model.nodeId ?? null
    this.name = model.name ?? null
    this.fileId = null
    this.fileName = null

    if (model.sourceId) {
      let remoteSource = sources.filter(s => s.id === model.sourceId)[0]
      if (remoteSource) {
        this.sourceType = remoteSource.type
        this.fileId = remoteSource.fileId ?? null
        this.fileName = remoteSource.fileName ?? null
      }
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Conveniences

  remoteDesignComponentUrl(): string | undefined {

    if (this.sourceType === "Figma" && this.fileId && this.nodeId) {
      return `https://www.figma.com/file/${this.fileId}/${this.fileName ?? "unknown"}?node-id=${this.nodeId}`
    } else {
      return undefined
    }
  }
}
