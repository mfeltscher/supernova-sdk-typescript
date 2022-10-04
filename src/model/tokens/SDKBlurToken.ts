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
import { TokenRemoteModel } from './remote/SDKRemoteTokenModel'
import { Token } from './SDKToken'
import { BlurTokenValue } from './SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class BlurToken extends Token {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: BlurTokenValue

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
    if (alias) {
      this.value.referencedToken = alias
    }
  }
}
