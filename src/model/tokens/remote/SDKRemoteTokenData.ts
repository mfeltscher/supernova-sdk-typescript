//
//  SDKRemoteTokenData.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//
//  This file defines all token data containers for different types of tokens
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import {
  BlurTokenRemoteValue,
  BorderTokenRemoteValue,
  ColorTokenRemoteValue,
  FontTokenRemoteValue,
  GradientTokenRemoteValue,
  MeasureTokenRemoteValue,
  RadiusTokenRemoteValue,
  ShadowTokenRemoteValue,
  TextTokenRemoteValue,
  TypographyTokenRemoteValue
} from './SDKRemoteTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Remote Valu Definitions

export type ColorTokenRemoteData = {
  aliasTo?: string
  value?: ColorTokenRemoteValue
}

export type TextTokenRemoteData = {
  aliasTo?: string
  value?: TextTokenRemoteValue
}

export type GenericTokenRemoteData = {
  aliasTo?: string
  value?: TextTokenRemoteValue
}

export type TypographyTokenRemoteData = {
  aliasTo?: string
  value?: TypographyTokenRemoteValue
}

export type RadiusTokenRemoteData = {
  aliasTo?: string
  value?: RadiusTokenRemoteValue
}

export type ShadowTokenRemoteData = {
  aliasTo?: string
  value?: ShadowTokenRemoteValue
}

export type MeasureTokenRemoteData = {
  aliasTo?: string
  value?: MeasureTokenRemoteValue
}

export type FontTokenRemoteData = {
  aliasTo?: string
  value?: FontTokenRemoteValue
}

export type BorderTokenRemoteData = {
  aliasTo?: string
  value?: BorderTokenRemoteValue
}

export type GradientTokenRemoteData = {
  aliasTo?: string
  value?: GradientTokenRemoteValue
}

export type BlurTokenRemoteData = {
  aliasTo?: string
  value?: BlurTokenRemoteValue
}
