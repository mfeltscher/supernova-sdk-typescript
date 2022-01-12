//
//  StringUtils.ts
//  Pulsar Language
//
//  Created by Jiri Trecak.
//  Copyright © 2020 Supernova. All rights reserved.
//

export class StringUtils {
  /** Returns string without whitespaces and newlines, trimmed left and right */
  public static trimmed(str: string): string {
    return str.trim()
  }

  /** Returns string without double quotes, trimmed left and right */
  public static withoutDoubleQuotes(str: string): string {
    return str.replace(/(^"|"$)/g, '')
  }

  /** Returns string without single and double quotes, trimmed left and right */
  public static withoutQuotes(str: string): string {
    return str.replace(/(^'|'$)/g, '')
  }

  /** Returns opening string until the first occurance of the character. If delimiter is not found, returns null */
  public static substringUntilDelimiter(str: string, delimiter: string): string | null {
    let buffer = ''
    for (const c of str) {
      if (c !== delimiter) {
        buffer += c
      } else {
        return buffer
      }
    }

    return null
  }

  /** Returns whether string is prefixed and suffixed with double quotes */
  public static isSurroundedWithDoubleQuotes(str: string): boolean {
    return str.startsWith('"') && str.endsWith('"')
  }

  /** Returns substring between two round brackets. Returns null if it doesn't fit the format */
  public static argumentStringBetweenBrackets(str: string, keyword: string): string | null {
    let argument = str
    if (argument.startsWith(keyword)) {
      argument = argument.substr(keyword.length)
    } else {
      // TODO: Rewrite
      // throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "String is not valid for keyword \(keyword)"])
      return null
    }
    if (argument.startsWith('(') && argument.endsWith(')')) {
      argument = argument.substr(1, argument.length - 2)
    } else {
      // TODO: Rewrite
      // throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Argument must be prefixed with ( and suffixed with )"])
      return null
    }

    return argument
  }

  /** Returns substring between two round brackets using syntax-sensitive parsing (ignoring quoted content and properly balancing number of ( ) */
  public static argumentStringBetweenBracketsFirstOccurance(str: string, keyword: string): string | null {
    // This recieves keyword(...)...
    let argument = str
    if (argument.startsWith(keyword)) {
      argument = argument.substr(keyword.length)
    } else {
      // TODO: Rewrite
      // throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "String is not valid for keyword \(keyword)"])
      return null
    }

    // Test if argument starts with (
    if (argument.startsWith('(')) {
      argument = argument.substr(1)
    } else {
      // TODO: Rewrite
      // throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Argument must be prefixed with ("])
      return null
    }

    // At this point, we have ...)... and we start parsing with openedBrackets count at 1
    let buffer = ''
    let lock: string | null = null
    let previousChar: string | null = null
    let openedBrackets: number = 1

    for (const c of argument) {
      // Iterate each character, testing for locks
      // Last character escapes so ignore next one
      if (previousChar !== '\\') {
        if (lock === c) {
          // Lock pair found, unlock
          lock = null
        } else {
          // Lock character found, but if it was escaped, ignored it
          if (lock === null && (c === "'" || c === '"')) {
            lock = c
          }
        }
      }

      // If content is not locked and character is either opening or closing bracket, we increase/decrease the level
      if (lock === null && c === '(') {
        openedBrackets += 1
      } else if (lock === null && c === ')') {
        if (openedBrackets > 0) {
          openedBrackets -= 1
        }

        // If we have closed the opening bracket, return the argument content
        if (openedBrackets === 0) {
          return buffer
        }
      }
      previousChar = c
      buffer += c
    }

    // TODO: Rewrite
    // throw NSError(domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Argument must be suffixed with )"])
    return null
  }

  /** Returns string without single and double quotes but removes only 1 character at most */
  public static withoutQuotesSingleOccurance(str: string): string {
    let string = str
    if (string.startsWith('"') || string.startsWith("'")) {
      string = string.substr(1)
    }

    if (string.endsWith('"') || string.endsWith("'")) {
      string = string.substr(0, string.length - 1)
    }

    return string
  }

