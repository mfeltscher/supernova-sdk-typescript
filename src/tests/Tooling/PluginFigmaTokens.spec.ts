//
//  PluginDesignTokens.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { SupernovaToolsDesignTokensPlugin } from '../../tools/design-tokens/SDKToolsDesignTokensPlugin'
import { testInstance } from '../helpers'

import test from 'ava'
import path from 'path'
import _ from 'lodash'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_tooling_design_tokens_load_and_merge_from_file', async t => {

  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )

  // Path to file
  let dataFilePath = path.join(process.cwd(), 'test-resources', 'single-file-sync', 'tokens.json')
  let mappingFilePath = path.join(process.cwd(), 'test-resources', 'single-file-sync', 'supernova.settings.json')

  // Get Figma Tokens synchronization tool
  let syncTool = new SupernovaToolsDesignTokensPlugin(version)

  // Run sync
  await syncTool.synchronizeTokensFromFile(dataFilePath, mappingFilePath)
})