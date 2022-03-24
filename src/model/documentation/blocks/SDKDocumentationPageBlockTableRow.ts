//
//  DocumentationPageBlockTableRow.ts
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


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockTableRowModel extends DocumentationPageBlockModel {
    
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockTableRow extends DocumentationPageBlock {
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Public properties


    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor

    constructor(model: DocumentationPageBlockTableRowModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
        super(model, customBlocks, configuration)
    }
}
