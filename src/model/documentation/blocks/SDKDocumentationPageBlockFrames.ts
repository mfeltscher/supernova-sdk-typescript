//
//  DocumentationPageBlockFrames.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { FrameAlignment } from "../../enums/SDKFrameAlignment"
import { FrameLayout } from "../../enums/SDKFrameLayout"
import { DocumentationCustomBlock } from "../custom_blocks/SDKDocumentationCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"
import { DocumentationPageBlockFrameModel, DocumentationPageBlockFrame } from "./SDKDocumentationPageBlockFrame"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockFramesModel extends DocumentationPageBlockModel {
    figmaFrames: Array<DocumentationPageBlockFrameModel>
    figmaFrameProperties: {
        alignment: FrameAlignment,
        backgroundColor?: {
            value: string | null
        },
        layout: FrameLayout,
        showTitles: boolean
    }
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockFrames extends DocumentationPageBlock {
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Public properties

    frames: Array<DocumentationPageBlockFrame>
    properties: {
        backgroundColor: string | null
        alignment: FrameAlignment,
        layout: FrameLayout,
        showTitles: boolean
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor

    constructor(model: DocumentationPageBlockFramesModel, customBlocks: Array<DocumentationCustomBlock>, configuration: DocumentationConfiguration) {
        super(model, customBlocks, configuration)
        let color = model.figmaFrameProperties?.backgroundColor?.value ?? null
        this.properties = {
            backgroundColor: color,
            showTitles: model.figmaFrameProperties.showTitles,
            alignment: model.figmaFrameProperties?.alignment ?? FrameAlignment.center,
            layout: model.figmaFrameProperties?.layout ?? FrameLayout.c4
        }
        this.frames = model.figmaFrames.map(f => new DocumentationPageBlockFrame(f, color))
    }
}
