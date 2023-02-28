// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationPageAssetType } from '../enums/SDKDocumentationPageAssetType'
import { DocumentationPageBlockFrame, DocumentationPageBlockFrameModel } from './blocks/SDKDocumentationPageBlockFrame'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageAssetModel {
  id: string
  url?: string
  type: DocumentationPageAssetType
  figmaFrame?: DocumentationPageBlockFrameModel
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageAsset {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  url: string | null
  type: DocumentationPageAssetType
  frame: DocumentationPageBlockFrame | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageAssetModel) {
    this.id = model.id
    this.url = model.url ?? null
    this.type = model.type
    this.frame = model.figmaFrame ? new DocumentationPageBlockFrame(model.figmaFrame, null) : null
  }
}
