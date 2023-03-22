//
//  SDKBorderToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { BorderPosition, Brand, ColorToken, ElementProperty, MeasureToken, ShadowToken, TokenType } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { BorderTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { BorderTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { BorderTokenValue } from './SDKTokenValue'
import { v4 as uuidv4 } from 'uuid'
import { SupernovaError } from '../../core/errors/SDKSupernovaError'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class BorderToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: BorderTokenValue

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: BorderTokenValue,
    alias: BorderToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ) {
    super(baseToken, version, properties, propertyValues)
    this.value = value
    if (alias) {
      this.value.referencedToken = alias
    }
  }


  static create(
    version: DesignSystemVersion,
    brand: Brand,
    name: string,
    description: string,
    value: object,
    alias: BorderToken | null,
    referenceResolver: DTTokenReferenceResolver,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ): BorderToken {
    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuidv4(),
      brandId: brand.persistentId,
      designSystemVersionId: version.id,
      type: TokenType.border,
      meta: {
        name: name,
        description: description
      },
      data: {},
      customPropertyOverrides: []
    }
    console.log("creating  border token value")
    if (value) {
      // Raw value
      console.log("creating raw token")
      let tokenValue = this.borderValueFromDefinition(value, referenceResolver)
      return new BorderToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    } else if (alias) {
      console.log("creating aliased token")
      // Aliased value - copy and create raw from reference
      let tokenValue: BorderTokenValue = {
        color: alias.value.color,
        width: alias.value.width,
        position: alias.value.position,
        referencedToken: alias
      }

      return new BorderToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    }
  }

  static borderValueFromDefinition(definition: object, referenceResolver: DTTokenReferenceResolver): BorderTokenValue {
    // For now, handle only one shadow in multiple shadow layers
    if (definition instanceof Array) {
      if (definition.length > 0) {
        definition = definition[0]
      } else {
        // Empty definition needs to fallback to proper SN definition - make it transparent shadow with 0 0 0 0 values
        definition = {
          color: "rgba(0,0,0,0)",
          position: "outside", 
          width: 0,
          type: "border"
        }
      }
    }

    if (
      !definition.hasOwnProperty('color') ||
      !definition.hasOwnProperty('width')
    ) {
      throw SupernovaError.fromSDKError(
        `Border definition is missing one of required properties (color, width), was ${JSON.stringify(
          definition
        )}`
      )
    }

    let value = {} as BorderTokenValue // Empty container

    value.color = ColorToken.colorValueFromDefinitionOrReference(definition['color'], referenceResolver)
    value.position = BorderPosition.outside
    value.width = MeasureToken.measureValueFromDefinitionOrReference(definition['width'], referenceResolver)
    // TODO: Position, style

    if (value.color === undefined) {
      throw new Error(`Unable to resolve value 'color' for border token definition \n${JSON.stringify(definition, null, 2)}\n Did you possibly use incorrect reference?`)
    }
    if (value.position === undefined) {
      throw new Error(`Unable to resolve value 'position' for border token definition \n${JSON.stringify(definition, null, 2)}\n Did you possibly use incorrect reference?`)
    }
    if (value.width === undefined) {
      throw new Error(`Unable to resolve value 'width' for border token definition \n${JSON.stringify(definition, null, 2)}\n Did you possibly use incorrect reference?`)
    }

    return value
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): BorderTokenRemoteModel {
    let baseData = this.toBaseWriteObject()
    let specificData = baseData as BorderTokenRemoteModel
    specificData.data = BorderToken.valueToWriteObject(this.value)
    return specificData
  }

  static valueToWriteObject(value: BorderTokenValue): { aliasTo: string | undefined; value: BorderTokenRemoteValue } {
    let valueObject = !value.referencedToken
    ? {
        color: {
          aliasTo: value.color.referencedToken ? value.color.referencedToken.id : undefined,
          value: value.color.referencedToken ? null : value.color.hex
        },
        width: {
          aliasTo: value.width.referencedToken ? value.width.referencedToken.id : undefined,
          value: value.width.referencedToken
            ? null
            : {
                measure: value.width.measure,
                unit: value.width.unit
              }
        },
        position: value.position,
        isEnabled: true
      }
    : undefined
    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
