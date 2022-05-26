//
//  SDKToolsTokenSync.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { DesignSystemVersion } from "../core/SDKDesignSystemVersion"
import { Supernova } from "../core/SDKSupernova"
import { TokenType } from "../model/enums/SDKTokenType"
import { TokenGroup } from "../model/groups/SDKTokenGroup"
import { BorderToken } from "../model/tokens/SDKBorderToken"
import { ColorToken } from "../model/tokens/SDKColorToken"
import { FontToken } from "../model/tokens/SDKFontToken"
import { GradientToken } from "../model/tokens/SDKGradientToken"
import { MeasureToken } from "../model/tokens/SDKMeasureToken"
import { RadiusToken } from "../model/tokens/SDKRadiusToken"
import { ShadowToken } from "../model/tokens/SDKShadowToken"
import { TextToken } from "../model/tokens/SDKTextToken"
import { Token } from "../model/tokens/SDKToken"
import { BorderTokenValue, ColorTokenValue, FontTokenValue, GradientTokenValue, MeasureTokenValue, RadiusTokenValue, ShadowTokenValue, TextTokenValue, TypographyTokenValue } from "../model/tokens/SDKTokenValue"
import { TypographyToken } from "../model/tokens/SDKTypographyToken"
import _ from "lodash"
import { Brand } from ".."
import { TokenWriteResponse } from "../core/SDKBrandWriter"


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Configuration

export type SupernovaToolStyleDictionaryOptions = {

  /** Conversion method to be used for token names. Original will use actual token name */
  naming: SupernovaToolStyleDictionaryKeyNaming,

  /** When enabled, brandId will be included in every token */
  includeBrandId: boolean,

  /** When enabled, comments will be included in tokens that have description */
  includeComments: boolean,
  
  /** When provided, tokens will be filtered to only show tokens belonging to this brand */
  brandId: string | null
  
  /** When enabled, type will be included in every token */
  includeType: boolean,
  
  /** When enabled, root category node will be generated. If type === null, multiple root nodes will be generated, one for each type */
  includeRootTypeNodes: boolean,
  
  /** When provided, only tokens of one category will be generated. Providing null will generate all tokens regardless of type */
  type: TokenType | null
}

export enum SupernovaToolStyleDictionaryKeyNaming {
  original = "original",
  camelcase = "camelcase",
  snakecase = "snakecase",
  kebabcase = "kebabcase"
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Style dictionary tooling object */
export class SupernovaToolsTokenSync {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  private instance: Supernova
  private version: DesignSystemVersion
  private brand: Brand


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(instance: Supernova, version: DesignSystemVersion, brand: Brand) {
    this.instance = instance
    this.version = version
    this.brand = brand
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public interface

  /** Synchronize token pack */
  async synchronizeTokenPack(tokens: Array<Token>, tokenGroups: Array<TokenGroup>): Promise<TokenWriteResponse> {

    let writer = this.brand.writer()
    let result = await writer.writeTokens(tokens, tokenGroups)
    return result
  }
}
