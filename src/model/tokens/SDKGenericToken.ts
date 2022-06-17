//
//  SDKGenericToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { uuid } from 'uuidv4'
import { Brand, TokenType } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { GenericTokenRemoteModel, TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { TextTokenRemoteValue } from './remote/SDKRemoteTokenValue'
import { Token } from './SDKToken'
import { GenericTokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class GenericToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: GenericTokenValue

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: GenericTokenValue,
    alias: GenericToken | null
  ) {
    super(baseToken, version)
    this.value = value
    if (alias) {
      this.value.referencedToken = alias
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Static building

  static create(version: DesignSystemVersion, brand: Brand, name: string, description: string, value: string, alias: GenericToken | null): GenericToken {

    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuid(),
      brandId: brand.persistentId,
      designSystemVersionId: version.id,
      type: TokenType.generic,
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
      return new GenericToken(version, baseToken, tokenValue, undefined)
    } else if (alias) {
      // Aliased value - copy and create raw from reference
      let tokenValue: GenericTokenValue = {
        text: alias.value.text,
        referencedToken: alias
      } 
      return new GenericToken(version, baseToken, tokenValue, undefined)
    }
  }

  static measureValueFromDefinition(definition: string): GenericTokenValue {

    return {
      text: definition ? definition : "",
      referencedToken: null
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): GenericTokenRemoteModel {

    let baseData = this.toBaseWriteObject()
    let specificData = baseData as GenericTokenRemoteModel

    specificData.data = {
      aliasTo: this.value.referencedToken ? this.value.referencedToken.id : undefined,
      value: !this.value.referencedToken ? this.toWriteValueObject() : undefined,
    }

    return specificData
  }

  toWriteValueObject(): TextTokenRemoteValue {
    return this.value.text
  }
}
