//
//  SDKRemoteTokenData.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//
//  This file defines all token model containers for different types of tokens
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { TokenType } from '../../enums/SDKTokenType'
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
} from './SDKRemoteTokenData'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Remote Valu Definitions

export interface TokenRemoteModel {
  id: string
  brandId: string
  designSystemVersionId: string
  persistentId: string
  type: TokenType
  meta: {
    name: string
    description: string
  }
  originStyle?: {
    id?: string
    name?: string
    sourceId?: string
  }
  data: {
    aliasTo?: string
  }
  customPropertyOverrides: Array<{
    propertyId: string
    value: any
  }>
}

export type ColorTokenRemoteModel = TokenRemoteModel & {
  data: ColorTokenRemoteData
}

export type TextTokenRemoteModel = TokenRemoteModel & {
  data: TextTokenRemoteData
}

export type GenericTokenRemoteModel = TokenRemoteModel & {
  data: GenericTokenRemoteData
}

export type TypographyTokenRemoteModel = TokenRemoteModel & {
  data: TypographyTokenRemoteData
}

export type RadiusTokenRemoteModel = TokenRemoteModel & {
  data: RadiusTokenRemoteData
}

export type ShadowTokenRemoteModel = TokenRemoteModel & {
  data: ShadowTokenRemoteData
}

export type MeasureTokenRemoteModel = TokenRemoteModel & {
  data: MeasureTokenRemoteData
}

export type FontTokenRemoteModel = TokenRemoteModel & {
  data: FontTokenRemoteData
}

export type BorderTokenRemoteModel = TokenRemoteModel & {
  data: BorderTokenRemoteData
}

export type GradientTokenRemoteModel = TokenRemoteModel & {
  data: GradientTokenRemoteData
}

export type BlurTokenRemoteModel = TokenRemoteModel & {
  data: BlurTokenRemoteData
}
