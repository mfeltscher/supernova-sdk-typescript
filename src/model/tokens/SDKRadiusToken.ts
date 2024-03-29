//
//  SDKRadiusToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { v4 as uuidv4 } from 'uuid'
import { Brand, ElementProperty, MeasureToken, TokenType } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { RadiusTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { RadiusTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { RadiusTokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class RadiusToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: RadiusTokenValue

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: RadiusTokenValue,
    alias: RadiusToken | null,
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
    alias: RadiusToken | MeasureToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ): RadiusToken {
    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuidv4(),
      brandId: brand.persistentId,
      designSystemVersionId: version.id,
      type: TokenType.radius,
      meta: {
        name: name,
        description: description
      },
      data: {},
      customPropertyOverrides: []
    }

    if (value !== undefined && value !== null) {
      // Raw value
      let tokenValue = this.radiusValueFromDefinition(value)
      return new RadiusToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    } else if (alias) {
      if (alias instanceof MeasureToken) {
        // If measure token was referenced, create raw value of radius token from it and discard the reference to at least it gets imported
        let tokenValue: RadiusTokenValue = {
          radius: {
            unit: alias.value.unit,
            measure: alias.value.measure,
            referencedToken: undefined
          },
          topLeft: null,
          topRight: null,
          bottomLeft: null,
          bottomRight: null,
          referencedToken: null
        }
        return new RadiusToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
      } else {
        // Aliased value - copy and create raw from reference
        let tokenValue: RadiusTokenValue = {
          radius: {
            unit: alias.value.radius.unit,
            measure: alias.value.radius.measure,
            referencedToken: undefined
          },
          topLeft: alias.value.topLeft
            ? {
                unit: alias.value.topLeft.unit,
                measure: alias.value.topLeft.measure,
                referencedToken: undefined
              }
            : null,
          topRight: alias.value.topRight
            ? {
                unit: alias.value.topRight.unit,
                measure: alias.value.topRight.measure,
                referencedToken: undefined
              }
            : null,
          bottomLeft: alias.value.bottomLeft
            ? {
                unit: alias.value.bottomLeft.unit,
                measure: alias.value.bottomLeft.measure,
                referencedToken: undefined
              }
            : null,
          bottomRight: alias.value.bottomRight
            ? {
                unit: alias.value.bottomRight.unit,
                measure: alias.value.bottomRight.measure,
                referencedToken: undefined
              }
            : null,
          referencedToken: alias
        }
        return new RadiusToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
      }
      // Handle references to aliases
    }
  }

  static radiusValueFromDefinition(definition: string | number): RadiusTokenValue {
    if (typeof definition === 'number') {
      return {
        radius: MeasureToken.measureValueFromDefinition(definition),
        topLeft: null,
        topRight: null,
        bottomLeft: null,
        bottomRight: null,
        referencedToken: null
      }
    }

    let corners = definition.split(',')
    if (corners.length === 1) {
      // Uniform corner description
      let measure = MeasureToken.measureValueFromDefinition(definition)
      return {
        radius: measure,
        topLeft: null,
        topRight: null,
        bottomLeft: null,
        bottomRight: null,
        referencedToken: null
      }
    } else if (corners.length === 4) {
      // 4 corner description
      return {
        radius: MeasureToken.measureValueFromDefinition(corners[0]), // Use top left corner for radius for now
        topLeft: MeasureToken.measureValueFromDefinition(corners[0]),
        topRight: MeasureToken.measureValueFromDefinition(corners[1]),
        bottomLeft: MeasureToken.measureValueFromDefinition(corners[2]),
        bottomRight: MeasureToken.measureValueFromDefinition(corners[3]),
        referencedToken: null
      }
    } else {
      return {
        radius: MeasureToken.measureValueFromDefinition('0'),
        topLeft: null,
        topRight: null,
        bottomLeft: null,
        bottomRight: null,
        referencedToken: null
      }
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): RadiusTokenRemoteModel {
    let baseData = this.toBaseWriteObject()
    let specificData = baseData as RadiusTokenRemoteModel
    specificData.data = RadiusToken.valueToWriteObject(this.value)
    return specificData
  }

  static valueToWriteObject(value: RadiusTokenValue): { aliasTo: string | undefined; value: RadiusTokenRemoteValue } {
    let valueObject = !value.referencedToken
      ? {
          radius: {
            aliasTo: value.radius.referencedToken ? value.radius.referencedToken.id : undefined,
            value: value.radius.referencedToken
              ? null
              : {
                  measure: value.radius.measure,
                  unit: value.radius.unit
                }
          },
          topLeft: value.topLeft
            ? {
                aliasTo: value.topLeft.referencedToken ? value.topLeft.referencedToken.id : undefined,
                value: value.topLeft.referencedToken
                  ? null
                  : {
                      measure: value.topLeft.measure,
                      unit: value.topLeft.unit
                    }
              }
            : null,
          topRight: value.topRight
            ? {
                aliasTo: value.topRight.referencedToken ? value.topRight.referencedToken.id : undefined,
                value: value.topRight.referencedToken
                  ? null
                  : {
                      measure: value.topRight.measure,
                      unit: value.topRight.unit
                    }
              }
            : null,
          bottomLeft: value.bottomLeft
            ? {
                aliasTo: value.bottomLeft.referencedToken ? value.bottomLeft.referencedToken.id : undefined,
                value: value.bottomLeft.referencedToken
                  ? null
                  : {
                      measure: value.bottomLeft.measure,
                      unit: value.bottomLeft.unit
                    }
              }
            : null,
          bottomRight: value.bottomRight
            ? {
                aliasTo: value.bottomRight.referencedToken ? value.bottomRight.referencedToken.id : undefined,
                value: value.bottomRight.referencedToken
                  ? null
                  : {
                      measure: value.bottomRight.measure,
                      unit: value.bottomRight.unit
                    }
              }
            : null
        }
      : undefined

    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
