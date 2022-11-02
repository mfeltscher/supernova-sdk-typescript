//
//  ToolDocSearch.spec.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import { testInstance } from '../helpers'
import test from 'ava'
import { DocSearch, DocSearchConfiguration, DocSearchResultData, DocSearchResultDataType, DocSearchResult } from '../../tools/search-index/SDKToolsDocSearch'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tests

test('test_tooling_doc_search', async t => {

    // Fetch specific design system version
    let version = await testInstance.designSystemVersion(process.env.TEST_DB_DESIGN_SYSTEM_ID, process.env.TEST_DB_DESIGN_SYSTEM_VERSION_ID)

    // Fetch documentation pages needed for the index
    let docs = await version.documentation()
    let pages = await docs.pages()
    
    // Construct index from the data using precise configuration for search. You can use fuzzy or even your own configuration. For more, read about underlaying search index framework here https://github.com/krisk/Fuse
    let configuration = DocSearch.defaultPreciseConfiguration() // or DocSearch.defaultFuzzyConfiguration()
    let searchEngine = new DocSearch(configuration)
    searchEngine.updateSearchIndex(pages)

    // Search for keyword
    await t.true(searchEngine.search("introduction").length > 0)
    await t.true(searchEngine.search("ordered").length > 0)
})