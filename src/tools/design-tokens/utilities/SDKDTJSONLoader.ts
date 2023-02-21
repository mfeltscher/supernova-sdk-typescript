//
//  SDKDTJSONLoader.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type DTParsedNode = {
  rootKey: string
  name: string
  path: Array<string>
  type: string
  value: any
  description: string | null
}

export type DTParsedTokenSet = {
  name: string
  id: string
  contains: Array<DTParsedNode>
}

export type DTParsedTheme = {
  name: string
  id: string
  selectedTokenSets: Array<DTParsedThemeSetPriorityPair>
}

export type DTParsedThemeSetPriorityPair = {
  set: DTParsedTokenSet
  priority: DTParsedThemeSetPriority
}

export enum DTParsedThemeSetPriority {
  source = 'source',
  enabled = 'enabled',
  disabled = 'disabled'
}
