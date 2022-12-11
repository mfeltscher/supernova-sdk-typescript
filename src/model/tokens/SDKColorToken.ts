//
//  SDKColorToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Brand, ElementProperty } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { TokenType } from '../enums/SDKTokenType'
import { ColorTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { ColorTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { ColorTokenValue } from './SDKTokenValue'
import { v4 as uuidv4 } from 'uuid'
import { SupernovaError } from '../../core/errors/SDKSupernovaError'
import parseColor from 'parse-color'
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { ColorTokenRemoteData } from './remote/SDKRemoteTokenData'

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
    alias: ColorToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ) {
    super(baseToken, version, properties, propertyValues)
    this.value = value
    if (alias) {
      this.value.referencedToken = alias
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Static building

  static create(
    version: DesignSystemVersion,
    brand: Brand,
    name: string,
    description: string,
    value: string,
    alias: ColorToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ): ColorToken {
    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuidv4(),
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
      return new ColorToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
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
      return new ColorToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    }
  }

  static colorValueFromDefinition(definition: string): ColorTokenValue {
    let result = parseColor(definition)
    if (!result || result.hex === undefined) {
      throw SupernovaError.fromSDKError(
        `Unable to parse provided color value '${definition}'. Hex, RGB, HSL, HSV or CMYK are supported`
      )
    }
    return {
      hex: result.hex.length === 7 ? result.hex + 'ff' : result.hex,
      r: result.rgba[0],
      g: result.rgba[1],
      b: result.rgba[2],
      a: Math.max(0, Math.min(255, Math.round(result.rgba[3] * 255))),
      referencedToken: null
    }
  }

  static colorValueFromDefinitionOrReference(
    definition: any,
    referenceResolver: DTTokenReferenceResolver
  ): ColorTokenValue {
    if (referenceResolver.valueHasReference(definition)) {
      let reference = referenceResolver.lookupReferencedToken(definition) as ColorToken
      return {
        referencedToken: reference,
        hex: reference.value.hex,
        a: reference.value.a,
        r: reference.value.r,
        g: reference.value.g,
        b: reference.value.b
      }
    } else {
      return this.colorValueFromDefinition(definition)
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): ColorTokenRemoteModel {
    let baseData = this.toBaseWriteObject()
    let specificData = baseData as ColorTokenRemoteModel
    specificData.data = ColorToken.valueToWriteObject(this.value)
    return specificData
  }

  static valueToWriteObject(value: ColorTokenValue): { aliasTo: string | undefined; value: ColorTokenRemoteValue } {
    let valueObject = !value.referencedToken ? (value.hex.startsWith("#") ? value.hex : `#${value.hex}`) : undefined
    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
