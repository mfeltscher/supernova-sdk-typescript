//
//  SDKDTJSONConverter.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2022 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports
import { Parser } from 'expr-eval'
import calcAstParser from 'postcss-calc-ast-parser'

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Definitions

const parser = new Parser()

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Parsing and reduction utility for math expressions */
export class DTExpressionParser {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Expressions

  /** Reduce value of expressions to their base form */
  static reduceExpressionsToBaseForm(baseExpression: string) {
    try {
      let parsedExpression = calcAstParser.parse(baseExpression)
      const reducedExpression = calcAstParser.reduceExpression(parsedExpression)

      let unitlessExpr = baseExpression
      let unit = ''

      if (reducedExpression && reducedExpression.type !== 'Number') {
        unitlessExpr = baseExpression.replace(new RegExp(reducedExpression.unit, 'ig'), '')
        unit = reducedExpression.unit
      }

      const evaluatedExpression = parser.evaluate(unitlessExpr)
      if (unit) {
        Number.parseFloat(evaluatedExpression.toFixed(3))
      } else {
        return `${evaluatedExpression}${unit}`
      }
    } catch (error) {
      return baseExpression
    }
  }
}
