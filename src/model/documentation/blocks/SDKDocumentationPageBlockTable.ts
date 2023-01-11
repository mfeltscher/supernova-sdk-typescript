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
import { DocumentationPageBlockTableCell } from "./SDKDocumentationPageBlockTableCell"
import { DocumentationPageBlockTableColumn, DocumentationPageBlockTableColumnModel } from "./SDKDocumentationPageBlockTableColumn"
import { DocumentationPageBlockTableRow, DocumentationPageBlockTableRowModel } from "./SDKDocumentationPageBlockTableRow"
import { DocumentationPageBlockText } from "./SDKDocumentationPageBlockText"


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

    let order = new Map<string, number>()
    let index = 0
    for (let column of this.tableProperties.columns) {
      order.set(column.id, index++)
    }

    for (let block of this.children) {
      let row = block as DocumentationPageBlockTableRow
      row.children = row.children.sort((a: DocumentationPageBlockTableCell, b: DocumentationPageBlockTableCell) => order.get(a.columnId) - order.get(b.columnId))
    }
  }
}

