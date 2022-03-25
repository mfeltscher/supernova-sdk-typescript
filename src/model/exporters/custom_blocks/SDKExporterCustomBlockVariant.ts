//
//  SDKExporterCustomBlockVariant.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ExporterCustomBlockVariantModel {
  key: string
  name: string
  isDefault: boolean
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ExporterCustomBlockVariant {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  blockKey: string
  variantKey: string
  name: string
  isDefault: boolean

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ExporterCustomBlockVariantModel, blockKey: string) {

    this.blockKey = blockKey
    this.variantKey = model.key
    this.name = model.name

    this.isDefault = model.hasOwnProperty("isDefault") ? model.isDefault : false
  }
}
