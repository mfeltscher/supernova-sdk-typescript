//
//  SDKToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

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
  brandId: string
  name: string
  description: string
  tokenType: TokenType
  origin: TokenOrigin | null
  properties: Array<TokenProperty>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: TokenRemoteModel, dsVersion: DesignSystemVersion) {
    this.id = model.persistentId
    this.brandId = model.brandId
    this.name = model.meta.name
    this.description = model.meta.description
    this.tokenType = model.type
    this.origin = model.originStyle ? new TokenOrigin(model.originStyle) : null
    this.properties = this.buildProperties(model, dsVersion)
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
}
