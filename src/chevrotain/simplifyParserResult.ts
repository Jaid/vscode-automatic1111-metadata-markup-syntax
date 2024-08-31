import type {CstNode} from 'chevrotain'

import mapObject from 'map-obj'

import {simplifyLexToken} from 'src/chevrotain/simplifyLexResult.js'

export const simplifyParserResult = (parseResult: CstNode) => {
  const start = parseResult?.children
  if (!start) {
    return
  }
  return mapObject(start, (key, value) => {
    if (Array.isArray(value) && value[0]?.tokenType?.name) {
      return [key, value.map(simplifyLexToken)]
    }
    return [key, value]
  }, {deep: true})
}
