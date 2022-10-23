//
//  DesignSystemVersion.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { ShadowToken, TokenType } from '../..'
import { AnyToken } from '../../model/tokens/SDKTokenValue'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_designSystemVersion_brands', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch brands
    let brands = await version.brands()
    t.true(brands.length > 0)
})

test('test_designSystemVersion_tokens', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let tokens = await version.tokens()
    t.true(tokens.length > 0)
})

test('test_designSystemVersion_tokens_resolution', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    
    // Validate that all tokens have values and nothing was left unresolved
    let tokens = await version.tokens()
    for (let token of tokens) {
        t.true((token as AnyToken).value !== null && ((token as AnyToken).value !== undefined))
    }
})


test('test_designSystemVersion_tokenGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let groups = await version.tokenGroups()
    t.true(groups.length > 0)
})


test('test_designSystemVersion_tokenGroupTrees', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let trees = await version.tokenGroupTrees()
    t.true(trees.size > 0)
})


test('test_designSystemVersion_components', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let components = await version.components()
    t.true(components.length > 0)
})


test('test_designSystemVersion_designComponents', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let designComponents = await version.designComponents()
    t.true(designComponents.length > 0)
})


test('test_designSystemVersion_designComponentGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let groups = await version.designComponentGroups()
    t.true(groups.length > 0)
})


test('test_designSystemVersion_designComponentGroupTree', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let tree = await version.designComponentGroupTree()
    t.true(tree !== undefined && tree !== null)
})


test('test_designSystemVersion_assets', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let assets = await version.assets()
    t.true(assets.length > 0)
})


test('test_designSystemVersion_assetGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let groups = await version.assetGroups()
    t.true(groups.length > 0)
})


test('test_designSystemVersion_assetGroupTrees', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let tree = await version.assetGroupTrees()
    t.true(tree.length > 0)
})


test('test_designSystemVersion_documentation', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch its active version
    let documentation = await version.documentation()
    t.true(documentation !== undefined && documentation !== null)
})