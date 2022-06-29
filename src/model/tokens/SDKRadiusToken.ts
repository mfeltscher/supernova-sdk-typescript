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
import { Brand, MeasureToken, TokenType, Unit } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { RadiusTokenRemoteData } from './remote/SDKRemoteTokenData'
import { MeasureTokenRemoteModel, RadiusTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { MeasureTokenRemoteValue, RadiusTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { MeasureTokenValue, RadiusTokenValue } from './SDKTokenValue'

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
    alias: RadiusToken | null
  ) {
    super(baseToken, version)
    this.value = value
    if (alias) {
      this.value.referencedToken = alias
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Static building

  static create(version: DesignSystemVersion, brand: Brand, name: string, description: string, value: string, alias: RadiusToken | null): RadiusToken {

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

    if (value) {
      // Raw value
      let tokenValue = this.radiusValueFromDefinition(value)
      return new RadiusToken(version, baseToken, tokenValue, undefined)
    } else if (alias) {
      // Aliased value - copy and create raw from reference
      let tokenValue: RadiusTokenValue = {
        radius: {
          unit: alias.value.radius.unit,
          measure: alias.value.radius.measure,
          referencedToken: undefined
        },
        topLeft: alias.value.topLeft ? {
          unit: alias.value.topLeft.unit,
          measure: alias.value.topLeft.measure,
          referencedToken: undefined
        } : null,
        topRight: alias.value.topRight ? {
          unit: alias.value.topRight.unit,
          measure: alias.value.topRight.measure,
          referencedToken: undefined
        } : null,
        bottomLeft: alias.value.bottomLeft ? {
          unit: alias.value.bottomLeft.unit,
          measure: alias.value.bottomLeft.measure,
          referencedToken: undefined
        } : null,
        bottomRight: alias.value.bottomRight ? {
          unit: alias.value.bottomRight.unit,
          measure: alias.value.bottomRight.measure,
          referencedToken: undefined
        } : null,
        referencedToken: alias
      } 
      return new RadiusToken(version, baseToken, tokenValue, undefined)
    }
  }

  static radiusValueFromDefinition(definition: string): RadiusTokenValue {

    let corners = definition.split(",")
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
        radius: MeasureToken.measureValueFromDefinition("0"),
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

    specificData.data = {
      aliasTo: this.value.referencedToken ? this.value.referencedToken.id : undefined,
      value: !this.value.referencedToken ? this.toWriteValueObject() : undefined,
    }

    return specificData
  }

  toWriteValueObject(): RadiusTokenRemoteValue {
    return {
      radius: {
        aliasTo: undefined,
        value: {
          measure: this.value.radius.measure,
          unit: this.value.radius.unit
        }
      },
      topLeft: this.value.topLeft ? {
        aliasTo: undefined,
        value: {
          measure: this.value.topLeft.measure,
          unit: this.value.topLeft.unit
        }
      } : null,
      topRight: this.value.topRight ? {
        aliasTo: undefined,
        value: {
          measure: this.value.topRight.measure,
          unit: this.value.topRight.unit
        }
      } : null,
      bottomLeft: this.value.bottomLeft ? {
        aliasTo: undefined,
        value: {
          measure: this.value.bottomLeft.measure,
          unit: this.value.bottomLeft.unit
        }
      } : null,
      bottomRight: this.value.bottomRight ? {
        aliasTo: undefined,
        value: {
          measure: this.value.bottomRight.measure,
          unit: this.value.bottomRight.unit
        }
      } : null,
    }
  }
}
