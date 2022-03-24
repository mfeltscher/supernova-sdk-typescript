//
//  DocumentationPageBlockColumnItem.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { MeasureTokenRemoteData } from "../../../model/tokens/remote/SDKRemoteTokenData"
import { ExporterCustomBlock } from "../../exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockColumnItemModel extends DocumentationPageBlockModel {
    
    width: MeasureTokenRemoteData
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockColumnItem extends DocumentationPageBlock {
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Public properties

    width: MeasureTokenRemoteData

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor

    constructor(model: DocumentationPageBlockColumnItemModel, customBlocks: Array<ExporterCustomBlock>, configuration: DocumentationConfiguration) {
        super(model, customBlocks, configuration)
        this.width = model.width
    }
}