  /** Returns string without single and double quotes but removes only 1 character at most */
  public static withoutDoubleQuotesSingleOccurance(str: string): string {
    let string = str
    if (string.startsWith('"')) {
      string = string.substr(1)
    }

    if (string.endsWith('"')) {
      string = string.substr(0, string.length - 1)
    }
    string = string.replace(/\\"/g, '"') // unmask quotes

    return string
  }

  /** Returns string without round brackets, trimmed left and right */
  public static withoutRoundBrackets(str: string): string {
    return str.replace('^[(]+|[)]+$', '')
  }

  /** Creates a full range of a string, returning range of (0, length) */
  public static fullRange(str: string): { location: number; length: number } {
    return { location: 0, length: str.length }
  }

  /** Creates string made of N spaces */
  public static spaces(count: number): string {
    return ' '.repeat(count)
  }

  /** Splits string using separator while properly handling quotes.
  Content inside single or double quote will be ignored. Only content within closed quote pair will be ignored,
  Last single, not closed quote will be ignored. Quote types can't be combined, if the quote pair
  started with one type, it needs to be closed with the same one. There can be multiple types of quote pairs in single string though.
  Returns original string without splitting if separator is single or double quote as this behavior is undefined */
  public static splitIgnoringQuotedContent(str: string, separator: string): Array<string> {
    if (separator === '"' || separator === "'") {
      return [str]
    }

    let components: Array<string> = []
    let buffer = ''
    let lock: string | null = null
    let previousChar: string | null = null
    let lastQuotePairPosition: number | null = null

    for (let [index, c] of str.split('').entries()) {
      // Iterate each character, testing for locks
      if (c === separator) {
        // Found separator, ignore the split if lock is active, otherwise add word to buffer
        if (lock === null) {
          components.push(buffer)
          buffer = ''
          lastQuotePairPosition = null
        } else {
          buffer += c
        }
      } else {
        // Separator not found
        buffer += c

        // Last character escapes so ignore next one
        if (previousChar !== '\\') {
          if (lock === c) {
            // Lock pair found, unlock
            lock = null
            lastQuotePairPosition = index
          } else {
            // Lock character found, but if it was escaped, ignored it
            if (lock === null && (c === "'" || c === '"')) {
              lock = c
            }
          }
        }
        // Remove lock assuming last character wasn't escaped
      }
      previousChar = c
    }

    // If there is some word, append it
    if (buffer.length > 0) {
      // Note that if the lock was opened but not closed, there is potentially last piece that wasn't split and should be
      // This is an edge case so we are treating it as such.
      // Could be optimized further just by saving whether separator was found inside lock but no need
      if (lock !== null) {
        // Gracefully handle edge case situation where following: "test \"test test\"\" test" can happen
        // Another quote is opened after some content with separator inside was ignored, meaning that separation of last buffer will actually result
        // in incorrectly separating content within quotes. So we split only the part after the last quote and prepend the prefix
        if (lastQuotePairPosition) {
          let substring = str.substr(lastQuotePairPosition, str.length - lastQuotePairPosition)
          let subcomponents = substring.split(separator)

          // Prepend the string with the unsplit part

          if (subcomponents.length > 0) {
            let firstItem = subcomponents[0]
            firstItem = `${buffer.substring(0, buffer.length - substring.length)}${firstItem}`
            subcomponents.splice(0, 1, firstItem)
          }

          // Append separated components
          components = components.concat(subcomponents)
        } else {
          components = components.concat(buffer.split(separator))
        }
      } else {
        components.push(buffer)
      }
    }

    return components
  }

  /** Removes spaces when they are inside of brackets, but properly handling spaces inside quoted content which should remain intact */
  public static withoutSpacesInsideRoundBrackets(str: string): string {
    let bracketCount = 0
    let isInsideQuotes = false
    let previousChar: string | null = null
    let result = ''

    for (let char of str) {
      switch (char) {
        case '(':
          if (!isInsideQuotes) {
            bracketCount += 1
          }
          break
        case ')':
          if (!isInsideQuotes) {
            bracketCount -= 1
          }
          break
        case '"':
          if (previousChar && previousChar === '\\') {
            // Escaped quotes do not change "isInsideQuotes"
          } else {
            isInsideQuotes = !isInsideQuotes
          }
          break
        default:
          break
      }
      if (char === ' ') {
        if (bracketCount === 0 || isInsideQuotes) {
          result += char
        }
      } else {
        result += char
      }

      previousChar = char
    }

    return result
  }

  /** Splits string using separator while properly handling quotes and ignoring all content that comes in ().
  Content inside single or double quote will be ignored. Only content within closed quote pair will be ignored,
  Last single, not closed quote will be ignored. Quote types can't be combined, if the quote pair
  started with one type, it needs to be closed with the same one. There can be multiple types
  of quote pairs in single string though.
  Returns original string without splitting if separator is single, double quote or left/right bracket as this behavior is undefined */
  public static splitIgnoringQuotedBracketedContent(str: string, separator: string): Array<string> {
    if (
      separator === '"' ||
      separator === "'" ||
      separator === '(' ||
      separator === ')' ||
      separator === '[' ||
      separator === ']' ||
      separator === '{' ||
      separator === '}'
    ) {
      return [str]
    }

    let components: Array<string> = []
    let buffer = ''
    let lock: string | null = null
    let previousChar: string | null = null
    let lastQuotePairPosition: number | null = null
    let openedRoundBrackets: number = 0
    let openedSquareBrackets: number = 0
    let openedCurlyBrackets: number = 0

    for (let [index, c] of str.split('').entries()) {
      // Iterate each character, testing for locks
      if (c === separator) {
        // Found separator, ignore the split if lock is active, or ignore the split if inside bracket, otherwise add word to buffer
        if (lock === null && openedSquareBrackets === 0 && openedRoundBrackets === 0 && openedCurlyBrackets === 0) {
          components.push(buffer)
          buffer = ''
          lastQuotePairPosition = null
        } else {
          buffer += c
        }
      } else {
        // Separator not found
        buffer += c

        // Last character escapes so ignore next one
        if (previousChar !== '\\') {
          if (lock === c) {
            // Lock pair found, unlock
            lock = null
            lastQuotePairPosition = index
          } else {
            // Lock character found, but if it was escaped, ignored it
            if (lock === null && (c === "'" || c === '"')) {
              lock = c
            }
          }
        }

        // If content is not locked and character is either opening or closing bracket, we increase/decrease the level
        if (lock === null && c === '(') {
          openedRoundBrackets += 1
        } else if (lock === null && c === ')') {
          if (openedRoundBrackets > 0) {
            openedRoundBrackets -= 1
          }
        } else if (lock === null && c === '[') {
          openedSquareBrackets += 1
        } else if (lock === null && c === ']') {
          if (openedSquareBrackets > 0) {
            openedSquareBrackets -= 1
          }
        } else if (lock === null && c === '{') {
          openedCurlyBrackets += 1
        } else if (lock === null && c === '}') {
          if (openedCurlyBrackets > 0) {
            openedCurlyBrackets -= 1
          }
        } 
      }
      previousChar = c
    }

    // If there is some word, append it
    if (buffer.length > 0) {
      // Note that if the lock was opened but not closed, there is potentially last piece that wasn't split and should be
      // This is an edge case so we are treating it as such.
      // Could be optimized further just by saving whether separator was found inside lock but no need
      if (lock !== null) {
        // Gracefully handle edge case situation where following: "test \"test test\"\" test" can happen
        // Another quote is opened after some content with separator inside was ignored, meaning that separation of last buffer will actually result
        // in incorrectly separating content within quotes. So we split only the part after the last quote and prepend the prefix
        if (lastQuotePairPosition) {
          let substring = str.substr(lastQuotePairPosition, str.length - lastQuotePairPosition)
          let subcomponents = substring.split(separator)

          // Prepend the string with the unsplit part
          if (subcomponents.length > 0) {
            let firstItem = subcomponents[0]
            firstItem = `${buffer.substring(0, buffer.length - substring.length)}${firstItem}`
            subcomponents.splice(0, 1, firstItem)
          }

          // Append separated components
          components = components.concat(subcomponents)
        } else {
          components = components.concat(buffer.split(separator))
        }
      } else {
        components.push(buffer)
      }
    }

    return components
  }

  /** Tests whether all characters of the string are lowercased and are only letters a-z */
  public static isLowercaseLetters(str: string): boolean {
    return /^[a-z]+$/.test(str)
  }

  /** Tests whether all characters of the string are lowercased and are only letters a-z, including separator dot */
  public static isLowercaseLettersCanIncludeDot(str: string): boolean {
    return /^[a-z.]+$/.test(str)
  }

  /** Tests whether all characters of the string are letters */
  public static isLetters(str: string): boolean {
    return /^[a-zA-Z]+$/.test(str)
  }

  /** Tests whether all characters of the string are letters, including separator dot */
  public static isLettersCanIncludeDot(str: string): boolean {
    return /^[a-zA-Z.]+$/.test(str)
  }

  /** Tests whether the first character of the string is lowercase */
  public static isFirstCharacterLetterLowercase(str: string): boolean {
    if (str.length === 0) {
      return false
    }

    return str[0].toLowerCase() === str[0]
  }

  /** Tests whether all characters of the string are spaces */
  public static isOnlySpaces(str: string): boolean {
    return /^[ ]+$/.test(str)
  }

  /** Tests whether all characters of the string are spaces or newlines */
  public static isOnlySpacesOrLineBreaks(str: string): boolean {
    return /^\s*$/.test(str)
  }

  /** Tests whether string represents array definition - starts with [, ends with ]
   * and doesn't contain : unless in double quotes
   */
  public static isStructuralArrayDefinition(str: string): boolean {
    let trimmed = str.trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && str.indexOf(':') === -1) {
      return true
    }

    return false
  }

