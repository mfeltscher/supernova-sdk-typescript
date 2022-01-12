//
//  DocumentationPageUnorderedList.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationCustomBlock } from "../custom_blocks/SDKDocumentationCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockTextModel, DocumentationPageBlockText } from "./SDKDocumentationPageBlockText"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageUnorderedListModel extends DocumentationPageBlockTextModel {}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageUnorderedList extends DocumentationPageBlockText {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageUnorderedListModel, customBlocks: Array<DocumentationCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
  }
}
