//
//  SDKGradientToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import {
  Brand,
  ColorToken,
  ElementProperty,
  GradientTokenValue,
  GradientStopValue,
  GradientType,
  TokenType
} from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { GradientTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { Token } from './SDKToken'
import { v4 as uuidv4 } from 'uuid'
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
import { Matrix, inverse } from 'ml-matrix'
import { GradientTokenRemoteValue } from './remote/SDKRemoteTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class GradientToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: GradientTokenValue
  gradientLayers: Array<GradientToken>
  isVirtual: boolean

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: GradientTokenValue,
    alias: GradientToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ) {
    super(baseToken, version, properties, propertyValues)
    this.value = value
    this.gradientLayers = new Array<GradientToken>()
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
    value: string,
    alias: GradientToken | null,
    referenceResolver: DTTokenReferenceResolver,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ): GradientToken {
    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuidv4(),
      brandId: brand.persistentId,
      designSystemVersionId: version.id,
      type: TokenType.gradient,
      meta: {
        name: name,
        description: description
      },
      data: {},
      customPropertyOverrides: []
    }

    if (value) {
      // Raw value
      let tokenValue = this.gradientValueFromDefinition(value, referenceResolver)
      return new GradientToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    } else if (alias) {
      // Aliased value - copy and create raw from reference
      let tokenValue: GradientTokenValue = {
        to: {
          x: alias.value.to.x,
          y: alias.value.to.y
        },
        from: {
          x: alias.value.from.x,
          y: alias.value.from.y
        },
        type: alias.value.type,
        aspectRatio: alias.value.aspectRatio,
        stops: alias.value.stops,
        referencedToken: alias
      }
      return new GradientToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    }
  }

  static gradientValueFromDefinition(
    definition: string,
    referenceResolver: DTTokenReferenceResolver
  ): GradientTokenValue {
    // Parse raw gradient pieces
    const [gradientDegrees, ...colorStops] = definition
      .substring(definition.indexOf('(') + 1, definition.lastIndexOf(')'))
      .split(', ')

    // Rotate 90 degrees
    const degreesAsNumber = parseFloat(gradientDegrees.split('deg').join(''))
    const degrees = -(degreesAsNumber - 90)
    const rad = degrees * (Math.PI / 180)
    const scale = degreesAsNumber % 90 === 0 ? 1 : Math.sqrt(1 + Math.tan(degreesAsNumber * (Math.PI / 180)) ** 2)

    // Build transformation matrix so we can figure out the proper sizing of the gradient in 2d space
    const matrix = inverse(
      new Matrix([
        [1, 0, 0.5],
        [0, 1, 0.5],
        [0, 0, 1]
      ])
        .mmul(
          new Matrix([
            [Math.cos(rad), Math.sin(rad), 0],
            [-Math.sin(rad), Math.cos(rad), 0],
            [0, 0, 1]
          ])
        )
        .mmul(
          new Matrix([
            [scale, 0, 0],
            [0, scale, 0],
            [0, 0, 1]
          ])
        )
        .mmul(
          new Matrix([
            [1, 0, -0.5],
            [0, 1, -0.5],
            [0, 0, 1]
          ])
        )
    ).to2DArray()

    // Build gradient stops
    const gradientStops: Array<GradientStopValue> = colorStops.map((s, index) => {
      const separatedStop = s.split(' ')
      const colorValue = ColorToken.colorValueFromDefinitionOrReference(separatedStop[0], referenceResolver)
      return {
        color: colorValue,
        position: parseFloat(separatedStop[1]) / 100
      }
    })

    // Construct gradient value by using
    return {
      from: {
        x: matrix[0][0],
        y: matrix[0][1]
      },
      to: {
        x: matrix[1][0],
        y: matrix[1][1]
      },
      type: GradientType.linear,
      aspectRatio: 1,
      stops: gradientStops,
      referencedToken: null
    }
  }

  static gradientValueFromDefinitionOrReference(
    definition: any,
    referenceResolver: DTTokenReferenceResolver
  ): GradientTokenValue | undefined {
    if (referenceResolver.valueHasReference(definition)) {
      if (!referenceResolver.isBalancedReference(definition)) {
        // Internal syntax of reference corrupted
        throw new Error(`Invalid reference syntax in token value: ${definition}`)
      }
      if (referenceResolver.valueIsPureReference(definition)) {
        // When color is pure reference, we can immediately resolve it
        let reference = referenceResolver.lookupReferencedToken(definition) as GradientToken
        if (!reference) {
          return undefined
        }
        return {
          referencedToken: reference,
          to: {
            x: reference.value.to.x,
            y: reference.value.to.y
          },
          from: {
            x: reference.value.from.x,
            y: reference.value.from.y
          },
          type: reference.value.type,
          aspectRatio: reference.value.aspectRatio,
          stops: reference.value.stops
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
          return this.gradientValueFromDefinition(resolvedValue, referenceResolver)
        }
      }
    } else {
      return this.gradientValueFromDefinition(definition, referenceResolver)
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): GradientTokenRemoteModel {
    let baseData = this.toBaseWriteObject()
    let specificData = baseData as GradientTokenRemoteModel
    specificData.data = GradientToken.valueToWriteObject(this.value)
    return specificData
  }

  static valueToWriteObject(
    value: GradientTokenValue
  ): { aliasTo: string | undefined; value: GradientTokenRemoteValue } {
    let valueObject = !value.referencedToken
      ? {
          to: {
            x: value.to.x,
            y: value.to.y
          },
          from: {
            x: value.to.x,
            y: value.to.y
          },
          type: value.type,
          aspectRatio: value.aspectRatio,
          stops: value.stops.map(s => {
            return {
              position: s.position,
              color: {
                aliasTo: s.color.referencedToken ? s.color.referencedToken.id : undefined,
                value: s.color.referencedToken ? null : ColorToken.normalizedHex(s.color.hex)
              }
            }
          })
        }
      : undefined

    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
