//
//  Workspace.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Exporter } from "../model/exporters/SDKExporter"
import { Supernova } from "../core/SDKSupernova"
import { DesignSystem } from "./SDKDesignSystem"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface WorkspaceRemoteModel {
    id: string
    profile: {
      name: string
      handle: string
      color: string
    }
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class Workspace {

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Properties

    /** Unique identifier of the workspace */
    id: string

    /** Unique URL handle of the workspace */
    handle: string

    /** Workspace name */
    name: string

    /** Private: Engine */
    engine: Supernova

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Constructor
        
    constructor(engine: Supernova, model: WorkspaceRemoteModel) {

        this.engine = engine
        
        this.id = model.id
        this.handle = model.profile.handle
        this.name = model.profile.name
        this.engine = engine
    }

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Methods

  /** Fetches design systems which belong to this workspace. */
  async designSystems(): Promise<Array<DesignSystem>> {

    return this.engine.designSystems(this.id)
  }

  /** Fetches exporters which belong to this workspace. */
  async exporters(): Promise<Array<Exporter>> {

    return this.engine.exporters(this.id)
  }
}