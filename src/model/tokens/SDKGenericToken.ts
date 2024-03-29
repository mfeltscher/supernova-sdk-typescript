//
//  SDKGenericToken.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { v4 as uuidv4 } from 'uuid'
import { Brand, ElementProperty, TokenType } from '../..'
import { DesignSystemVersion } from '../../core/SDKDesignSystemVersion'
import { DTTokenReferenceResolver } from '../../tools/design-tokens/utilities/SDKDTTokenReferenceResolver'
import { ElementPropertyValue } from '../elements/values/SDKElementPropertyValue'
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
    alias: GenericToken | null,
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
    alias: GenericToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ): GenericToken {
    let baseToken: TokenRemoteModel = {
      id: undefined, // Ommited id will create new token
      persistentId: uuidv4(),
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

    if (value !== undefined && value !== null) {
      // Raw value
      let tokenValue = this.genericValueFromDefinition(value)
      return new GenericToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    } else if (alias) {
      // Aliased value - copy and create raw from reference
      let tokenValue: GenericTokenValue = {
        text: alias.value.text,
        referencedToken: alias
      }
      return new GenericToken(version, baseToken, tokenValue, undefined, properties, propertyValues)
    }
  }

  static genericValueFromDefinition(definition: string): GenericTokenValue {
    return {
      text: definition ? `${definition}` : '',
      referencedToken: null
    }
  }

  static genericValueFromDefinitionOrReference(
    definition: any,
    referenceResolver: DTTokenReferenceResolver
  ): GenericTokenValue {
    if (referenceResolver.valueHasReference(definition)) {
      if (!referenceResolver.isBalancedReference(definition)) {
        // Internal syntax of reference corrupted
        throw new Error(`Invalid reference syntax in token value: ${definition}`)
      }
      if (referenceResolver.valueIsPureReference(definition)) {
        // When color is pure reference, we can immediately resolve it
        let reference = referenceResolver.lookupReferencedToken(definition) as GenericToken
        if (!reference) {
          return undefined
        }
        return {
          referencedToken: reference,
          text: reference.value.text
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
          return this.genericValueFromDefinition(resolvedValue)
        }
      }
    } else {
      return this.genericValueFromDefinition(definition)
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Writing

  toWriteObject(): GenericTokenRemoteModel {
    let baseData = this.toBaseWriteObject()
    let specificData = baseData as GenericTokenRemoteModel
    specificData.data = GenericToken.valueToWriteObject(this.value)
    return specificData
  }

  static valueToWriteObject(value: GenericTokenValue): { aliasTo: string | undefined; value: TextTokenRemoteValue } {
    let valueObject = !value.referencedToken ? value.text : undefined

    return {
      aliasTo: value.referencedToken ? value.referencedToken.id : undefined,
      value: valueObject
    }
  }
}
