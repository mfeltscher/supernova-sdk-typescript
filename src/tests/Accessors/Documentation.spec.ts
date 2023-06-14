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
import { DocumentationPageBlockType } from '../../exports'
import { DocumentationConfiguration } from '../../model/documentation/SDKDocumentationConfiguration'
import { DocumentationGroup } from '../../model/documentation/SDKDocumentationGroup'
import { testInstance } from '../helpers'
import { DocumentationEnvironment } from '../../model/enums/SDKDocumentationEnvironment'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_documentation_settings', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Check documentation settings exists
  t.true(documentation.settings instanceof DocumentationConfiguration)
})

test('test_documentation_items', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Check items exist
  let items = await documentation.items()
  t.true(items.length > 0)
})

test('test_documentation_rootGroup', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Check some groups exist
  let rootGroup = await documentation.rootGroup()
  t.true(rootGroup instanceof DocumentationGroup)
})

test('test_documentation_groups', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Check some groups exist
  let groups = await documentation.groups()
  t.true(groups.length > 0)
})

test('test_documentation_pages', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Check some pages exist
  let pages = await documentation.pages()
  t.true(pages.length > 0)
})

test('test_documentation_pages_blocks', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Check some pages exist
  let pages = await documentation.pages()

  // Check that each page has blocks
  for (let page of pages) {
    t.true(page.blocks.length > 0)
    t.true(page.title.length > 0)
  }
})

test('test_documentation_custom_blocks', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Check some defined blocks exist
  let blocks = await documentation.customBlocks()
  t.true(blocks.length > 0)
})

test('test_documentation_configuration_properties', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()
  let pages = await documentation.pages()

  // Check some defined blocks exist
  let properties = await documentation.customConfiguration()
  t.true(properties.length > 0)
})

test('test_documentation_configuration_variants', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Check some defined blocks exist
  let variants = await documentation.customBlockVariants()
  t.true(variants.length > 0)
})

test('test_documentation_publish', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Publish docs
  let publishingResult = await documentation.publish(DocumentationEnvironment.live)
  t.true(publishingResult.status === 'Queued' || publishingResult.status === 'InProgress')
})

test('test_documentation_is_publishing', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Publish docs
  let isPublishing = await documentation.isPublishing(DocumentationEnvironment.live)
  t.true(isPublishing.status === 'InProgress' || isPublishing.status === 'Idle')
})

test('test_documentation_pageProperties', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Fetch its active version
  let properties = await documentation.pageProperties()
  t.true(properties.length === 0) // Concept not implemented yet
})

test('test_documentation_pageDataViews', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()

  // Fetch its active version
  let views = await documentation.pageDataViews()
  t.true(views.length === 0) // Concept not implemented yet
})

test('test_documentation_page_links', async t => {
  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )
  let documentation = await version.documentation()
  // Check items exist
  let pages = await documentation.pages()
  for (let page of pages) {
    t.true(page.deployedPageUrl().length > 0)
    t.true(page.editorPageUrl().length > 0)
    t.true(page.relativePageUrl().length > 0)
  }
})
