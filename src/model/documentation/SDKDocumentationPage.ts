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

  /** Internal */
  private fullDeployedUrl: string | null

  /** Internal */
  private relativeUrl: string | null

  /** Internal */
  private editorUrl: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model)
    if (model.blocks) {
      this.blocks = model.blocks.map(b => DocumentationBlockBuilder.fromGenericModel(b, customBlocks, configuration))
    }
    this.fullDeployedUrl = null
    this.relativeUrl = null
    this.editorUrl = null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  /** Internal: Modifies object with new paths. Don't use outside SDK environment as it doesn't propagate the data back to source */
  internalOverridePaths(deployed: string | null, editor: string | null, relative: string | null) {
    this.editorUrl = editor
    this.fullDeployedUrl = deployed
    this.relativeUrl = relative
  }

  /** Internal: Sets new parent. Used when manipulating with object internally. Don't use outside SDK environment */
  setParent(parent: DocumentationGroup) {
    this.parent = parent
  }

  /** Retrieve editor page URL that can be opened */
  editorPageUrl(): string | null {
    return this.editorUrl
  }

  /** Retrieve documentation page URL, if the documentation was already deployed (either default or custom domain) */
  deployedDocsPageUrl(): string | null {
    return this.fullDeployedUrl
  }

  /** Retrieve relative page path without the associated domain. Will work even when documentation was not yet deployed */
  relativeDocsPageUrl(): string | null {
    return this.relativeUrl
  }
}
