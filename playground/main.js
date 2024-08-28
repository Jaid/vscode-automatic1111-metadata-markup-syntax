import * as YAML from 'https://cdn.jsdelivr.net/npm/yaml@2.5.0/browser/index.js/+esm'
import * as shiki from 'https://cdn.jsdelivr.net/npm/shiki@1.14.1/+esm'
import yamlLanguage from 'https://cdn.jsdelivr.net/npm/shiki@1.14.1/dist/langs/yaml.mjs/+esm'
import blackTheme from 'https://cdn.jsdelivr.net/npm/shiki@1.14.1/dist/themes/vitesse-black.mjs/+esm'
import mapObject, { mapObjectSkip } from 'https://cdn.jsdelivr.net/npm/map-obj/+esm'

const yamlInput = document.getElementById('yamlInput')
const exampleTextElement = document.getElementById('exampleText')
const outputDiv = document.getElementById('output')
const tokenOutput = document.getElementById('tokenOutput')
const highlightButton = document.getElementById('highlightButton')

let shikiHighlighter = await shiki.createHighlighter({
  themes: [blackTheme],
  langs: [yamlLanguage[0]]
})

function updateURL() {
  const encodedYAML = btoa(encodeURIComponent(yamlInput.value))
  const newURL = `${window.location.origin}${window.location.pathname}?yaml=${encodedYAML}`
  window.history.replaceState(null, '', newURL)
}
const run = async () => {
  let startTime = performance.now()
  try {
    const grammarYAML = yamlInput.value
    const grammar = YAML.parse(grammarYAML)
    await shikiHighlighter.loadLanguage(grammar)
    const exampleText = exampleTextElement.value.trim()
    const updateTokens = async () => {
      const tokens = await shiki.codeToTokens(exampleText, {
        lang: grammar,
        theme: 'vitesse-black',
        includeExplanation: true
      })
      const tokensCleaned = mapObject(tokens, (key, value) => {
        if (key === "themeMatches" || key === "color" || key === "fontStyle" || key === "bg" || key === "fg" || key === "themeName") {
          return mapObjectSkip
        }
        return [key, value]
      }, { deep: true })
      const tokenizedYAML = YAML.stringify(tokensCleaned, { indent: 2 })
      tokenOutput.textContent = tokenizedYAML
      const highlightedTokens = await shikiHighlighter.codeToHtml(tokenizedYAML,{
        lang: 'yaml',
        theme: 'vitesse-black'
      })
      tokenOutput.innerHTML = `<pre>${highlightedTokens}</pre>`
    }
    const updateHighlight = async () => {
      const highlightedHTML = await shikiHighlighter.codeToHtml(exampleText,{
        lang: grammar,
        theme: 'vitesse-black'
      })
      outputDiv.innerHTML = highlightedHTML
    }
    await Promise.all([updateTokens(), updateHighlight()])
  } catch (error) {
    console.error('Error highlighting text:', error)
    outputDiv.innerHTML = '<span style="color: red;">Error: ' + error.message + '</span>'
  } finally {
    const ms = Math.trunc(performance.now() - startTime)
    console.log(`Highlighting took ${ms} ms`)
  }
}

const fetchExampleText = async () => {
  try {
    const response = await fetch('/grammar/tiny')
    const text = await response.text()
    exampleTextElement.textContent = text
  } catch (error) {
    console.error('Error fetching example text:', error)
  }
}

const rehydrateFromURL = async () => {
  const params = new URLSearchParams(window.location.search)
  const yamlBase64 = params.get('yaml')
  if (yamlBase64) {
    try {
      const decodedYAML = decodeURIComponent(atob(yamlBase64))
      yamlInput.value = decodedYAML
      return Boolean(decodedYAML)
    } catch (error) {
      console.error('Error decoding YAML from URL:', error)
    }
  }
}

async function initializeHighlighter(grammar) {
  const highlighter = new shiki.Highlighter({
    getGrammar: async (scopeName) => {
      if (scopeName === 'source.a1111') {
        return grammar
      }
      if (scopeName === 'source.yaml') {
        return yamlLanguage[0]
      }
      return null
    },
    getOniguruma: async () => {
      const wasmBinary = await fetch('https://cdn.jsdelivr.net/npm/vscode-oniguruma@2.0.1/release/onig.wasm').then(res => res.arrayBuffer())
      return wasmBinary
    },
    getTheme: async () => {
      return {
        ...blackTheme,
      }
    }
  })
  return highlighter
}

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    run()
  }
})

highlightButton.addEventListener('click', run)
yamlInput.addEventListener('input', updateURL)
exampleTextElement.addEventListener('input', run)

await fetchExampleText()
const result = await rehydrateFromURL()
if (!result) {
  const response = await fetch('/yaml')
  const text = await response.text()
  yamlInput.value = text
}
document.body.style.visibility = 'visible'
  await run()
