//
//  DocumentationPageBlockTable.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ExporterCustomBlock } from "../../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"
import { DocumentationPageBlockTableColumn, DocumentationPageBlockTableColumnModel } from "./SDKDocumentationPageBlockTableColumn"
import { DocumentationPageBlockTableRow, DocumentationPageBlockTableRowModel } from "./SDKDocumentationPageBlockTableRow"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockTableModel extends DocumentationPageBlockModel {
  tableProperties: {
      showBorders: boolean,
      showHeaderRow: boolean,
      showHeaderColumn: boolean,
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
        showHeaderRow: boolean
        showHeaderColumn: boolean
        columns: Array<DocumentationPageBlockTableColumn>
    }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationPageBlockTableModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
    super(model, customBlocks, configuration)
    this.tableProperties = {
        showBorders: model.tableProperties.showBorders,
        showHeaderRow: model.tableProperties.showHeaderRow,
        showHeaderColumn: model.tableProperties.showHeaderColumn,
        columns: model.tableProperties.columns.map(c => new DocumentationPageBlockTableColumn(c))
    }
  }
}