  /** Parses array if it is structuraly viable and retrieves array components */
  public static parsedArrayFromDefinition(str: string): Array<string> | null {
    let workingString = str
    if (!this.isStructuralArrayDefinition(str)) {
      return null
    }

    // Clear the array definition
    // Remove first and last symbol ([])
    workingString = workingString.trim().substr(1, workingString.length - 2)

    // Split array with ","
    let components = this.splitIgnoringQuotedBracketedContent(workingString, ',')
    return components
  }

  /** Tests whether string represents dictionary definition - starts with [, ends with ]
   * and contains at least once :
   */
  public static isStructuralDictionaryDefinition(str: string): boolean {
    // TODO: Test this properly, only find definitions that don't have : inside quotes
    let trimmed = str.trim()
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && str.indexOf(':') !== -1) {
      return true
    }

    return false
  }

  /** Parses array if it is structuraly viable and retrieves array components */
  public static parsedDictionaryFromDefinition(str: string): Map<string, string> | null {
    let workingString = str
    if (!this.isStructuralDictionaryDefinition(str)) {
      return null
    }

    // Clear the array
    workingString = workingString.trim()

    // Remove first and last symbol ([])
    workingString.substr(1, workingString.length - 2)

    // Test whether the remaining string isn't just :. If so, it means we are creating empty dictionary
    if (workingString === ':') {
      return new Map<string, string>()
    }

    // Split dictionary key-value pairs with ","
    let components = this.splitIgnoringQuotedBracketedContent(workingString, ',')

    // Split keys and values. Format MUST be [key] : [value], otherwise we fail
    let map = new Map<string, string>()
    for (let component of components) {
      let pair = this.splitIgnoringQuotedContent(component, ':')
      if (pair.length === 2) {
        // Add the data
        map.set(pair[0], pair[1])
      } else {
        // Format is wrong
        return null
      }
    }

    return map
  }

  public static replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace)
  }

  public static escapeRegExp(string: string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
  }
}
