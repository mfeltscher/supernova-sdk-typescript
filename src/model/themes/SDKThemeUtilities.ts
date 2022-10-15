//
//  SDKThemeUtilities.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Token, DesignSystemVersion, TokenType, BorderToken, ColorToken, FontToken, GenericToken, GradientToken, MeasureToken, RadiusToken, ShadowToken, TextToken, TokenOrigin } from '../..'
import { BlurToken } from '../tokens/SDKBlurToken'
import { AnyToken } from '../tokens/SDKTokenValue'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class ThemeUtilities {
  
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Helpers

  /** Creates duplicate of the token */
  static replicateTokenAsThemePrefabWithoutValue(token: Token, themeId: string, origin: TokenOrigin | null, version: DesignSystemVersion): AnyToken {
    
    let replica: AnyToken
    switch (token.tokenType) {
      case TokenType.blur: replica = new BlurToken(version, {} as any, null, null, [], []); break;
      case TokenType.border: replica = new BorderToken(version, {} as any, null, null, [], []); break;
      case TokenType.color: replica = new ColorToken(version, {} as any, null, null, [], []); break;
      case TokenType.font: replica = new FontToken(version, {} as any, null, null, [], []); break;
      case TokenType.generic: replica = new GenericToken(version, {} as any, null, null, [], []); break;
      case TokenType.gradient: replica = new GradientToken(version, {} as any, null, null, [], []); break;
      case TokenType.measure: replica = new MeasureToken(version, {} as any, null, null, [], []); break;
      case TokenType.radius: replica = new RadiusToken(version, {} as any, null, null, [], []); break;
      case TokenType.shadow: replica = new ShadowToken(version, {} as any, null, null, [], []); break;
      case TokenType.text: replica = new TextToken(version, {} as any, null, null, [], []); break;
      default: throw new Error(`Unsupported type ${token.tokenType}`)
    }

    replica.id = token.id
    replica.versionedId = token.versionedId
    replica.brandId = token.brandId
    replica.themeId = themeId // Assign just-created theme
    replica.designSystemVersionId = token.designSystemVersionId
    replica.name = token.name
    replica.description = token.description
    replica.tokenType = token.tokenType
    replica.origin = origin ?? null // Re-direct origin to the other origin
    replica.parent = token.parent
    replica.sortOrder = token.sortOrder

    replica.properties = token.properties
    replica.propertyValues = token.propertyValues
    replica.createdAt = token.createdAt
    replica.updatedAt = token.updatedAt

    // No replication of value - value will get replaced by the override
    
    return replica
  }
}
