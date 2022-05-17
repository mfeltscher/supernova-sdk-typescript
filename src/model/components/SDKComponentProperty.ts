//
//  ComponentProperty.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

import { ComponentPropertyOption, ComponentPropertyOptionRemoteModel } from './SDKComponentPropertyOption'
import { ComponentPropertyValue } from './values/SDKComponentPropertyValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export enum ComponentPropertyType {
    text = 'Text',
    number = 'Number',
    boolean = 'Boolean',
    select = 'Select',
    generic = 'Generic',
    link = 'Link'
}

export enum ComponentPropertyTargetElementType {
    token = 'Token',
    component = 'Component',
    documentationPage = 'DocumentationPage'
}

export enum ComponentPropertyLinkElementType {
    documentationItem = 'DocumentationItem',
    figmaComponent = 'FigmaComponent'
}

export interface ComponentPropertyRemoteModel {
  id: string
  persistentId: string
  designSystemVersionId: string
  meta: {
    name: string
    description: string
  }
  codeName: string
  type: ComponentPropertyType
  targetElementType: ComponentPropertyTargetElementType
  linkElementType?: ComponentPropertyLinkElementType
  options?: Array<ComponentPropertyOptionRemoteModel>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ComponentProperty {
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
  propertyType: ComponentPropertyType

  /** Type of design system object this property is contained in - for example, if this property was configured for DS components, this will be of type `component` */
  targetElementType: ComponentPropertyTargetElementType

  /** Type of design system object this property can be configured with */
  linkElementType: ComponentPropertyLinkElementType | null 

  /** Property options, only available for `select` type */
  options: Array<ComponentPropertyOption> | null


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: ComponentPropertyRemoteModel) {

    this.id = model.id
    this.persistentId = model.persistentId
    this.designSystemVersionId = model.designSystemVersionId

    this.name = model.meta.name
    this.codeName = model.codeName
    this.description = model.meta.description ?? null
    
    this.propertyType = model.type
    this.targetElementType = model.targetElementType
    this.linkElementType = model.linkElementType ?? null
    this.options = model.options ? model.options.map(o => new ComponentPropertyOption(o)) : null
  }
}
