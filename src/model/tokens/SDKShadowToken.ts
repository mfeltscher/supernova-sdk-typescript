//
//  SDKShadowToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { v4 as uuidv4 } from 'uuid'
import { Brand, TokenType, MeasureToken, ColorToken, ShadowType, ElementProperty } from '../..'
import { SupernovaError } from '../../core/errors/SDKSupernovaError'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { ShadowTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { ShadowTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { ShadowTokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ShadowToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: ShadowTokenValue
  shadowLayers: Array<ShadowToken>
  isVirtual: boolean

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: ShadowTokenValue,
    alias: ShadowToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ) {
    super(baseToken, version, properties, propertyValues)
    this.value = value
    this.shadowLayers = new Array<ShadowToken>()
    this.isVirtual = false

    if (alias) {
      value.referencedToken = alias
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
    alias: ShadowToken | null,
    referenceResolver: DTTokenReferenceResolver,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ): ShadowToken {
    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuidv4(),
      brandId: brand.persistentId,
      designSystemVersionId: version.id,
      type: TokenType.shadow,
      meta: {
        name: name,
        description: description
      },
      data: {},
      customPropertyOverrides: []
    }

    if (value) {
      // Raw value
      let tokenValue = this.shadowValueFromDefinition(value, referenceResolver)
      return new ShadowToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    } else if (alias) {
      // Aliased value - copy and create raw from reference
      let tokenValue: ShadowTokenValue = {
        color: alias.value.color,
        x: alias.value.x,
        y: alias.value.y,
        spread: alias.value.spread,
        radius: alias.value.radius,
        opacity: alias.value.opacity,
        type: alias.value.type,
        referencedToken: alias
      }

      return new ShadowToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    }
  }

  static shadowValueFromDefinition(definition: object, referenceResolver: DTTokenReferenceResolver): ShadowTokenValue {
    // For now, handle only one shadow in multiple shadow layers
    if (definition instanceof Array) {
      if (definition.length > 0) {
        definition = definition[0]
      } else {
        throw SupernovaError.fromSDKError(`Box Shadow definition must contain at least one shadow layer`)
      }
    }

    if (
      !definition.hasOwnProperty('x') ||
      !definition.hasOwnProperty('y') ||
      !definition.hasOwnProperty('blur') ||
      !definition.hasOwnProperty('spread') ||
      !definition.hasOwnProperty('color') ||
      !definition.hasOwnProperty('type')
    ) {
      throw SupernovaError.fromSDKError(
        `Box Shadow definition is missing one of required properties (x, y, blur, spread, color, type), was ${JSON.stringify(
          definition
        )}`
      )
    }

    let value = {} as ShadowTokenValue // Empty container

    value.x = MeasureToken.measureValueFromDefinitionOrReference(definition['x'], referenceResolver)
    value.y = MeasureToken.measureValueFromDefinitionOrReference(definition['y'], referenceResolver)
    value.radius = MeasureToken.measureValueFromDefinitionOrReference(definition['blur'], referenceResolver)
    value.spread = MeasureToken.measureValueFromDefinitionOrReference(definition['spread'], referenceResolver)
    value.color = ColorToken.colorValueFromDefinitionOrReference(definition['color'], referenceResolver)
    value.opacity = 1
    value.type = definition['type'] === 'innerShadow' ? ShadowType.inner : ShadowType.drop

    return value
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): ShadowTokenRemoteModel {
    let baseData = this.toBaseWriteObject()
    let specificData = baseData as ShadowTokenRemoteModel
    specificData.data = ShadowToken.valueToWriteObject(this.value)
    return specificData
  }

  static valueToWriteObject(value: ShadowTokenValue): { aliasTo: string | undefined; value: ShadowTokenRemoteValue } {
    let valueObject = !value.referencedToken
      ? {
          color: {
            aliasTo: value.color.referencedToken ? value.color.referencedToken.id : undefined,
            value: value.color.referencedToken ? null : value.color.hex
          },
          isEnabled: true,
          x: {
            aliasTo: value.x.referencedToken ? value.x.referencedToken.id : undefined,
            value: value.x.referencedToken
              ? null
              : {
                  measure: value.x.measure,
                  unit: value.x.unit
                }
          },
          y: {
            aliasTo: value.y.referencedToken ? value.y.referencedToken.id : undefined,
            value: value.y.referencedToken
              ? null
              : {
                  measure: value.y.measure,
                  unit: value.y.unit
                }
          },
          spread: {
            aliasTo: value.spread.referencedToken ? value.spread.referencedToken.id : undefined,
            value: value.spread.referencedToken
              ? null
              : {
                  measure: value.spread.measure,
                  unit: value.spread.unit
                }
          },
          radius: {
            aliasTo: value.radius.referencedToken ? value.radius.referencedToken.id : undefined,
            value: value.radius.referencedToken
              ? null
              : {
                  measure: value.radius.measure,
                  unit: value.radius.unit
                }
          },
          opacity: value.opacity,
          type: value.type
        }
      : undefined

    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
