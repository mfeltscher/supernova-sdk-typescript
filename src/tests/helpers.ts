//
//  Helpers.ts
//  Supernova SDK Tests
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { Supernova } from "../core/SDKSupernova"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Convenience constructors

export const testInstance: Supernova = new Supernova(process.env.TEST_API_KEY, process.env.TEST_API_URL, null)

// Don't cache resolution results for instance
testInstance.setResolutionCacheEnabled(false)
