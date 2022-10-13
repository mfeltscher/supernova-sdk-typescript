//
//  SDKBorderToken.ts
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
import { BorderTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { BorderTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { BorderTokenValue } from './SDKTokenValue'

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
