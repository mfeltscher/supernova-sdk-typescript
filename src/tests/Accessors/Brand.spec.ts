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
import { AnyToken } from '../../model/tokens/SDKTokenValue'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_brand_tokens', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let tokens = await brand.tokens()
    t.true(tokens.length > 0)
})

test('test_brand_tokens_resolution', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Validate that all tokens have values and nothing was left unresolved
    let tokens = await brand.tokens()
    for (let token of tokens) {
        t.true((token as AnyToken).value !== null && ((token as AnyToken).value !== undefined))
    }
})


test('test_brand_tokenGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let groups = await brand.tokenGroups()
    t.true(groups.length > 0)
})


test('test_brand_tokenGroupTrees', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let trees = await brand.tokenGroupTrees()
    t.true(trees.size > 0)
})


test('test_brand_components', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let components = await brand.components()
    t.true(components.length > 0)
})


test('test_brand_designComponents', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let designComponents = await brand.designComponents()
    t.true(designComponents.length > 0)
})


test('test_brand_designComponentGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let groups = await brand.designComponentGroups()
    t.true(groups.length > 0)
})


test('test_brand_designComponentGroupTree', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let tree = await brand.designComponentGroupTree()
    t.true(tree !== undefined && tree !== null)
})


test('test_brand_assets', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let assets = await brand.assets()
    t.true(assets.length > 0)
})


test('test_brand_assetGroups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let groups = await brand.assetGroups()
    t.true(groups.length > 0)
})


test('test_brand_assetGroupTree', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Fetch its active version
    let tree = await brand.assetGroupTree()
    t.true(tree !== undefined && tree !== null)
})



test('test_brand_renderAssets', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]

    // Render assets in a brand
    let assets = await brand.renderedAssets(AssetFormat.png, AssetScale.x2)
    t.true(assets.length > 0)
})




