//
//  Documentation.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import test from 'ava'
import { DocumentationConfiguration } from '../../model/documentation/SDKDocumentationConfiguration'
import { DocumentationGroup } from '../../model/documentation/SDKDocumentationGroup'
import { testInstance } from '../helpers'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_documentation_settings', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let documentation = await version.documentation()

    // Check documentation settings exists
    t.true(documentation.settings instanceof DocumentationConfiguration)
})


test('test_documentation_items', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let documentation = await version.documentation()

    // Check items exist
    let items = await documentation.items()
    t.true(items.length > 0)
})


test('test_documentation_rootGroup', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let documentation = await version.documentation()

    // Check some groups exist
    let rootGroup = await documentation.rootGroup()
    t.true(rootGroup instanceof DocumentationGroup)
})


test('test_documentation_groups', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let documentation = await version.documentation()

    // Check some groups exist
    let groups = await documentation.groups()
    t.true(groups.length > 0)
})

test('test_documentation_pages', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let documentation = await version.documentation()

    // Check some pages exist
    let pages = await documentation.pages()
    t.true(pages.length > 0)
})

test('test_documentation_custom_blocks', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let documentation = await version.documentation()

    // Check some defined blocks exist
    let blocks = await documentation.customBlocks()
    t.true(blocks.length > 0)
})

test('test_documentation_configuration_properties', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let documentation = await version.documentation()

    // Check some defined blocks exist
    let properties = await documentation.customConfiguration()
    t.true(properties.length > 0)
})


test('test_documentation_configuration_variants', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)
    let documentation = await version.documentation()

    // Check some defined blocks exist
    let variants = await documentation.customBlockVariants()
    t.true(variants.length > 0)
})

