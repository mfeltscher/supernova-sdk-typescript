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
import { SupernovaError } from '../../core/errors/SDKSupernovaError'
import parseColor from "parse-color"

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

    if (value) {
      // Raw value
      let tokenValue = this.colorValueFromDefinition(value)
      return new ColorToken(version, baseToken, tokenValue, undefined)
    } else if (alias) {
      // Aliased value - copy and create raw from reference
      let tokenValue: ColorTokenValue = {
        hex: alias.value.hex,
        a: alias.value.a,
        r: alias.value.r,
        g: alias.value.g,
        b: alias.value.b,
        referencedToken: alias
      } 
      return new ColorToken(version, baseToken, tokenValue, undefined)
    }
  }

  static colorValueFromDefinition(definition: string): ColorTokenValue {

    let result = parseColor(definition)
    return {
      hex: result.hex.length === 7 ? result.hex + "ff" : result.hex,
      r: result.rgba[0],
      g: result.rgba[1],
      b: result.rgba[2],
      a: Math.max(0, Math.min(255, Math.round(result.rgba[3] * 255))),
      referencedToken: null
    }
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
