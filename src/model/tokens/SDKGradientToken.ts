//
//  SDKGradientToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { ElementProperty } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { GradientTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { GradientTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { GradientTokenValue } from './SDKTokenValue'

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
                value: s.color.referencedToken ? null : s.color.hex
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
