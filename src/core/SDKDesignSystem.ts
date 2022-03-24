//
//  DesignSystem.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Supernova } from "../core/SDKSupernova"
import { File, FileRemoteModel } from "../model/support/SDKFile"
import { DesignSystemVersion } from "./SDKDesignSystemVersion"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Interface

export interface DesignSystemRemoteModel {
    id: string
    meta: {
      name: string
      description: string
    }
    workspaceId: string
    basePrefixes: string[]
    sources: Array<FileRemoteModel>

    isPublic: boolean
    isMultibrand: boolean

    docSlug: string
    docUserSlug?: string
    docExporterId: string
  }


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

export class DesignSystem {

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Properties

    /** Unique identifier of design system */
    id: string

    /** Unique identifier of the workspace in which this design system was created */
    workspaceId: string
  
    /** Design system name */
    name: string

    /** Design system description */
    description: string

    /** Sources that are used to feed the design system with the data (design & code) */
    sources: Array<File>

    /** If enabled, parts of the design system can be accessed by public (for example, documentation site) */
    isPublic: boolean

    /** If set, signals that multibrand functionality is enabled for this design system */
    isMultiBrand: boolean

    /** Unique identifier of exporter package used for the documentation */
    documentationExporterId: string

    /** Documentation URL slug */
    documentationSlug: string

    /** Documentation URL slug - user override */
    documentationUserSlug: string | null

    /** Internal: Engine */
    engine: Supernova

    
    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Constructor
  
    constructor(engine: Supernova, model: DesignSystemRemoteModel) {

      this.engine = engine
      this.id = model.id
      this.workspaceId = model.workspaceId
  
      this.name = model.meta.name
      this.description = model.meta.description

      this.isMultiBrand = model.isMultibrand
      this.isPublic = model.isPublic
      this.documentationExporterId = model.docExporterId
      this.documentationSlug = model.docSlug
      this.documentationUserSlug = model.docUserSlug ?? null
      
      if (model.sources) {
        this.sources = model.sources.map(s => new File(s))
      } else {
        this.sources = []
      }
    }
  

    // --- --- --- --- --- --- --- --- --- --- 
    // MARK: - Methods

    /** Fetches all versions that were created in the design system. Note that there is always at least one version - the "draft" - if there was no version created manually. */
    async versions(): Promise<Array<DesignSystemVersion>> {

      return this.engine.designSystemVersions(this.id)
    }

    /** Fetches active design system version - the one to which all changes are being written currently. There is always one active version at any moment. */
    async activeVersion(): Promise<DesignSystemVersion> {

      return this.engine.activeDesignSystemVersion(this.id)
    }
  }