//
//  SDKUser.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2023 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export interface UserModel {
  id: string
  email: string
  createdAt: string
  profile: {
    name: string,
    nickname: string
  },
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- -- - --- --- --- --- --- --- --- --- --- ---
// MARK: -  Object Definition

export class User {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Public properties

  /** Unique user identifier */
  id: string

  /** Unique user email */
  email: string

  /** When was the user created */
  createdAt: Date | null

  /** User name */
  name: string

  /** User nickname */
  nickname: string | null

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor(model: UserModel) {
    this.id = model.id
    this.email = model.email
    this.name = model.profile.name ?? ""
    this.nickname = model.profile.nickname ?? null
    this.createdAt = model.createdAt ? new Date(model.createdAt) : null
  }
}
