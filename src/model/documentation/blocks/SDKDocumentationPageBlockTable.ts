//
//  DocumentationPageBlockTable.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationCustomBlock } from "../custom_blocks/SDKDocumentationCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"
import { DocumentationPageBlockTableColumn, DocumentationPageBlockTableColumnModel } from "./SDKDocumentationPageBlockTableColumn"
import { DocumentationPageBlockTableRow, DocumentationPageBlockTableRowModel } from "./SDKDocumentationPageBlockTableRow"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockTableModel extends DocumentationPageBlockModel {
  tableProperties: {
      showBorders: boolean,
      columns: Array<DocumentationPageBlockTableColumnModel>
  },
  rows: Array<DocumentationPageBlockTableRowModel>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockTable extends DocumentationPageBlock {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

    tableProperties: {
        showBorders: boolean
        columns: Array<DocumentationPageBlockTableColumn>
    }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockTableModel, customBlocks: Array<DocumentationCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
    this.tableProperties = {
        showBorders: model.tableProperties.showBorders,
        columns: model.tableProperties.columns.map(c => new DocumentationPageBlockTableColumn(c))
    }
  }
}
