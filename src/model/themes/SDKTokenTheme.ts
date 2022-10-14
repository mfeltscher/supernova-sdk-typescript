//
//  SDKTokenTheme.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

import { DesignSystemVersion, Token } from '../..'
import { TokenThemeOverride, TokenThemeOverrideRemoteModel } from './SDKTokenThemeOverride'

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

    // TODO: Writer
    return []
  }
}
