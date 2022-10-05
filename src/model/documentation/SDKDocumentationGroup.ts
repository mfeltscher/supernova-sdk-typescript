//
//  SDKDocumentationGroup.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DocumentationGroupBehavior } from "../enums/SDKDocumentationGroupBehavior"
import { DocumentationItemType } from "../enums/SDKDocumentationItemType"
import { DocumentationItem, DocumentationItemModel } from "./SDKDocumentationItem"
import { DocumentationPage } from "./SDKDocumentationPage"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface DocumentationGroupModel extends DocumentationItemModel {
  isRoot: boolean
  childrenIds: Array<string>
  groupBehavior: DocumentationGroupBehavior
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class DocumentationGroup extends DocumentationItem {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  /** If true, this is unique within documentation (just one) that contains all top-level objects and is root of the docs tree (root > groups > items > blocks ...) */
  isRoot: boolean

  /** IDs of items belonging to the documentation group. Can be page or group */
  childrenIds: Array<string>

  /** Items belonging to the documentation group. Can be page or group */
  children: Array<DocumentationItem>

  /** Parent group reference */
  parent: DocumentationGroup | null

  /** Signifies how the group should behave. If set to "tabs", group behaves as "page", but contains multiple tabbed pages inside it. "Group" signifies virtual group used for content structuring */
  groupBehavior: DocumentationGroupBehavior

  /** Children filtered to be only groups */
  get subgroups(): Array<DocumentationGroup> {
    return this.children.filter(c => c.type === DocumentationItemType.group) as Array<DocumentationGroup>
  }

  /** Children filtered to be only pages */
  get pages(): Array<DocumentationPage> {
    return this.children.filter(c => c.type === DocumentationItemType.page) as Array<DocumentationPage>
  }

  /** Internal */
  relativeFirstPageUrl: string | null

  /** Internal */
  deployedFirstPageUrl: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationGroupModel) {
    super(model)
    this.isRoot = model.isRoot
    this.childrenIds = model.childrenIds
    this.children = new Array<DocumentationItem>()
    this.groupBehavior = model.groupBehavior
    this.relativeFirstPageUrl = null
    this.deployedFirstPageUrl = null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  addChild(item: DocumentationItem) {
    this.children.push(item)
  }

  addChildren(groups: Array<DocumentationItem>) {
    this.children = this.children.concat(groups)
  }

  setParent(parent: DocumentationGroup | null) {
    this.parent = parent ?? null
  }
  /** Internal: Modifies object with new paths. Don't use outside SDK environment as it doesn't propagate the data back to source */
  internalOverridePaths(relative: string | null, deployed: string | null) {
    this.relativeFirstPageUrl = relative
    this.deployedFirstPageUrl = deployed
  }

  /** Retrieve relative page path without the associated domain for the first page in the group. Will work even when documentation was not yet deployed */
  relativeDocsPageUrl(): string | null {
    return this.relativeFirstPageUrl
  }

  /** Retrieve page url for the first page in the group, if the documentation was already deployed (either default or custom domain) */
  deployedDocsPageUrl(): string | null {
    return this.deployedFirstPageUrl
  }
}
