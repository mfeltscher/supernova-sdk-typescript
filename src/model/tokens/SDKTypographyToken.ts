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
import { Brand, MeasureToken, TextCase, TextDecoration, TokenType } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
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
    alias: TypographyToken | null
  ) {
    super(baseToken, version)
    this.value = value
    if (alias) {
      this.value.referencedToken = alias
    }
  }


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Static building

  static create(version: DesignSystemVersion, brand: Brand, name: string, description: string, value: object, alias: TypographyToken | null, referenceResolver: DTTokenReferenceResolver): TypographyToken {

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
      return new TypographyToken(version, baseToken, tokenValue, undefined)
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
        referencedToken: alias,
      }

      return new TypographyToken(version, baseToken, tokenValue, undefined)
    }
  }

  static typographyValueFromDefinition(definition: object, referenceResolver: DTTokenReferenceResolver): TypographyTokenValue {

    // No validation because

    let value = {} as TypographyTokenValue // Empty container

    value.font = {
      family: definition["fontFamily"] ? definition["fontFamily"] : "Roboto",
      subfamily: definition["fontWeight"] ? definition["fontWeight"] : "Regular",
      referencedToken: undefined
    }

    value.fontSize = definition["fontSize"] ? MeasureToken.measureValueFromDefinitionOrReference(definition["fontSize"], referenceResolver) : MeasureToken.measureValueFromDefinition("12px")
    value.letterSpacing = definition["letterSpacing"] ? MeasureToken.measureValueFromDefinitionOrReference(definition["letterSpacing"], referenceResolver) : MeasureToken.measureValueFromDefinition("0")
    value.lineHeight = definition["lineHeight"] ? MeasureToken.measureValueFromDefinitionOrReference(definition["lineHeight"], referenceResolver) : null
    value.paragraphIndent = definition["paragraphIndent"] ? MeasureToken.measureValueFromDefinitionOrReference(definition["paragraphIndent"], referenceResolver) : MeasureToken.measureValueFromDefinition("0")
    value.paragraphSpacing = definition["paragraphSpacing"] ? MeasureToken.measureValueFromDefinitionOrReference(definition["paragraphSpacing"], referenceResolver) : MeasureToken.measureValueFromDefinition("0")
    value.referencedToken = undefined

    let textDecoration = definition["textDecoration"]
    if (textDecoration && typeof textDecoration === "string") {
      if (textDecoration === "underline") {
        value.textDecoration = TextDecoration.underline
      } else if (textDecoration === "strikethrough") {
        value.textDecoration = TextDecoration.strikethrough
      } else {
        value.textDecoration = TextDecoration.original
      }
    } else {
      value.textDecoration = TextDecoration.original
    }

    let textCase = definition["textCase"]
    if (textCase && typeof textCase === "string") {
      textCase = textCase.toLowerCase().trim()
      if (textCase === "camel" || textCase === "camelcase") {
        value.textCase = TextCase.camel
      } else if (textCase === "lower" || textCase === "lowercase") {
        value.textCase = TextCase.lower
      } else if (textCase === "upper" || textCase === "uppercase") {
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

    specificData.data = {
      aliasTo: this.value.referencedToken ? this.value.referencedToken.id : undefined,
      value: !this.value.referencedToken ? this.toWriteValueObject() : undefined,
    }

    return specificData
  }

  toWriteValueObject(): TypographyTokenRemoteValue {

    return {
      font: {
        aliasTo: this.value.font.referencedToken ? this.value.font.referencedToken.id : undefined,
        value: this.value.font.referencedToken ? null : this.value.font
      },
      fontSize: {
        aliasTo: this.value.fontSize.referencedToken ? this.value.fontSize.referencedToken.id : undefined,
        value: this.value.fontSize.referencedToken ? null : {
          measure: this.value.fontSize.measure,
          unit: this.value.fontSize.unit
        }
      },
      letterSpacing: {
        aliasTo: this.value.letterSpacing.referencedToken ? this.value.letterSpacing.referencedToken.id : undefined,
        value: this.value.letterSpacing.referencedToken ? null : {
          measure: this.value.letterSpacing.measure,
          unit: this.value.letterSpacing.unit
        }
      },
      paragraphIndent: {
        aliasTo: this.value.paragraphIndent.referencedToken ? this.value.paragraphIndent.referencedToken.id : undefined,
        value: this.value.paragraphIndent.referencedToken ? null : {
          measure: this.value.paragraphIndent.measure,
          unit: this.value.paragraphIndent.unit
        }
      },
      paragraphSpacing: {
        aliasTo: this.value.paragraphSpacing.referencedToken ? this.value.paragraphSpacing.referencedToken.id : undefined,
        value: this.value.paragraphSpacing.referencedToken ? null : {
          measure: this.value.paragraphSpacing.measure,
          unit: this.value.paragraphSpacing.unit
        }
      },
      lineHeight: {
        aliasTo: this.value.lineHeight.referencedToken ? this.value.lineHeight.referencedToken.id : undefined,
        value: this.value.lineHeight.referencedToken ? null : {
          measure: this.value.lineHeight.measure,
          unit: this.value.lineHeight.unit
        }
      },
      textCase: this.value.textCase,
      textDecoration: this.value.textDecoration
    }
  }
}
