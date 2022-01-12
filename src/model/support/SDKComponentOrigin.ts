//
//  SDKComponentOrigin.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { SourceType } from '../enums/SDKSourceType'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ComponentOriginModel {
    id: string,
    sourceId: string
    nodeId: string
    name?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ComponentOrigin {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  source: SourceType
  sourceId: string | null
  id: string | null
  nodeId: string | null
  name: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ComponentOriginModel) {
    this.source = SourceType.figma // Always Figma for now
    this.sourceId = model.sourceId ?? null
    this.id = model.id ?? null
    this.nodeId = model.nodeId ?? null
    this.name = model.name ?? null
  }
}
