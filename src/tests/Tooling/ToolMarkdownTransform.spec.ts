//
//  ToolMarkdownTransform.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { testInstance } from '../helpers'
import test from 'ava'
import { MarkdownTransform, MarkdownTransformType } from '../../tools/markdown-transform/SDKToolsMarkdownTransform'
import fs from "fs"
import path from 'path'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_tooling_markdown_transform', async t => {

  // Fetch specific design system version
  let version = await testInstance.designSystemVersion(
    process.env.TEST_DB_DESIGN_SYSTEM_ID,
    process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID
  )

  // Fetch documentation pages needed for the index construction
  let docs = await version.documentation()
  let pages = await docs.pages()

  // Construct markdown transformer with one of the available modes
  let transformer = new MarkdownTransform(MarkdownTransformType.commonmark, version)
  let pageAsMarkdown = await transformer.convertPageToMarkdown(pages[0])

  // Write markdown page so we can preview it as well
  let writePath = path.join(process.cwd(), '.markdown', 'page.md')
  fs.writeFileSync(writePath, pageAsMarkdown) 

  // Search for keyword
  await t.true(pageAsMarkdown.length > 0)
})
