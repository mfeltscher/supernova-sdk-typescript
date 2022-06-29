//
//  SDKMeasureToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { v4 as uuidv4 } from 'uuid';
import { Brand, TokenType } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
import { Unit } from '../enums/SDKUnit'
import { MeasureTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { MeasureTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { MeasureTokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class MeasureToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: MeasureTokenValue

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: MeasureTokenValue,
    alias: MeasureToken | null
  ) {
    super(baseToken, version)
    this.value = value
    if (alias) {
      this.value.referencedToken = alias
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Static building

  static create(version: DesignSystemVersion, brand: Brand, name: string, description: string, value: string, alias: MeasureToken | null): MeasureToken {

    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuidv4(),
      brandId: brand.persistentId,
      designSystemVersionId: version.id,
      type: TokenType.measure,
      meta: {
        name: name,
        description: description
      },
      data: {},
      customPropertyOverrides: []
    }

    if (value) {
      // Raw value
      let tokenValue = this.measureValueFromDefinition(value)
      return new MeasureToken(version, baseToken, tokenValue, undefined)
    } else if (alias) {
      // Aliased value - copy and create raw from reference
      let tokenValue: MeasureTokenValue = {
        unit: Unit.pixels,
        measure: 0,
        referencedToken: alias
      } 
      return new MeasureToken(version, baseToken, tokenValue, undefined)
    }
  }

  static measureValueFromDefinition(definition: string): MeasureTokenValue {

    let result = this.parseMeasure(definition)
    return {
      measure: result.measure,
      unit: result.unit,
      referencedToken: null
    }
  }

  static parseMeasure(definition: string): {
    measure: number,
    unit: Unit
  } {

    // Parse out unit
    let measure = definition.replace(" ", "")
    let unit = Unit.pixels
    if (definition.endsWith("px")) {
      measure = measure.substring(0, measure.length - 2)
      unit = Unit.pixels
    } else if (definition.endsWith("%")) {
      measure = measure.substring(0, measure.length - 1)
      unit = Unit.percent
    } else if (definition.endsWith("em")) {
      measure = measure.substring(0, measure.length - 2)
      unit = Unit.ems
    } else if (definition.endsWith("pt")) {
      measure = measure.substring(0, measure.length - 2)
      unit = Unit.points
    }

    // For now, everything is pixels. Remove pixels when SN supports more units
    unit = Unit.pixels

    // Parse
    let parsedMeasure = parseFloat(measure)

    return {
      measure: parsedMeasure,
      unit: unit
    }
  }

  static measureValueFromDefinitionOrReference(definition: any, referenceResolver: DTTokenReferenceResolver): MeasureTokenValue {

    if (referenceResolver.valueIsReference(definition)) {
      let reference = (referenceResolver.lookupReferencedToken(definition) as MeasureToken)
      return {
        referencedToken: reference,
        measure: reference.value.measure,
        unit: reference.value.unit
      }
    } else {
      let measure = MeasureToken.parseMeasure(definition)
      return {
        referencedToken: null,
        measure: measure.measure,
        unit: measure.unit
      }
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): MeasureTokenRemoteModel {

    let baseData = this.toBaseWriteObject()
    let specificData = baseData as MeasureTokenRemoteModel

    specificData.data = {
      aliasTo: this.value.referencedToken ? this.value.referencedToken.id : undefined,
      value: !this.value.referencedToken ? this.toWriteValueObject() : undefined,
    }

    return specificData
  }

  toWriteValueObject(): MeasureTokenRemoteValue {
    return {
      measure: this.value.measure,
      unit: this.value.unit
    }
  }
}
