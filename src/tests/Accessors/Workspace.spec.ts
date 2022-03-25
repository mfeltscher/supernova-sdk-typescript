//
//  Workspace.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { TEST_DB_WORKSPACE_ID } from '../configuration'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_Workspace_designSystems', async t => {

    // Fetch specific workspace
    let workspace = await testInstance.workspace(TEST_DB_WORKSPACE_ID)

    // Fetch all design systems
    let designSystems = await workspace.designSystems()
    t.true(designSystems.length > 0)
})


test('test_Workspace_exporters', async t => {

    // Fetch specific workspace
    let workspace = await testInstance.workspace(TEST_DB_WORKSPACE_ID)

    // Fetch all design systems
    let exporters = await workspace.exporters()
    t.true(exporters.length > 0)
})