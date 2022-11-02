//
//  SDKTokenThemeOverride.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

import { TokenType, TokenOrigin, BlurToken, ColorToken, TypographyToken, TextToken, ShadowToken, RadiusToken, MeasureToken, GradientToken, GenericToken, FontToken, BorderToken } from '../..'
import {
  BlurTokenRemoteData,
  BorderTokenRemoteData,
  ColorTokenRemoteData,
  FontTokenRemoteData,
  GenericTokenRemoteData,
  GradientTokenRemoteData,
  MeasureTokenRemoteData,
  RadiusTokenRemoteData,
  ShadowTokenRemoteData,
  TextTokenRemoteData,
  TypographyTokenRemoteData
} from '../tokens/remote/SDKRemoteTokenData'
import { AnyTokenValue, BlurTokenValue, BorderTokenValue, ColorTokenValue, FontTokenValue, GenericTokenValue, GradientTokenValue, MeasureTokenValue, RadiusTokenValue, ShadowTokenValue, TextTokenValue, TypographyTokenValue } from '../tokens/SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface TokenThemeOverrideRemoteModel {
  data:
    | ColorTokenRemoteData
    | TextTokenRemoteData
    | GenericTokenRemoteData
    | TypographyTokenRemoteData
    | RadiusTokenRemoteData
    | ShadowTokenRemoteData
    | MeasureTokenRemoteData
    | FontTokenRemoteData
    | BorderTokenRemoteData
    | GradientTokenRemoteData
    | BlurTokenRemoteData
  tokenPersistentId: string
  type: TokenType
  origin: TokenOrigin | null
  createdAt?: string
  updatedAt?: string
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class TokenThemeOverride {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  value: AnyTokenValue
  tokenId: string
  type: TokenType
  origin: TokenOrigin | null
  createdAt: Date | null
  updatedAt: Date | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: TokenThemeOverrideRemoteModel, value: AnyTokenValue) {

    this.value = value
    this.tokenId = model.tokenPersistentId
    this.type = model.type
    this.origin = model.origin ? new TokenOrigin(model.origin) : null

    this.createdAt = model.createdAt ? new Date(model.createdAt) : null
    this.updatedAt = model.updatedAt ? new Date(model.updatedAt) : null
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Manipulation

  toWriteObject(): TokenThemeOverrideRemoteModel {
    return {
      data: this.valueToWriteObject(this.value, this.type),
      tokenPersistentId: this.tokenId,
      type: this.type,
      origin: this.origin
        ? {
            id: this.origin.id ?? undefined,
            name: this.origin.name ?? undefined,
            sourceId: this.origin.sourceId ?? undefined
          }
        : undefined,
      createdAt: this.createdAt ? this.createdAt.toISOString() : undefined,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : undefined,
    }
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
