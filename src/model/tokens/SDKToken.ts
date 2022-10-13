//
//  SDKToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { BlurToken, ElementProperty, TokenGroup } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { TokenType } from '../enums/SDKTokenType'
import { TokenOrigin } from '../support/SDKTokenOrigin'
import { TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { AnyTokenValue, TokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class Token implements TokenValue {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  versionedId: string
  brandId: string
  designSystemVersionId: string
  name: string
  description: string
  tokenType: TokenType
  origin: TokenOrigin | null
  parent: TokenGroup | null
  sortOrder: number

  properties: Array<ElementProperty>
  propertyValues: object
  createdAt: Date | null
  updatedAt: Date | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    model: TokenRemoteModel,
    dsVersion: DesignSystemVersion,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ) {
    this.id = model.persistentId
    this.versionedId = model.id
    this.brandId = model.brandId
    this.designSystemVersionId = dsVersion.id
    this.name = model.meta.name
    this.description = model.meta.description
    this.tokenType = model.type
    this.origin = model.originStyle ? new TokenOrigin(model.originStyle) : null
    this.parent = null
    this.createdAt = model.createdAt ? new Date(model.createdAt) : null
    this.updatedAt = model.updatedAt ? new Date(model.updatedAt) : null

    // Set unordered when constructing
    this.sortOrder = -1

    this.properties = properties
    this.propertyValues = {}

    for (let value of propertyValues) {
      if (value.targetElementId === this.id) {
        // Property value refers to this element
        for (let property of properties) {
          if (property.persistentId === value.definitionId) {
            // Property value refers to the correct property, we get codeName from it and add it to quick-access
            this.propertyValues[property.codeName] = value.value
          }
        }
      }
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Manipulation

  setParent(parent: TokenGroup | null) {
    this.parent = parent ?? null
  }

  setSortOrder(order: number) {
    this.sortOrder = order
  }

  toBaseWriteObject(): TokenRemoteModel {
    return {
      id: this.versionedId,
      brandId: this.brandId,
      designSystemVersionId: this.designSystemVersionId,
      persistentId: this.id,
      type: this.tokenType,
      meta: {
        name: this.name,
        description: this.description ?? ''
      },
      originStyle: this.origin
        ? {
            id: this.origin.id ?? undefined,
            name: this.origin.name ?? undefined,
            sourceId: this.origin.sourceId ?? undefined
          }
        : undefined,
      customPropertyOverrides: [],
      data: undefined
    }
  }

  toWriteObject(): TokenRemoteModel {
    throw Error('Unable to write generic token')
  }
}
