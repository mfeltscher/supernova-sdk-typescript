//
//  SDKTypographyToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { v4 as uuidv4 } from 'uuid'
import { Brand, ElementProperty, MeasureToken, TextCase, TextDecoration, TokenType } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { TokenRemoteModel, TypographyTokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { TypographyTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { TypographyTokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class TypographyToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: TypographyTokenValue

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: TypographyTokenValue,
    alias: TypographyToken | null,
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
    value: object,
    alias: TypographyToken | null,
    referenceResolver: DTTokenReferenceResolver,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ): TypographyToken {
    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuidv4(),
      brandId: brand.persistentId,
      designSystemVersionId: version.id,
      type: TokenType.typography,
      meta: {
        name: name,
        description: description
      },
      data: {},
      customPropertyOverrides: []
    }

    if (value) {
      // Raw value
      let tokenValue = this.typographyValueFromDefinition(value, referenceResolver)
      return new TypographyToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    } else if (alias) {
      // Aliased value - copy and create raw from reference
      let tokenValue: TypographyTokenValue = {
        font: alias.value.font,
        fontSize: alias.value.fontSize,
        letterSpacing: alias.value.letterSpacing,
        lineHeight: alias.value.lineHeight,
        paragraphIndent: alias.value.paragraphIndent,
        paragraphSpacing: alias.value.paragraphSpacing,
        textDecoration: alias.value.textDecoration,
        textCase: alias.value.textCase,
        referencedToken: alias
      }

      return new TypographyToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    }
  }

  static typographyValueFromDefinition(
    definition: object,
    referenceResolver: DTTokenReferenceResolver
  ): TypographyTokenValue {
    // No validation because

    let value = {} as TypographyTokenValue // Empty container

    value.font = {
      family: definition['fontFamily'] ? definition['fontFamily'] : 'Roboto',
      subfamily: definition['fontWeight'] ? definition['fontWeight'] : 'Regular',
      referencedToken: undefined
    }

    value.fontSize = definition['fontSize']
      ? MeasureToken.measureValueFromDefinitionOrReference(definition['fontSize'], referenceResolver)
      : MeasureToken.measureValueFromDefinition('12px')
    value.letterSpacing = definition['letterSpacing']
      ? MeasureToken.measureValueFromDefinitionOrReference(definition['letterSpacing'], referenceResolver)
      : MeasureToken.measureValueFromDefinition('0')
    value.lineHeight = definition['lineHeight']
      ? MeasureToken.measureValueFromDefinitionOrReference(definition['lineHeight'], referenceResolver)
      : null
    value.paragraphIndent = definition['paragraphIndent']
      ? MeasureToken.measureValueFromDefinitionOrReference(definition['paragraphIndent'], referenceResolver)
      : MeasureToken.measureValueFromDefinition('0')
    value.paragraphSpacing = definition['paragraphSpacing']
      ? MeasureToken.measureValueFromDefinitionOrReference(definition['paragraphSpacing'], referenceResolver)
      : MeasureToken.measureValueFromDefinition('0')
    value.referencedToken = undefined

    let textDecoration = definition['textDecoration']
    if (textDecoration && typeof textDecoration === 'string') {
      if (textDecoration === 'underline') {
        value.textDecoration = TextDecoration.underline
      } else if (textDecoration === 'strikethrough') {
        value.textDecoration = TextDecoration.strikethrough
      } else {
        value.textDecoration = TextDecoration.original
      }
    } else {
      value.textDecoration = TextDecoration.original
    }

    let textCase = definition['textCase']
    if (textCase && typeof textCase === 'string') {
      textCase = textCase.toLowerCase().trim()
      if (textCase === 'camel' || textCase === 'camelcase') {
        value.textCase = TextCase.camel
      } else if (textCase === 'lower' || textCase === 'lowercase') {
        value.textCase = TextCase.lower
      } else if (textCase === 'upper' || textCase === 'uppercase') {
        value.textCase = TextCase.upper
      } else {
        value.textCase = TextCase.original
      }
    } else {
      value.textCase = TextCase.original
    }

    return value
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): TypographyTokenRemoteModel {
    let baseData = this.toBaseWriteObject()
    let specificData = baseData as TypographyTokenRemoteModel
    specificData.data = TypographyToken.valueToWriteObject(this.value)
    return specificData
  }

  static valueToWriteObject(
    value: TypographyTokenValue
  ): { aliasTo: string | undefined; value: TypographyTokenRemoteValue } {
    let valueObject = !value.referencedToken
      ? {
          font: {
            aliasTo: value.font.referencedToken ? value.font.referencedToken.id : undefined,
            value: value.font.referencedToken ? null : value.font
          },
          fontSize: {
            aliasTo: value.fontSize.referencedToken ? value.fontSize.referencedToken.id : undefined,
            value: value.fontSize.referencedToken
              ? null
              : {
                  measure: value.fontSize.measure,
                  unit: value.fontSize.unit
                }
          },
          letterSpacing: {
            aliasTo: value.letterSpacing.referencedToken ? value.letterSpacing.referencedToken.id : undefined,
            value: value.letterSpacing.referencedToken
              ? null
              : {
                  measure: value.letterSpacing.measure,
                  unit: value.letterSpacing.unit
                }
          },
          paragraphIndent: {
            aliasTo: value.paragraphIndent.referencedToken ? value.paragraphIndent.referencedToken.id : undefined,
            value: value.paragraphIndent.referencedToken
              ? null
              : {
                  measure: value.paragraphIndent.measure,
                  unit: value.paragraphIndent.unit
                }
          },
          paragraphSpacing: {
            aliasTo: value.paragraphSpacing.referencedToken ? value.paragraphSpacing.referencedToken.id : undefined,
            value: value.paragraphSpacing.referencedToken
              ? null
              : {
                  measure: value.paragraphSpacing.measure,
                  unit: value.paragraphSpacing.unit
                }
          },
          lineHeight: {
            aliasTo: value.lineHeight.referencedToken ? value.lineHeight.referencedToken.id : undefined,
            value: value.lineHeight.referencedToken
              ? null
              : {
                  measure: value.lineHeight.measure,
                  unit: value.lineHeight.unit
                }
          },
          textCase: value.textCase,
          textDecoration: value.textDecoration
        }
      : undefined

    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
