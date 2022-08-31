//
//  SDKToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenGroup } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { TokenType } from '../enums/SDKTokenType'
import { TokenOrigin } from '../support/SDKTokenOrigin'
import { TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { TokenProperty } from './SDKTokenProperty'
import { TokenValue } from './SDKTokenValue'

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
  properties: Array<TokenProperty>
  parent: TokenGroup | null
  sortOrder: number
  createdAt: Date | null
  updatedAt: Date | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: TokenRemoteModel, dsVersion: DesignSystemVersion) {
    this.id = model.persistentId
    this.versionedId = model.id
    this.brandId = model.brandId
    this.designSystemVersionId = dsVersion.id
    this.name = model.meta.name
    this.description = model.meta.description
    this.tokenType = model.type
    this.origin = model.originStyle ? new TokenOrigin(model.originStyle) : null
    this.properties = this.buildProperties(model, dsVersion)
    this.parent = null
    this.createdAt = model.createdAt ? new Date(model.createdAt) : null
    this.updatedAt = model.updatedAt ? new Date(model.updatedAt) : null

    // Set unordered when constructing
    this.sortOrder = -1
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Manipulation

  setParent(parent: TokenGroup | null) {
    this.parent = parent ?? null
  }

  setSortOrder(order: number) {
    this.sortOrder = order
  }

  buildProperties(model: TokenRemoteModel, dsVersion: DesignSystemVersion): Array<TokenProperty> {
    // Construct all custom properties of the tokens, even if they are not overriden, for easy export
    let properties = new Array<TokenProperty>()
    for (let property of dsVersion.customTokenProperties) {
      let override = model.customPropertyOverrides.filter(p => p.propertyId === property.id)
      let tokenProp
      if (override.length > 0) {
        // Create property with override
        tokenProp = new TokenProperty(
          property.name,
          property.codeName,
          property.type,
          override[0].value ?? property.defaultValue
        )
      } else {
        // Create property with just the default value
        tokenProp = new TokenProperty(property.name, property.codeName, property.type, property.defaultValue)
      }
      properties.push(tokenProp)
    }

    return properties
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
        description: this.description ?? ""
      },
      originStyle: this.origin ? {
        id: this.origin.id ?? undefined,
        name: this.origin.name ?? undefined,
        sourceId: this.origin.sourceId ?? undefined
      } : undefined,
      customPropertyOverrides: [],
      data: undefined
    }
  }

  toWriteObject(): TokenRemoteModel {

    throw Error("Unable to write generic token")
  }
}
