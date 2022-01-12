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
import { TEST_API_KEY, TEST_API_URL } from "./configuration"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Convenience constructors

export const testInstance: Supernova = new Supernova(TEST_API_KEY, TEST_API_URL, null)
