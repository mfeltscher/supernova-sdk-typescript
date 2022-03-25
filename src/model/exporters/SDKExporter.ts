//
//  SDKExporter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ExporterCustomBlock, ExporterCustomBlockModel } from "./custom_blocks/SDKExporterCustomBlock"
import { ExporterCustomBlockVariant } from "./custom_blocks/SDKExporterCustomBlockVariant"
import { ExporterConfigurationProperty, ExporterConfigurationPropertyModel } from "./custom_properties/SDKExporterConfigurationProperty"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface ExporterModel {
    id: string
    packageId: string

    isPrivate: boolean
    isDefaultDocumentationExporter: boolean
    usesBrands: boolean

    name: string
    description: string
    version: string
    author: string
    organization: string
    homepage: string
    readme: string
    iconURL?: string
    tags: Array<string>

    githubUrl: string
    githubBranch?: string
    githubDirectory?: string

    blockVariants?: Object
    configurationProperties?: Array<ExporterConfigurationPropertyModel>
    customBlocks?: Array<ExporterCustomBlockModel>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- -- - --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class Exporter {

    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Public properties

    /** Unique exporter installation id. This id is used to referenced exporter within Supernova system (for example, in ds.documentationExporterId) */
    id: string

    /** Original exporter package id, as defined in exporter.json */
    packageId: string

    /** Store status of the exporter - private exporters are only visible to your workspace, while public are visible to everyone and can be installed by anyone */
    isPrivate: boolean

    /** If true, this exporter is currently being used for documentation purposes */
    isDefaultDocumentationExporter: boolean

    /** If true, this exporter uses branding functionality  */
    usesBrands: boolean

    /** Exporter human-readable name */
    name: string

    /** Exporter human-readable description */
    description: string | null

    /** Exporter semantic version */
    version: string

    /** Name of the package author */
    author: string | null

    /** Name of the package author's organization */
    organization: string | null

    /** Package marketing link */
    homepage: string | null

    /** Package ReadMe definition, defined as GitHub-style markdown */
    readme: string | null

    /** Exporter package icon */
    iconURL: string | null

    /** Exporter feature tags, such as iOS, React, token, styles, components etc. */
    tags: Array<string>

    /** Original location of the package, usually a github repository */
    origin: {
        /** URL of the repository containing the exporter package */
        repositoryUrl: string

        /** Branch of the repository containing the exporter package. If not provided, exporter is located at the default branch */
        repositoryBranch: string | null

        /** Root directory in the repository containing the exporter package. If not provided, exporter is located at the root directory */
        repositoryDirectory: string | null
    }

    /** Contribution of this exporter to the Supernova system */
    contributes: {
        /** Documentation block variants */
        blockVariants: Array<ExporterCustomBlockVariant>

        /** Documentation blocks */
        blocks: Array<ExporterCustomBlock>

        /** Exporter configuration */
        configuration: Array<ExporterConfigurationProperty>
    }


    // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
    // MARK: - Constructor

    constructor(data: ExporterModel) {
        this.id = data.id
        this.packageId = data.packageId

        this.isPrivate = data.isPrivate
        this.isDefaultDocumentationExporter = data.isDefaultDocumentationExporter
        this.usesBrands = data.usesBrands

        this.name = data.name
        this.description = data.description ?? null
        this.version = data.version
        this.author = data.author ?? null
        this.organization = data.organization ?? null
        this.homepage = data.homepage ?? null
        this.readme = data.readme ?? null
        this.iconURL = data.iconURL ?? null
        this.tags = data.tags ?? []

        this.origin = {
            repositoryUrl: data.githubUrl,
            repositoryBranch: data.githubBranch ?? null,
            repositoryDirectory: data.githubDirectory ?? null
        }

        let variants = new Array<ExporterCustomBlockVariant>()
        if (data.blockVariants) {
            for (let [key, value] of Object.entries(data.blockVariants)) {
                for (let v of value) {
                    let variant = new ExporterCustomBlockVariant(v, key)
                    variants.push(variant)
                }
            }
        }

        this.contributes = {
            blockVariants: variants,
            blocks: data.customBlocks ? data.customBlocks.map(b => new ExporterCustomBlock(b)) : [],
            configuration: data.configurationProperties ? data.configurationProperties.map(c => new ExporterConfigurationProperty(c, null)) : [] // in this case, configuration property is just settings and so it doesn't have value
        }
    }
}
