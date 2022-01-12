//
//  DesignSystem.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { TEST_DB_DESIGN_SYSTEM_ID } from '../configuration'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_DesignSystem_versions', async t => {

    // Fetch specific design system
    let designSystem = await testInstance.designSystem(TEST_DB_DESIGN_SYSTEM_ID)

    // Fetch its active version
    let version = await designSystem.activeVersion()
    t.true(version && version.id.length > 0)
})


test('test_DesignSystem_activeVersion', async t => {

    // Fetch specific design system
    let designSystem = await testInstance.designSystem(TEST_DB_DESIGN_SYSTEM_ID)

    // Fetch versions
    let versions = await designSystem.versions()
    t.true(versions.length > 0)
})
