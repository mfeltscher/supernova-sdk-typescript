//
//  ElementProperty.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

import { ElementPropertyOption, ElementPropertyOptionRemoteModel } from './SDKElementPropertyOption'
import { ElementPropertyValue } from './values/SDKElementPropertyValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export enum ElementPropertyType {
    text = 'Text',
    number = 'Number',
    boolean = 'Boolean',
    select = 'Select',
    generic = 'Generic',
    link = 'Link',
    url = 'URL'
}

export enum ElementPropertyTargetElementType {
    token = 'Token',
    component = 'Component',
    documentationPage = 'DocumentationPage'
}

export enum ElementPropertyLinkElementType {
    documentationItem = 'DocumentationItem',
    figmaComponent = 'FigmaComponent'
}

export interface ElementPropertyRemoteModel {
  id: string
  persistentId: string
  designSystemVersionId: string
  meta: {
    name: string
    description: string
  }
  codeName: string
  type: ElementPropertyType
  targetElementType: ElementPropertyTargetElementType
  linkElementType?: ElementPropertyLinkElementType
  options?: Array<ElementPropertyOptionRemoteModel>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ElementProperty {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  /** Unique id of the component property (data column) */
  id: string

  /** Unique persistent id of the component property (data column) */
  persistentId: string

  /** Specific design system version this property is contained in */
  designSystemVersionId: string

  /** Property name */
  name: string

  /** Code property name - guaranteed to be present, unique and code-safe */
  codeName: string

  /** Property description */
  description: string | null
  
  /** Base type */
  propertyType: ElementPropertyType

  /** Type of design system object this property is contained in - for example, if this property was configured for DS components, this will be of type `component` */
  targetElementType: ElementPropertyTargetElementType

  /** Type of design system object this property can be configured with */
  linkElementType: ElementPropertyLinkElementType | null 

  /** Property options, only available for `select` type */
  options: Array<ElementPropertyOption> | null


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ElementPropertyRemoteModel) {

    this.id = model.id
    this.persistentId = model.persistentId
    this.designSystemVersionId = model.designSystemVersionId

    this.name = model.meta.name
    this.codeName = model.codeName
    this.description = model.meta.description ?? null
    
    this.propertyType = model.type
    this.targetElementType = model.targetElementType
    this.linkElementType = model.linkElementType ?? null
    this.options = model.options ? model.options.map(o => new ElementPropertyOption(o)) : null
  }
}
