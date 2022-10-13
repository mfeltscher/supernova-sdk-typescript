//
//  SDKBlurToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { ElementProperty } from '../elements/SDKElementProperty'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
import { BlurTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { BlurTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { BlurTokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class BlurToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: BlurTokenValue
  blurLayers: Array<BlurToken>
  isVirtual: boolean

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: BlurTokenValue,
    alias: BlurToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ) {
    super(baseToken, version, properties, propertyValues)
    this.value = value
    this.blurLayers = new Array<BlurToken>()
    this.isVirtual = false

    if (alias) {
      this.value.referencedToken = alias
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): BlurTokenRemoteModel {
    let baseData = this.toBaseWriteObject()
    let specificData = baseData as BlurTokenRemoteModel
    specificData.data = BlurToken.valueToWriteObject(this.value)
    return specificData
  }

  static valueToWriteObject(value: BlurTokenValue): { aliasTo: string | undefined; value: BlurTokenRemoteValue } {
    let valueObject = !value.referencedToken ? {
      radius: {
        aliasTo: undefined,
        value: {
          measure: value.radius.measure,
          unit: value.radius.unit
        }
      },
      type: value.type
    } : undefined

    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
