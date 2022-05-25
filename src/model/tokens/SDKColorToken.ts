//
//  SDKColorToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Brand } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { TokenType } from '../enums/SDKTokenType'
import { ColorTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { ColorTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { ColorTokenValue } from './SDKTokenValue'
import { uuid } from 'uuidv4';

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ColorToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: ColorTokenValue

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: ColorTokenValue,
    alias: ColorToken | null
  ) {
    super(baseToken, version)
    this.value = value
    if (alias) {
      this.value.referencedToken = alias
    }
  }

  static create(version: DesignSystemVersion, brand: Brand, name: string, description: string, value: string, alias: ColorToken | null): ColorToken {

    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuid(),
      brandId: brand.persistentId,
      designSystemVersionId: version.id,
      type: TokenType.color,
      meta: {
        name: name,
        description: description
      },
      data: {},
      customPropertyOverrides: []
    }

    // Construct value
    let hex = value.substr(1) // RRGGBBAA
    let r = parseInt(hex.slice(0, 2), 16)
    let g = parseInt(hex.slice(2, 4), 16)
    let b = parseInt(hex.slice(4, 6), 16)
    let a = parseInt(hex.slice(6, 8), 16)
    let tokenValue: ColorTokenValue = {
      hex: value,
      r: r,
      g: g,
      b: b,
      a: a,
      referencedToken: null
    }

    return new ColorToken(version, baseToken, tokenValue, alias)
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): ColorTokenRemoteModel {

    let baseData = this.toBaseWriteObject()
    let specificData = baseData as ColorTokenRemoteModel

    specificData.data = {
      aliasTo: this.value.referencedToken ? this.value.referencedToken.id : undefined,
      value: !this.value.referencedToken ? this.toWriteValueObject() : undefined,
    }

    return specificData
  }

  toWriteValueObject(): ColorTokenRemoteValue {
    return this.value.hex
  }
}
