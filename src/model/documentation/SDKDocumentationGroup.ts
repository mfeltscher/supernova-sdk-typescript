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

  isRoot: boolean
  childrenIds: Array<string>
  children: Array<DocumentationItem>
  parent: DocumentationGroup | null
  groupBehavior: DocumentationGroupBehavior

  get subgroups(): Array<DocumentationGroup> {
    return this.children.filter(c => c.type === DocumentationItemType.group) as Array<DocumentationGroup>
  }
  get pages(): Array<DocumentationPage> {
    return this.children.filter(c => c.type === DocumentationItemType.page) as Array<DocumentationPage>
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: DocumentationGroupModel) {
    super(model)
    this.isRoot = model.isRoot
    this.childrenIds = model.childrenIds
    this.children = new Array<DocumentationItem>()
    this.groupBehavior = model.groupBehavior
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
}
