//
//  SDKSource.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface SourceRemoteModel {
  type: 'Figma'
  id: string
  fileName?: string
  linkType: 'Design' | 'Frames'
  brandId?: string
  plugin?: {
    fileId: string
    lastImportedAt?: string
  }
  cloud?: {
    fileId: string
    autoImportMode: 'Never' | 'Hourly'
    fileThumbnailUrl?: string
    lastUpdatesCheckedAt?: string
    lastImportedVersion?: {
      id: string
      created_at: string
      label?: string
      description: string
    }
    lastImportedAt?: string
    lastImportResult?: {
      sourceId: string
      brandId: string
      tokensCreated: number
      tokensUpdated: number
      tokensDeleted: number
      componentsCreated: number
      componentsUpdated: number
      componentsDeleted: number
      componentAssetsCreated: number
      componentAssetsUpdated: number
      componentAssetsDeleted: number
      isFailed: boolean
      versionId: string
      fileSize?: number
    }
    lastImportFramesResult?: {
      sourceId: string
      isFailed: string
      error?: string
      assetsInFile?: {
        frames: number
        components: number
      }
      invalidReferencesCount?: number
    }
    ownerId: string
    ownerUserName: string
    state: string
  }
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class Source {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  type: 'Figma'
  id: string
  fileName: string | null
  fileId: string | null
  autoImportMode: 'Never' | 'Hourly' | null
  fileThumbnailUrl: string | null
  lastUpdatesCheckedAt: string | null
  lastImportedVersion: {
    id: string
    created_at: string
    label: string | null
    description: string
  } | null
  lastImportedAt: string | null
  lastImportResult: {
    sourceId: string
    brandId: string
    tokensCreated: number
    tokensUpdated: number
    tokensDeleted: number
    componentsCreated: number
    componentsUpdated: number
    componentsDeleted: number
    componentAssetsCreated: number
    componentAssetsUpdated: number
    componentAssetsDeleted: number
    isFailed: boolean
    versionId: string
    fileSize: number | null
  } | null
  lastImportFramesResult: {
    sourceId: string
    isFailed: string
    error: string | null
    assetsInFile: {
      frames: number
      components: number
    } | null
    invalidReferencesCount: number | null
  } | null
  ownerId: string | null
  ownerUserName: string | null
  state: string | null
  linkType: 'Design' | 'Frames'
  brandId: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: SourceRemoteModel) {
    
    this.type = model.type
    this.id = model.id
    this.fileName = model.fileName ?? null
    this.fileId = model.cloud?.fileId ?? null
    this.autoImportMode = model.cloud?.autoImportMode ?? null
    this.fileThumbnailUrl = model.cloud?.fileThumbnailUrl ?? null
    this.lastUpdatesCheckedAt = model.cloud?.lastUpdatesCheckedAt ?? null
    if (model.cloud?.lastImportedVersion) {
        this.lastImportedVersion = {
            id: model.cloud.lastImportedVersion.id,
            created_at: model.cloud.lastImportedVersion.created_at,
            label: model.cloud.lastImportedVersion.label ?? null,
            description: model.cloud.lastImportedVersion.description,
        }
    } else {
        this.lastImportedVersion = null
    }
    this.lastImportedAt = model.cloud?.lastImportedAt ?? null
    if (model.cloud?.lastImportResult) {
        this.lastImportResult = {
            sourceId: model.cloud.lastImportResult.sourceId,
            brandId: model.cloud.lastImportResult.brandId,
            tokensCreated: model.cloud.lastImportResult.tokensCreated,
            tokensUpdated: model.cloud.lastImportResult.tokensUpdated,
            tokensDeleted: model.cloud.lastImportResult.tokensDeleted,
            componentsCreated: model.cloud.lastImportResult.componentsCreated,
            componentsUpdated: model.cloud.lastImportResult.componentsUpdated,
            componentsDeleted: model.cloud.lastImportResult.componentsDeleted,
            componentAssetsCreated: model.cloud.lastImportResult.componentAssetsCreated,
            componentAssetsUpdated: model.cloud.lastImportResult.componentAssetsUpdated,
            componentAssetsDeleted: model.cloud.lastImportResult.componentAssetsDeleted,
            isFailed: model.cloud.lastImportResult.isFailed,
            versionId: model.cloud.lastImportResult.versionId,
            fileSize: model.cloud.lastImportResult.fileSize ?? null
        }
    } else {
        this.lastImportResult = null
    }
    if (model.cloud?.lastImportFramesResult) {
        this.lastImportFramesResult = {
            sourceId: model.cloud.lastImportFramesResult.sourceId,
            isFailed: model.cloud.lastImportFramesResult.isFailed,
            error: model.cloud.lastImportFramesResult.error ?? null,
            assetsInFile: model.cloud.lastImportFramesResult.assetsInFile ? {
                frames: model.cloud.lastImportFramesResult.assetsInFile.frames,
                components: model.cloud.lastImportFramesResult.assetsInFile.components,
            } : null,
            invalidReferencesCount: model.cloud.lastImportFramesResult.invalidReferencesCount ?? null,
        }
    } else {
        this.lastImportFramesResult = null
    }

    this.ownerId = model.cloud?.ownerId ?? null
    this.ownerUserName = model.cloud?.ownerUserName ?? null
    this.state = model.cloud?.state ?? null
    this.linkType = model.linkType
    this.brandId = model.brandId ?? null
  }
}
