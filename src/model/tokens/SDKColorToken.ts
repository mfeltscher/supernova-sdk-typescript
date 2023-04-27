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
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { ColorTokenRemoteData } from './remote/SDKRemoteTokenData'

import parseColor from 'parse-color'
import { parseToRgba, toHex } from 'color2k'
const matchAll = require('string.prototype.matchall')

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
    let normalizedDefinition = this.normalizeColor(definition)
    let result = parseColor(normalizedDefinition)
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

  static normalizeColor(color: string): string | null {
    // This function is taken directly from figma tokens plugin, so the implementation aligns for the importer:
    // https://github.com/tokens-studio/figma-plugin/blob/main/src/utils/color/convertToRgb.ts
    try {
      if (typeof color !== 'string') {
        return color
      }
      const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g
      const hslaRegex = /(hsla?\(.*?\))/g
      const rgbaRegex = /(rgba?\(.*?\))/g
      let returnedColor = color

      try {
        const matchesRgba = Array.from(matchAll(returnedColor, rgbaRegex), m => m[0])
        const matchesHsla = Array.from(matchAll(returnedColor, hslaRegex), m => m[0])
        if (matchesHsla.length > 0) {
          matchesHsla.forEach(match => {
            returnedColor = returnedColor.replace(match, toHex(match))
          })
        }
        if (matchesRgba.length > 0) {
          matchesRgba.forEach(match => {
            const matchedString = match
            const matchedColor = match.replace(/rgba?\(/g, '').replace(')', '')
            const matchesHexInsideRgba = matchedColor.match(hexRegex)
            let r
            let g
            let b
            let alpha = '1'
            if (matchesHexInsideRgba) {
              ;[r, g, b] = parseToRgba(matchesHexInsideRgba[0])
              alpha =
                matchedColor
                  .split(',')
                  .pop()
                  ?.trim() ?? '0'
            } else {
              ;[r, g, b, alpha = '1'] = matchedColor.split(',').map(n => n.trim())
            }
            const a = this.normalizeOpacity(alpha)
            returnedColor = returnedColor.split(matchedString).join(toHex(`rgba(${r}, ${g}, ${b}, ${a})`))
          })
        }
      } catch (e) {
        throw new Error(
          `Unable to parse provided color '${color}'. Supported formats are: \nrgb(r <number>, g <number>, b <number>)\nrgba(r <number>, g <number>, b <number>, a <number | percentage>\nhsl(h <number>, s <percentage>, l <percentage>>\nhsla(h <number>, s <percentage>, l <percentage>, a <number | percentage>\nred | blue | black ...)`
        )
      }
      return returnedColor
    } catch (e) {
      throw e
    }
  }

  static normalizeOpacity(value: string): number {
    // Matches 50%, 100%, etc.
    const matched = value.match(/(\d+%)/)
    if (matched) {
      return Number(matched[0].slice(0, -1)) / 100
    }
    return Number(value)
  }

  static normalizedHex(value: string | null): string | null {
    if (!value) {
      return null
    }
    if (value.startsWith('#')) {
      return value
    }
    return `#${value}`
  }

  static colorValueFromDefinitionOrReference(
    definition: any,
    referenceResolver: DTTokenReferenceResolver
  ): ColorTokenValue | undefined {
    if (referenceResolver.valueHasReference(definition)) {
      if (!referenceResolver.isBalancedReference(definition)) {
        // Internal syntax of reference corrupted
        throw new Error(`Invalid reference syntax in token value: ${definition}`)
      }
      if (referenceResolver.valueIsPureReference(definition)) {
        // When color is pure reference, we can immediately resolve it
        let reference = referenceResolver.lookupReferencedToken(definition) as ColorToken
        if (!reference) {
          return undefined
        }
        return {
          referencedToken: reference,
          hex: reference.value.hex,
          a: reference.value.a,
          r: reference.value.r,
          g: reference.value.g,
          b: reference.value.b
        }
      } else {
        // When color is not a pure reference, we must resolve it further before we can resolve it
        let references = referenceResolver.lookupAllReferencedTokens(definition)
        if (!references) {
          // Still unable to solve the reference, continue looking in some other tokens
          return undefined
        } else {
          // Resolved all internal references
          let resolvedValue = referenceResolver.replaceAllReferencedTokens(definition, references)
          return this.colorValueFromDefinition(resolvedValue)
        }
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
    let valueObject = !value.referencedToken ? ColorToken.normalizedHex(value.hex) : undefined
    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
