/* eslint-disable new-cap */

import type {FirstParameter} from 'more-types'

import * as chevrotain from 'chevrotain'

type AnonymousTokenConfig = Omit<FirstParameter<typeof chevrotain.createToken>, `name`>
type AnonymousTokenConfigShortcut = RegExp | string
const tokens: Array<ReturnType<typeof chevrotain.createToken>> = []
const getOptionsFromShortcut = (recipe: AnonymousTokenConfig | AnonymousTokenConfigShortcut) => {
  if (typeof recipe === `string` || recipe instanceof RegExp) {
    return {pattern: recipe}
  }
  return recipe
}
const makeToken = (name: string, recipe: AnonymousTokenConfig | AnonymousTokenConfigShortcut) => {
  const token = chevrotain.createToken({
    name,
    ...getOptionsFromShortcut(recipe),
  })
  tokens.push(token)
  return token
}
const makePushToken = (name: string, mode: string, recipe: AnonymousTokenConfigShortcut | Omit<AnonymousTokenConfig, `push_mode`>) => {
  return makeToken(name, {
    ...getOptionsFromShortcut(recipe),
    push_mode: mode,
  })
}
const makePopToken = (name: string, recipe: AnonymousTokenConfigShortcut | Omit<AnonymousTokenConfig, `pop_mode`>) => {
  return makeToken(name, {
    ...getOptionsFromShortcut(recipe),
    pop_mode: true,
  })
}
const makeSwitchToken = (name: string, mode: string, recipe: AnonymousTokenConfigShortcut | Omit<AnonymousTokenConfig, `pop_mode` | `push_mode`>) => {
  return makeToken(name, {
    ...getOptionsFromShortcut(recipe),
    push_mode: mode,
    pop_mode: true,
  })
}
const sliceUntil = (text: string, startOffset: number, endings: Array<string> = [`\n`]) => {
  const isEnd = (index: number) => {
    if (index === text.length) {
      return true
    }
    for (const ending of endings) {
      if (text.slice(index, index + ending.length) === ending) {
        return true
      }
    }
    return false
  }
  let currentIndex = startOffset
  while (!isEnd(currentIndex)) {
    currentIndex++
  }
  // if (currentIndex === startOffset) {
  //   return
  // }
  if (currentIndex === text.length) {
    return
  }
  return text.slice(startOffset, currentIndex)
}
const sliceUntilOptional = (text: string, startOffset: number, endings: Array<string> = [`\n`]) => {
  const isEnd = (index: number) => {
    if (index === text.length) {
      return true
    }
    for (const ending of endings) {
      if (text.slice(index, index + ending.length) === ending) {
        return true
      }
    }
    return false
  }
  let currentIndex = startOffset
  while (!isEnd(currentIndex)) {
    currentIndex++
  }
  // if (currentIndex === startOffset) {
  //   return
  // }
  return text.slice(startOffset, currentIndex)
}
const sliceValue = (text: string, startOffset: number) => {
  return sliceUntilOptional(text, startOffset, [`\n`, `, `])
}
const promptSuffix = `\u200B\u200B\u200B`
const eolToken = makeToken(`eolToken`, `\n`)
const eolPopToken = makePopToken(`eolPopToken`, {
  pattern:`\n`,
  categories: eolToken,
})
const whitespaceToken = makeToken(`whitespaceToken`, /\s+/)
const blankLineToken = makeToken(`blankLineToken`, /\s*?(?=\n)/)
const emptyLineToken = makeToken(`emptyLineToken`, {
  pattern: (text, startOffset, previousTokens, a) => {
    console.log({
      text,
      startOffset,
      previousTokens,
      a,
    })
    if (text[startOffset] !== `\n`) {
      return null
    }
    if (previousTokens.length > 0 && previousTokens.at(-1).tokenType !== eolToken) {
      return null
    }
    return [`\n`]
  },
  line_breaks: false,
  categories: blankLineToken,
})
const promptValueToken = makeToken(`promptValueToken`, /.*?(?=\u200B{3})/)
const entryKeySuffixToken = makeSwitchToken(`entryKeySuffixToken`, `entryValue`, `: `)
const entryKeyToken = makePushToken(`entryKeyToken`, `entryStart`, /[ \(\)\-\.0-9a-z\[\]_]+(?=: )/i)
const entryEolToken = makePopToken(`entryEolToken`, {
  pattern: `\n`,
  categories: eolToken,
})
const entrySplitterToken = makePopToken(`entrySplitterToken`, `, `)
const promptSuffixToken = makeToken(`promptSuffixToken`, promptSuffix)
const greedyPromptValueToken = makeSwitchToken(`greedyPromptValueToken`, `entryEnd`, {
  pattern: (text, startOffset) => {
    const suffix = promptSuffix + `\n`
    const value = sliceUntil(text, startOffset, [suffix])
    if (value === undefined) {
      return null
    }
    return value ? [value] : null
  },
  line_breaks: false,
  categories: promptValueToken,
})
const stringValueToken = makeSwitchToken(`stringValueToken`, `entryEnd`, {
  pattern: (text, startOffset) => {
    const value = sliceValue(text, startOffset)
    if (value === undefined) {
      return null
    }
    return [value]
  },
  line_breaks: false,
})
const integerValueToken = makeSwitchToken(`integerValueToken`, `entryEnd`, {
  pattern: (text, startOffset) => {
    const value = sliceValue(text, startOffset)
    if (value === undefined) {
      return null
    }
    if (!/^-?\d+$/.test(value)) {
      return null
    }
    return [value]
  },
  line_breaks: false,
})
const floatValueToken = makeSwitchToken(`floatValueToken`, `entryEnd`, {
  pattern: (text, startOffset) => {
    const value = sliceValue(text, startOffset)
    if (value === undefined) {
      return null
    }
    if (!/^-?\d+\.\d+$/.test(value)) {
      return null
    }
    return [value]
  },
  line_breaks: false,
})
const quoteStartToken = makeSwitchToken(`quoteStartToken`, `quote`, `"`)
const quoteEndToken = makeSwitchToken(`quoteEndToken`, `entryEnd`, `"`)
const quotedPromptValueToken = makeToken(`quotedPromptValueToken`, {
  pattern: /.*?(?=\u200B{3}")/,
  categories: promptValueToken,
})
const quotedStringValueToken = makeToken(`quotedStringValueToken`, {
  pattern: /.*?(?=")/,
  categories: stringValueToken,
})
const jsonObjectValueToken = makeSwitchToken(`jsonObjectValueToken`, `entryEnd`, /\{.+?\}/)
const fullPromptToken = makeToken(`fullPromptToken`, {
  pattern: /.+?(?=\u200B{3})/,
  categories: greedyPromptValueToken,
})
const firstLineToken = makeToken(`firstLineToken`, {
  pattern: /.+(?=\n)/,
  categories: fullPromptToken,
})
const firstLineEndToken = makePushToken(`firstLineEndToken`, `secondLine`, {
  pattern: `\n`,
  categories: eolToken,
})
const secondLineEntryKeyToken = makeToken(`secondLineEntryKeyToken`, {
  pattern: /negative prompt/i,
  categories: entryKeyToken,
})
const secondLineEntryKeySuffixToken = makeToken(`secondLineEntryKeySuffixToken`, {
  pattern: `: `,
  categories: entryKeySuffixToken,
})
const secondLineEntryValueToken = makeToken(`secondLineEntryValueToken`, {
  pattern: /.+(?=\n)/,
  categories: greedyPromptValueToken,
})
const secondLineEndToken = makePushToken(`secondLineEndToken`, `main`, {
  pattern: `\n`,
  categories: eolToken,
})
const modes = {
  firstLine: [
    firstLineEndToken,
    firstLineToken,
  ],
  secondLine: [
    secondLineEndToken,
    secondLineEntryKeyToken,
    secondLineEntryKeySuffixToken,
    secondLineEntryValueToken,
  ],
  main: [
    eolToken,
    entryKeyToken,
    fullPromptToken,
    promptSuffixToken,
    blankLineToken,
    whitespaceToken,
  ],
  entryStart: [entryKeySuffixToken],
  entryValue: [
    quoteStartToken,
    jsonObjectValueToken,
    floatValueToken,
    integerValueToken,
    greedyPromptValueToken,
    stringValueToken,
  ],
  quote: [quoteEndToken, promptSuffixToken, quotedPromptValueToken, quotedStringValueToken],
  entryEnd: [entrySplitterToken, entryEolToken, promptSuffixToken],
}
export const auto1111Lexer = new chevrotain.Lexer({
  modes,
  defaultMode: `firstLine`,
}, {
  recoveryEnabled: true,
  positionTracking: `full`,
})
export class Auto1111Parser extends chevrotain.CstParser {
  constructor() {
    super(tokens, {recoveryEnabled: true})
    this.RULE(`document`, () => {
      this.OPTION1(() => {
        this.SUBRULE1(this.firstLine)
        this.SUBRULE2(this.secondLine)
      })
      this.MANY_SEP({
        SEP: eolToken,
        DEF: () => {
          this.OPTION2(() => this.SUBRULE3(this.line))
        },
      })
    })
    this.RULE(`firstLine`, () => {
      this.CONSUME1(firstLineToken)
      this.CONSUME2(firstLineEndToken)
    })
    this.RULE(`secondLine`, () => {
      this.CONSUME1(secondLineEntryKeyToken)
      this.CONSUME2(secondLineEntryKeySuffixToken)
      this.CONSUME3(secondLineEntryValueToken)
      this.CONSUME4(secondLineEndToken)
    })
    this.RULE(`line`, () => {
      this.OR([
        {ALT: () => this.CONSUME(blankLineToken)},
        {ALT: () => this.SUBRULE4(this.entriesLine)},
        {ALT: () => this.SUBRULE5(this.promptLine)},
      ])
    })
    this.RULE(`promptLine`, () => {
      this.SUBRULE(this.prompt)
    })
    this.RULE(`entriesLine`, () => {
      this.AT_LEAST_ONE_SEP({
        SEP: entrySplitterToken,
        DEF: () => {
          this.SUBRULE(this.entry)
        },
      })
    })
    this.RULE(`entry`, () => {
      this.CONSUME1(entryKeyToken)
      this.CONSUME2(entryKeySuffixToken)
      this.SUBRULE(this.value)
    })
    this.RULE(`value`, () => {
      this.OR([
        {ALT: () => this.SUBRULE1(this.quotedPrompt)},
        {ALT: () => this.SUBRULE2(this.prompt)},
        {ALT: () => this.SUBRULE3(this.quotedString)},
        {ALT: () => this.CONSUME1(jsonObjectValueToken)},
        {ALT: () => this.CONSUME2(floatValueToken)},
        {ALT: () => this.CONSUME3(integerValueToken)},
        {ALT: () => this.CONSUME4(stringValueToken)},
      ])
    })
    this.RULE(`quotedPrompt`, () => {
      this.CONSUME1(quoteStartToken)
      this.CONSUME2(quotedPromptValueToken)
      this.CONSUME3(promptSuffixToken)
      this.CONSUME4(quoteEndToken)
    })
    this.RULE(`quotedString`, () => {
      this.CONSUME1(quoteStartToken)
      this.CONSUME2(quotedStringValueToken)
      this.CONSUME3(quoteEndToken)
    })
    this.RULE(`prompt`, () => {
      this.CONSUME1(greedyPromptValueToken)
      this.CONSUME2(promptSuffixToken)
    })
    this.performSelfAnalysis()
  }
}
export class Auto1111Extractor extends chevrotain.EmbeddedActionsParser {
  constructor() {
    super(tokens, {recoveryEnabled: true})
    this.RULE(`document`, () => {
      const entries = []
      this.OPTION(() => {
        const promptEntry = this.SUBRULE1(this.firstLine)
        if (promptEntry?.value) {
          entries.push(promptEntry)
        }
        const negativePromptEntry = this.SUBRULE2(this.secondLine)
        if (negativePromptEntry?.value) {
          entries.push(negativePromptEntry)
        }
      })
      this.MANY(() => {
        const entry = this.OR([
          {ALT: () => this.SUBRULE3(this.entry)},
          {ALT: () => this.CONSUME(fullPromptToken).image},
        ])
        const entryNormalized = typeof entry === `string` ? {key: `Prompt`, value: entry} : entry
        entries.push(entryNormalized)
      })
      return Object.fromEntries(entries.map(entry => [entry.key, entry.value]))
    })
    this.RULE(`firstLine`, () => {
      const value = this.CONSUME(firstLineToken).image
      this.CONSUME(firstLineEndToken)
      return {key: `Prompt`, value}
    })
    this.RULE(`secondLine`, () => {
      const key = this.CONSUME(secondLineEntryKeyToken).image
      this.CONSUME(secondLineEntryKeySuffixToken)
      const value = this.CONSUME(secondLineEntryValueToken).image
      this.CONSUME(secondLineEndToken)
      return {key, value}
    })
    this.RULE(`entry`, () => {
      const key = this.CONSUME(entryKeyToken).image
      this.CONSUME(entryKeySuffixToken)
      let value = this.SUBRULE(this.value)
      return {
        key,
        value,
      }
    })
    this.RULE(`value`, () => {
      return this.OR([
        {ALT: () => this.SUBRULE1(this.quotedPrompt)},
        {ALT: () => this.SUBRULE2(this.prompt)},
        {ALT: () => this.SUBRULE3(this.quotedString)},
        {
          ALT: () => {
            const value = this.SUBRULE4(this.jsonObject)
            if (typeof value !== `string`) {
              return value
            }
            try {
              return JSON.parse(value)
            } catch {
              return value
            }
          },
        },
        {ALT: () => this.SUBRULE5(this.floatValue)},
        {ALT: () => this.SUBRULE6(this.integerValue)},
        {ALT: () => this.CONSUME1(stringValueToken).image},
      ])
    })
    this.RULE(`quotedPrompt`, () => {
      this.CONSUME(quoteStartToken)
      const value = this.CONSUME(quotedPromptValueToken).image
      this.CONSUME(promptSuffixToken)
      this.CONSUME(quoteEndToken)
      return value
    })
    this.RULE(`quotedString`, () => {
      this.CONSUME(quoteStartToken)
      const value = this.CONSUME(quotedStringValueToken).image
      this.CONSUME(quoteEndToken)
      return value
    })
    this.RULE(`prompt`, () => {
      const value = this.CONSUME(greedyPromptValueToken).image
      this.CONSUME(promptSuffixToken)
      return value
    })
    this.RULE(`jsonObject`, () => {
      const value = this.CONSUME(jsonObjectValueToken).image
      return value
    })
    this.RULE(`floatValue`, () => {
      const value = this.CONSUME(floatValueToken).image
      return value
    })
    this.RULE(`integerValue`, () => {
      const value = this.CONSUME(integerValueToken).image
      return Number.parseInt(value)
    })
    this.performSelfAnalysis()
  }
}
