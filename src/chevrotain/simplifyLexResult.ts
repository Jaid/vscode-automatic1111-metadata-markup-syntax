import type {ILexingResult} from 'chevrotain'
import type {Dict} from 'more-types'

export const simplifyLexToken = (token: ILexingResult[`tokens`][number]) => {
  const result: Dict = {
    type: token.tokenType.name.endsWith(`Token`) ? token.tokenType.name.slice(0, -5) : token.tokenType.name,
    text: token.image,
  }
  if (token.payload) {
    result.payload = token.payload
  }
  return result
}

export const simplifyLexResult = (lexResult: ILexingResult) => {
  const result: Dict = {}
  if (lexResult.tokens.length) {
    result.tokens = lexResult.tokens.map(simplifyLexToken)
  }
  if (lexResult.errors.length)
    result.errors = lexResult.errors.map(error => {
      return {
        message: error.message,
        offset: error.offset,
      }
    })
  return result
}
