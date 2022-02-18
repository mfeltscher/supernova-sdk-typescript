//
//  SDKDocumentationPageBlockAssets.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ColorTokenRemoteData } from "../../../model/tokens/remote/SDKRemoteTokenData"
import { FrameAlignment } from "../../enums/SDKFrameAlignment"
import { FrameLayout } from "../../enums/SDKFrameLayout"
import { DocumentationCustomBlock } from "../custom_blocks/SDKDocumentationCustomBlock"
import { DocumentationConfiguration } from "../SDKDocumentationConfiguration"
import { DocumentationPageBlockModel, DocumentationPageBlock } from "../SDKDocumentationPageBlock"
import { DocumentationPageBlockAssetModel, DocumentationPageBlockAsset } from "./SDKDocumentationPageBlockAsset"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationPageBlockAssetsModel extends DocumentationPageBlockModel {
    componentAssets: Array<DocumentationPageBlockAssetModel>
    figmaFrameProperties: {
        alignment: FrameAlignment,
        color?: ColorTokenRemoteData,
        layout: FrameLayout
    }
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationPageBlockAssets extends DocumentationPageBlock {
    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Public properties

    assets: Array<DocumentationPageBlockAsset>
    properties: {
        backgroundColor: ColorTokenRemoteData | null // Will be changed to `backgroundColor`
        alignment: FrameAlignment,
        layout: FrameLayout
    }

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor

    constructor(model: DocumentationPageBlockAssetsModel, customBlocks: Array<DocumentationCustomBlock>, configuration: DocumentationConfiguration) {

        super(model, customBlocks, configuration)
        let color = model.figmaFrameProperties?.color ?? null
        this.properties = {
            backgroundColor: color,
            alignment: model.figmaFrameProperties?.alignment ?? FrameAlignment.center,
            layout: model.figmaFrameProperties?.layout ?? FrameLayout.c4
        }
        this.assets = model.componentAssets.map(f => new DocumentationPageBlockAsset(f, color))
    }
}
