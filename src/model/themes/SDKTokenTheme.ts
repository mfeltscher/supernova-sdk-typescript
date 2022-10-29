//
//  SDKTokenTheme.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

import { BlurToken, BorderToken, ColorToken, DesignSystemVersion, FontToken, GenericToken, GradientToken, MeasureToken, RadiusToken, ShadowToken, TextToken, Token, TokenType, TypographyToken } from '../..'
import { AnyToken, AnyTokenValue, BlurTokenValue, BorderTokenValue, ColorTokenValue, FontTokenValue, GenericTokenValue, GradientTokenValue, MeasureTokenValue, RadiusTokenValue, ShadowTokenValue, TextTokenValue, TypographyTokenValue } from '../tokens/SDKTokenValue'
import { TokenThemeOverrideRemoteModel } from './SDKTokenThemeOverride'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface TokenThemeRemoteModel {
  meta: {
    name: string
    description: string
  }
  id: string
  persistentId: string
  designSystemVersionId: string
  brandId: string
  codeName: string
  createdAt?: string
  updatedAt?: string
  overrides: Array<TokenThemeOverrideRemoteModel>
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class TokenTheme {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  id: string
  versionedId: string
  brandId: string
  designSystemVersionId: string
  name: string
  description: string
  codeName: string
  createdAt: Date | null
  updatedAt: Date | null

  overriddenTokens: Array<Token>

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(
    model: TokenThemeRemoteModel,
    dsVersion: DesignSystemVersion
  ) {
    this.id = model.persistentId
    this.versionedId = model.id
    this.brandId = model.brandId
    this.designSystemVersionId = dsVersion.id
    this.name = model.meta.name
    this.description = model.meta.description
    this.codeName = model.codeName

    this.createdAt = model.createdAt ? new Date(model.createdAt) : null
    this.updatedAt = model.updatedAt ? new Date(model.updatedAt) : null

    // Note overrides are provided from the resolver when they are computed
    this.overriddenTokens = []
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Convenience

  addOverride(override: Token) {
    this.overriddenTokens.push(override)
  }

  addOverrides(overrides: Array<Token>) {
    this.overriddenTokens = this.overriddenTokens.concat(overrides)
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Manipulation

  toWriteObject(): TokenThemeRemoteModel {
    return {
      id: this.versionedId,
      brandId: this.brandId,
      designSystemVersionId: this.designSystemVersionId,
      persistentId: this.id,
      meta: {
        name: this.name,
        description: this.description ?? ''
      },
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
      codeName: this.codeName,
      overrides: this.tokensToOverrides()
    }
  }

  private tokensToOverrides(): Array<TokenThemeOverrideRemoteModel> {
    // return this.overriddenTokens.map(o => this.toWriteOverrideObject(o))
    let counter = 0
    let result = new Array<TokenThemeOverrideRemoteModel>()
    for (let override of this.overriddenTokens) {
      if (override.tokenType === TokenType.color) {
        result.push(this.toWriteOverrideObject(override))
      }
      counter++
    }
    return result
  }


  toWriteOverrideObject(token: Token): TokenThemeOverrideRemoteModel {
    let model = {
      data: this.valueToWriteObject(((token as unknown) as AnyToken).value, token.tokenType),
      tokenPersistentId: token.id,
      type: token.tokenType,
      origin: token.origin
        ? {
            id: token.origin.id ?? undefined,
            name: token.origin.name ?? undefined,
            sourceId: token.origin.sourceId ?? undefined
          }
        : undefined,
      createdAt: token.createdAt ? token.createdAt.toISOString() : undefined,
      updatedAt: token.updatedAt ? token.updatedAt.toISOString() : undefined,
    }

    if (!model.data.aliasTo && !model.data.value) {
      throw new Error("Token doesn't have value or alias to")
    }
    console.log(model)
    return model
  }


  valueToWriteObject(value: AnyTokenValue, type: TokenType) {

    switch (type) {
      case TokenType.blur: return BlurToken.valueToWriteObject(value as BlurTokenValue)
      case TokenType.border: return BorderToken.valueToWriteObject(value as BorderTokenValue)
      case TokenType.color: return ColorToken.valueToWriteObject(value as ColorTokenValue)
      case TokenType.font: return FontToken.valueToWriteObject(value as FontTokenValue)
      case TokenType.generic: return GenericToken.valueToWriteObject(value as GenericTokenValue)
      case TokenType.gradient: return GradientToken.valueToWriteObject(value as GradientTokenValue)
      case TokenType.measure: return MeasureToken.valueToWriteObject(value as MeasureTokenValue)
      case TokenType.radius: return RadiusToken.valueToWriteObject(value as RadiusTokenValue)
      case TokenType.shadow: return ShadowToken.valueToWriteObject(value as ShadowTokenValue)
      case TokenType.text: return TextToken.valueToWriteObject(value as TextTokenValue)
      case TokenType.typography: return TypographyToken.valueToWriteObject(value as TypographyTokenValue)
    }
  }
}
