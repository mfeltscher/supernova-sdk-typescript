//
//  Supernova.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_Supernova_me', async t => {

    // Test fetch all workspaces
    let me = await testInstance.me()
    t.true(me !== undefined && me !== null)
    t.true(me.email.length > 0)
    t.true(me.id.length > 0)
    t.true(me.name.length > 0)
})


test('test_Supernova_workspaces', async t => {

    // Test fetch all workspaces
    let workspaces = await testInstance.workspaces()
    t.true(workspaces.length >= 1)
})


test('test_Supernova_workspace', async t => {

    // Test fetch specific workspace that exists
    let workspace = await testInstance.workspace(process.env.TEST_DB_WORKSPACE_ID)
    t.true(workspace !== null)
})


test('test_Supernova_workspace_notFound', async t => {

    // Test fetch specific workspace that doesn't exist
    await t.throwsAsync(testInstance.workspace(process.env.TEST_DB_UNKNOWN_ID))
})


test('test_Supernova_designSystems', async t => {

    // Test fetch all design systems from a specific workspace
    let designSystems = await testInstance.designSystems(process.env.TEST_DB_WORKSPACE_ID)
    t.true(designSystems.length >= 1)
})


test('test_Supernova_designSystem', async t => {

    // Test fetch specific workspace that exists
    let designSystem = await testInstance.designSystem(process.env.TEST_DB_DESIGN_SYSTEM_ID)
    t.true(designSystem !== null)
})


test('test_Supernova_designSystem_notFound', async t => {

    // Test fetch specific workspace that doesn't exist
    await t.throwsAsync(testInstance.designSystem(process.env.TEST_DB_UNKNOWN_ID))
})


test('test_Supernova_activeDesignSystemVersion', async t => {

    // Test fetch active design system version
    let version = await testInstance.activeDesignSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID)
    t.true(version !== null)
})


test('test_Supernova_designSystemVersions', async t => {

    // Test fetch all design system versions
    let versions = await testInstance.designSystemVersions(process.env.TEST_DB_DESIGN_SYSTEM_ID)
    t.true(versions.length > 0)
})


test('test_Supernova_exporters', async t => {

    // Test fetch all exporters
    let exporters = await testInstance.exporters(process.env.TEST_DB_WORKSPACE_ID)
    t.true(exporters.length >= 1)
})

