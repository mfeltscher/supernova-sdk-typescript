//
//  SDKExporterCustomBlock.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ExporterCustomBlockProperty, ExporterCustomBlockPropertyModel } from "./SDKExporterCustomBlockProperty"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ExporterCustomBlockModel {
  key: string
  title: string
  description: string
  category: string

  iconURL: string

  mode: ExporterCustomBlockMode
  properties: Array<ExporterCustomBlockPropertyModel>
}

export enum ExporterCustomBlockMode {
  block = 'block'
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ExporterCustomBlock {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  key: string
  title: string
  description: string
  category: string

  iconUrl: string | null
  
  mode: ExporterCustomBlockMode
  properties: Array<ExporterCustomBlockProperty>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ExporterCustomBlockModel) {
    this.key = model.key
    this.title = model.title
    this.description = model.description
    this.category = model.category
    this.iconUrl = model.iconURL ?? null
    this.mode = model.mode
    this.properties = model.properties.map(p => new ExporterCustomBlockProperty(p))
  }
}
