//
//  SDKDocumentationConfiguration.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

import { WorkspaceNPMRegistry } from "../support/SDKWorkspaceNPMRegistry"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationConfigurationModel {
  tabbed: boolean
  storybookEmbedErrorMessage?: string
  renderCodePackageJson?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationConfiguration {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  tabbedNavigation: boolean
  storybookError: string | null
  packageJson: string | null
  npmRegistry: WorkspaceNPMRegistry | null


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationConfigurationModel, registry: WorkspaceNPMRegistry | null) {
    this.tabbedNavigation = model.tabbed
    this.storybookError = model.storybookEmbedErrorMessage ?? null
    this.packageJson = model.renderCodePackageJson ?? null
    this.npmRegistry = registry ?? null
  }
}
