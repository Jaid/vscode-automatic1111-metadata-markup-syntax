import * as chevrotain from 'chevrotain'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {toCleanYamlFile} from 'zeug'

import {simplifyLexResult} from 'src/chevrotain/simplifyLexResult.js'
import {simplifyParserResult} from 'src/chevrotain/simplifyParserResult.js'

import * as auto1111Chevrotain from '../src/chevrotain/auto1111Chevrotain.js'

const inputFile = path.join(import.meta.dirname, `..`, `etc`, `sample`, `chevrotain.a1111.txt`)
const input = await fs.readFile(inputFile, `utf8`)
const lexResult = auto1111Chevrotain.auto1111Lexer.tokenize(input)
const simpleLexResult = simplifyLexResult(lexResult)
await toCleanYamlFile(lexResult, path.join(import.meta.dirname, `..`, `out`, `chevrotain`, `lexResult.yml`))
await toCleanYamlFile(simpleLexResult, path.join(import.meta.dirname, `..`, `out`, `chevrotain`, `lexResult-simple.yml`))
const parser = new auto1111Chevrotain.Auto1111Parser
const html = chevrotain.createSyntaxDiagramsCode(parser.getSerializedGastProductions())
await fs.outputFile(path.join(import.meta.dirname, `..`, `out`, `chevrotain`, `diagrams.html`), html)
parser.input = lexResult.tokens
// @ts-expect-error
const parsed = parser.document() as unknown as chevrotain.CstNode
const simpleParsed = simplifyParserResult(parsed)
await toCleanYamlFile(parsed, path.join(import.meta.dirname, `..`, `out`, `chevrotain`, `parsed.yml`))
await toCleanYamlFile(simpleParsed, path.join(import.meta.dirname, `..`, `out`, `chevrotain`, `parsed-simple.yml`))
const extractor = new auto1111Chevrotain.Auto1111Extractor
extractor.input = lexResult.tokens
const extracted = extractor.document()
console.dir(extracted, {depth: null})
