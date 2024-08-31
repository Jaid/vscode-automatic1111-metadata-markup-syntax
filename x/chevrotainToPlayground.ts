import clipboardy from 'clipboardy'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import ts from 'typescript'

const sourceFile = path.join(import.meta.dirname, `..`, `src`, `chevrotain`, `auto1111Chevrotain.ts`)
let source = await fs.readFile(sourceFile, `utf8`)
source = source.replaceAll(/^\s*(import\s+)/gm, `// $1`)
source = source.replaceAll(/^(\s*)(export\s+)/gm, `$1`)
source = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    removeComments: true,
  },
}).outputText
const hr = `-`.repeat(80)
source = `(function run() {\n// ${hr}\n\n\n\n${source.trim()}\n\n\n\n// ${hr}\nreturn {lexer: auto1111Lexer, parser: Auto1111Parser, defaultRule: 'document'}\n})()`
await clipboardy.write(source)
console.log(`Copied to clipboard (${source.length} characters)`)
