import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { semanticTokenColors, tokenColors, workbench } from './vscode-mappings'

const theme = {
  name: 'Nebula Haze',
  type: 'dark' as const,
  semanticHighlighting: true,
  colors: workbench,
  semanticTokenColors,
  tokenColors,
}

const outDir = join(__dirname, '..', 'themes')
const outPath = join(outDir, 'nebula-haze-color-theme.json')
mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, JSON.stringify(theme, null, 2))
console.log(`Generated ${outPath}`)
