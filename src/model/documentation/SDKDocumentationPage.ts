//
//  DocumentationPage.ts
//  SDKSupernova 
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationBlockBuilder } from "./builder/SDKDocumentationBlockBuilder"
import { ExporterCustomBlock } from "../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "./SDKDocumentationConfiguration"
import { DocumentationGroup } from "./SDKDocumentationGroup"
import { DocumentationItemModel, DocumentationItem } from "./SDKDocumentationItem"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "./SDKDocumentationPageBlock"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageModel extends DocumentationItemModel {
  blocks?: Array<DocumentationPageBlockModel>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPage extends DocumentationItem {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  /** All blocks that were defined on the top level of the page */
  blocks: Array<DocumentationPageBlock>

  /** Containing group. Can either be true group (abstract), or tab group */
  parent: DocumentationGroup

  /** Full path that can be used to construct full URL for specific page. Fetch domain and join [domain][fullPath] to obtain full url */
  fullPath: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model)
    if (model.blocks) {
      this.blocks = model.blocks.map(b => DocumentationBlockBuilder.fromGenericModel(b, customBlocks, configuration))
    }
    this.fullPath = null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  setFullPath(path: string) {
    this.fullPath = path
  }

  setParent(parent: DocumentationGroup) {
    this.parent = parent
  }
}
