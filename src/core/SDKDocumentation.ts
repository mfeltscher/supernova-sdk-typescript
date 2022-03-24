//
//  SDKDocumentation.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

import { ExporterConfigurationProperty } from "../model/exporters/custom_properties/SDKExporterConfigurationProperty"
import { ExporterCustomBlock } from "../model/exporters/custom_blocks/SDKExporterCustomBlock"
import { DocumentationConfiguration, DocumentationConfigurationModel } from "../model/documentation/SDKDocumentationConfiguration"
import { DocumentationGroup } from "../model/documentation/SDKDocumentationGroup"
import { DocumentationItem } from "../model/documentation/SDKDocumentationItem"
import { DocumentationPage } from "../model/documentation/SDKDocumentationPage"
import { DocumentationItemType } from "../model/enums/SDKDocumentationItemType"
import { DesignSystemVersion } from "./SDKDesignSystemVersion"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationModel {
    settings: DocumentationConfigurationModel
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Function Definition

/** Main documentation accessor object. All data associated with documentation can be access through here, such as pages, groups, any block, and also any configuration your editors did. */
export class Documentation {

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Configuration

  /** Associated version */
  private version: DesignSystemVersion

  /** Documentation settings */
  settings: DocumentationConfiguration


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(version: DesignSystemVersion, model: DocumentationModel) {
      this.version = version
      this.settings = new DocumentationConfiguration(model.settings)
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Resolution


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Documentation accessors

  /** Main group to which all groups and pages belong. The root group never shows up inside the editor but is always present in data model */
  async rootGroup(): Promise<DocumentationGroup> {

    let items = await this.version.dataCore.currentDesignSystemDocumentationItems(this.version.designSystemId, this.version)
    for (let item of items) {
      if (item.type === DocumentationItemType.group && (item as DocumentationGroup).isRoot) {
        return item as DocumentationGroup
      }
    }
    throw new Error('No documentation root found')
  }

  /** All items, including pages, groups and group of tab type fetched together */
  async items(): Promise<Array<DocumentationItem>> {

    return this.version.dataCore.currentDesignSystemDocumentationItems(this.version.designSystemId, this.version)
  }

  /** All groups to which other groups and pages can belong. Each group also contains entire children chain pre-fetched and resolved for convenience */
  async groups(): Promise<Array<DocumentationGroup>> {

    let items = await this.version.dataCore.currentDesignSystemDocumentationItems(this.version.designSystemId, this.version)
    return items.filter(i => i.type === DocumentationItemType.group) as Array<DocumentationGroup>
  }

  /** All pages created within documentation presented as flat structure. Each page contains all data neccessary to render it pre-fetched and resolved for convenience */
  async pages(): Promise<Array<DocumentationPage>> {

    let items = await this.version.dataCore.currentDesignSystemDocumentationItems(this.version.designSystemId, this.version)
    return items.filter(i => i.type === DocumentationItemType.page) as Array<DocumentationPage>
  }

  /** All custom blocks that were registered with the active exporter configuration */
  async customBlocks(): Promise<Array<ExporterCustomBlock>> {

    return await this.version.dataCore.currentExporterCustomBlocks(this.version.designSystemId, this.version)
  }

  /** All custom configuration properties that are defined within the active exporter package */
  async customConfiguration(): Promise<Array<ExporterConfigurationProperty>> {

    return await this.version.dataCore.currentDocumentationConfigurationProperties(this.version.designSystemId, this.version)
  }
}