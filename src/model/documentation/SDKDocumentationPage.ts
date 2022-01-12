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
import { DocumentationCustomBlock } from "./custom_blocks/SDKDocumentationCustomBlock"
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

  blocks: Array<DocumentationPageBlock>
  parent: DocumentationGroup

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageModel, customBlocks: Array<DocumentationCustomBlock>, configuration: DocumentationConfiguration) {
    super(model)
    if (model.blocks) {
      this.blocks = model.blocks.map(b => DocumentationBlockBuilder.fromGenericModel(b, customBlocks, configuration))
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience
  setParent(parent: DocumentationGroup) {
    this.parent = parent
  }
}
