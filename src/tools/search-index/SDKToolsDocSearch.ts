//
//  SDKToolsDocSearch.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

import Fuse from "fuse.js"
import { DocumentationPageBlockText } from "../../model/documentation/blocks/SDKDocumentationPageBlockText"
import { DocumentationPage } from "../../model/documentation/SDKDocumentationPage"
import { DocumentationPageBlock } from "../../model/documentation/SDKDocumentationPageBlock"
import { DocumentationGroupBehavior } from "../../model/enums/SDKDocumentationGroupBehavior"
import { DocumentationPageBlockType } from "../../model/enums/SDKDocumentationPageBlockType"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

export enum DocSearchResultDataType {
  contentBlock = 'contentBlock',
  sectionHeader = 'sectionHeader',
  pageTitle = 'pageTitle'
}

export type DocSearchResult = {
  item: DocSearchResultData,
  refIndex: number
}

export type DocSearchResultData = {
  id: number,
  pageName: string,
  pageId: string,
  blockId: string | undefined,
  text: string,
  type: DocSearchResultDataType
}

export type DocSearchConfiguration = {
  shouldSort?: boolean,
  threshold?: number,
  location?: number,
  distance?: number,
  maxPatternLength?: number,
  minMatchCharLength?: number,
  ignoreLocation?: boolean,
  keys: Array<string>,
}


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Search Instance

/** Search manager */
export class DocSearch {
    
  // --- Properties

  searchEngine: Fuse<object>
  searchConfiguration: DocSearchConfiguration

  // --- Constructor

  constructor(configuration: DocSearchConfiguration) {
    this.searchConfiguration = configuration
    this.searchEngine = this.reconstructSearchIndex([], configuration)
  }

  // --- Search index

  /* Removes previous data from search index and creates new one */
  updateSearchIndex = (pages: Array<DocumentationPage>): Array<DocSearchResultData> => {

    let id: number = 0
    let data: Array<DocSearchResultData> = []

    // Process every page for data
    for (let page of pages) {
      // Naming - For tabs, use name of the containing group, otherwise we get lot of design/code which is not very useful
      let pageName = page.title
      if (page.parent && page.parent.groupBehavior === DocumentationGroupBehavior.tabs) {
        pageName = page.parent.title + "/" + pageName
      }

      // Extract rich text from headers and any text piece there is
      let allBlocks = this.flattenedBlocksOfPage(page)
      for (let block of allBlocks) {
        if (block instanceof DocumentationPageBlockText) {
          data.push({
            id: id++,
            text: block.text.spans.map((s) => s.text).join(""),
            type: block.type === DocumentationPageBlockType.heading ? DocSearchResultDataType.sectionHeader : DocSearchResultDataType.contentBlock,
            blockId: block.id,
            pageId: page.id,
            pageName: pageName,
          })
        }
      }       

      // Push page information
      data.push({
        id: id++,
        text: page.title,
        type: DocSearchResultDataType.pageTitle,
        blockId: undefined,
        pageId: page.id,
        pageName: pageName,
      })
    }

    this.searchEngine = this.reconstructSearchIndex(data, this.searchConfiguration)
    return data
  }
  
  /* Removes previous data from search index and creates new one */
  search = (input: string): Array<DocSearchResult> => {
    return this.searchEngine.search(input)
  }

  // --- Conveniences

  /** When using this configuration, the results will be very precise and will not be deviating too much from the query */
  static defaultPreciseConfiguration(): DocSearchConfiguration {

    return {
      shouldSort: true,
      threshold: 0.1,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      ignoreLocation: true,
        keys: ["text"],
    }
  }

  /** When using this configuration, the results will be more fuzzy and might cover broader spectrum results than just near-keyword based search */
  static defaultFuzzyConfiguration(): DocSearchConfiguration {

    return {
        shouldSort: true,
        threshold: 0.2,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        ignoreLocation: true,
        keys: ["text"],
    }
  }

  /** Reconstructs the search index */
  private reconstructSearchIndex = (data: Array<object>, options: object): Fuse<object> => {
    const fuse = new Fuse(data, options)
    return fuse
  }

  /** Creates flattened structure of the blocks, even from the contained blocks, so it is easier to iterate through them */
  private flattenedBlocksOfPage = (page: DocumentationPage): Array<DocumentationPageBlock> => {
    let blocks: Array<DocumentationPageBlock> = page.blocks
    for (let block of page.blocks) {
        blocks = blocks.concat(this.flattenedBlocksOfBlock(block))
    }
    
    return blocks
  }

  /** Flattens one leaf of blocks */
  private flattenedBlocksOfBlock = (block: DocumentationPageBlock): Array<DocumentationPageBlock> => {
    let subblocks: Array<DocumentationPageBlock> = block.children
    for (let subblock of block.children) {
        subblocks = subblocks.concat(this.flattenedBlocksOfBlock(subblock))
    }

    return subblocks
  } 
}
