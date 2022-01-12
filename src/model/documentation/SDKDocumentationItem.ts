//
//  DocumentationItem.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationItemType } from "../enums/SDKDocumentationItemType"
import { DocumentationItemConfiguration, DocumentationItemConfigurationModel } from "./configuration/SDKDocumentationItemConfiguration"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationItemModel {
  persistentId: string
  id: string
  designSystemVersionId: string
  title: string
  type: DocumentationItemType
  slug: string
  userSlug?: string
  configuration: DocumentationItemConfigurationModel
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationItem {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  persistentId: string
  type: DocumentationItemType
  title: string
  configuration: DocumentationItemConfiguration

  slug: string
  userSlug: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationItemModel) {
    this.id = model.id
    this.persistentId = model.persistentId
    this.type = model.type
    this.configuration = new DocumentationItemConfiguration(model.configuration)

    this.slug = model.slug
    this.userSlug = model.userSlug ?? null
    this.title = model.title
  }
}
