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
import { AssetFormat } from '../../model/enums/SDKAssetFormat'
import { AssetScale } from '../../model/enums/SDKAssetScale'
import { TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID } from '../configuration'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_brand_tokens', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let tokens = await brand.tokens()
    t.true(tokens.length > 0)
})


test('test_brand_tokenGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let groups = await brand.tokenGroups()
    t.true(groups.length > 0)
})


test('test_brand_tokenGroupTrees', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let trees = await brand.tokenGroupTrees()
    t.true(trees.size > 0)
})


test('test_brand_components', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let components = await brand.components()
    t.true(components.length > 0)
})


test('test_brand_componentGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let groups = await brand.componentGroups()
    t.true(groups.length > 0)
})


test('test_brand_componentGroupTree', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let tree = await brand.componentGroupTree()
    t.true(tree !== undefined && tree !== null)
})


test('test_brand_assets', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let assets = await brand.assets()
    t.true(assets.length > 0)
})


test('test_brand_assetGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let groups = await brand.assetGroups()
    t.true(groups.length > 0)
})


test('test_brand_assetGroupTree', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let tree = await brand.assetGroupTree()
    t.true(tree !== undefined && tree !== null)
})



test('test_brand_renderAssets', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(TEST_DB_DESIGN_SYSTEM_ID, TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Render assets in a brand
    let assets = await brand.renderedAssets(AssetFormat.png, AssetScale.x2)
    t.true(assets.length > 0)
})




