//
//  SDKWorkspaceNPMRegistry.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface WorkspaceNPMRegistryModel {
  enabledScopes: Array<string>,
  limitToScopes: boolean,
  registryUrl: string,
  proxyUrl: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class WorkspaceNPMRegistry {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  enabledScopes: Array<string>
  limitToScopes: boolean
  registryUrl: string
  proxyUrl: string

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: WorkspaceNPMRegistryModel) {
    this.enabledScopes = model.enabledScopes
    this.limitToScopes = model.limitToScopes
    this.registryUrl = model.registryUrl
    this.proxyUrl = model.proxyUrl
  }
}
