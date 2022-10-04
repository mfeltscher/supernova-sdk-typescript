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

    specificData.data = {
      aliasTo: this.value.referencedToken ? this.value.referencedToken.id : undefined,
      value: !this.value.referencedToken ? this.toWriteValueObject() : undefined
    }

    return specificData
  }

  toWriteValueObject(): ShadowTokenRemoteValue {
    return {
      color: {
        aliasTo: this.value.color.referencedToken ? this.value.color.referencedToken.id : undefined,
        value: this.value.color.referencedToken ? null : this.value.color.hex
      },
      isEnabled: true,
      x: {
        aliasTo: this.value.x.referencedToken ? this.value.x.referencedToken.id : undefined,
        value: this.value.x.referencedToken
          ? null
          : {
              measure: this.value.x.measure,
              unit: this.value.x.unit
            }
      },
      y: {
        aliasTo: this.value.y.referencedToken ? this.value.y.referencedToken.id : undefined,
        value: this.value.y.referencedToken
          ? null
          : {
              measure: this.value.y.measure,
              unit: this.value.y.unit
            }
      },
      spread: {
        aliasTo: this.value.spread.referencedToken ? this.value.spread.referencedToken.id : undefined,
        value: this.value.spread.referencedToken
          ? null
          : {
              measure: this.value.spread.measure,
              unit: this.value.spread.unit
            }
      },
      radius: {
        aliasTo: this.value.radius.referencedToken ? this.value.radius.referencedToken.id : undefined,
        value: this.value.radius.referencedToken
          ? null
          : {
              measure: this.value.radius.measure,
              unit: this.value.radius.unit
            }
      },
      opacity: this.value.opacity,
      type: this.value.type
    }
  }
}
