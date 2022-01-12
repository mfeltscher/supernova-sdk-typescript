//
//  FlowHelpers.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2020 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Helpers

export class FlowUtils {
  static offsetLines(content: string, by: number, character: string): string {
    return content
      .split('\n')
      .map(piece => {
        return `${character.repeat(by)}${piece}`
      })
      .join('\n')
  }

  static offsetLinesIgnoreFirst(content: string, by: number, character: string): string {
    let lines = content.split('\n')
    let buffer: Array<string> = []
    for (let [offset, element] of lines.entries()) {
      let piece = offset > 0 ? `${character.repeat(by)}${element}` : element
      buffer.push(piece)
    }

    return buffer.join('\n')
  }

  static offsetLinesCanIgnoreFirstline(
    content: string,
    shouldIgnoreFirstLine: boolean,
    userOffset: number,
    nodeOffset: number,
    character: string
  ): string {
    let actualOffset: number = Math.max(-nodeOffset, nodeOffset + userOffset)
    if (shouldIgnoreFirstLine) {
      return this.offsetLinesIgnoreFirst(content, actualOffset, character)
    } else {
      return this.offsetLines(content, actualOffset, character)
    }
  }
}
