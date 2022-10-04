//
//  Components.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { ElementPropertyType } from '../../exports'
import { AssetFormat } from '../../model/enums/SDKAssetFormat'
import { AssetScale } from '../../model/enums/SDKAssetScale'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_components_present', async t => {

    // Fetch components
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]
    let components = await brand.components()

    t.true(components.length > 0)
})


test('test_components_have_property', async t => {

    // Fetch components
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]
    let component = (await brand.components())[0]

    // Test properties
    let property = component.properties[0]
    t.true(property !== null && property !== undefined)
})


test('test_components_values', async t => {

    // Fetch components
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let brand = (await version.brands())[0]
    let component = (await brand.components())[0]

    // Test properties
    t.true(Object.keys(component.propertyValues).length > 0)
})

