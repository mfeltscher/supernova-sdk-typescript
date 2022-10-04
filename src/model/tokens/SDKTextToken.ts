//
//  SDKTextToken.ts
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
import { TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { Token } from './SDKToken'
import { TextTokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class TextToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: TextTokenValue

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    version: DesignSystemVersion,
    baseToken: TokenRemoteModel,
    value: TextTokenValue,
    alias: TextToken | null,
    properties: Array<ElementProperty>,
    propertyValues: Array<ElementPropertyValue>
  ) {
    super(baseToken, version, properties, propertyValues)
    this.value = value
    if (alias) {
      this.value.referencedToken = alias
    }
  }
}
