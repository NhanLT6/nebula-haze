#!/usr/bin/env node
'use strict'

const { spawnSync } = require('child_process')
const readline = require('readline')
const fs = require('fs')
const path = require('path')
const os = require('os')

const ROOT = path.resolve(__dirname, '..')
const IS_WIN = process.platform === 'win32'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((resolve) => rl.question(q, r => resolve(r)))

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}`)
  // shell: IS_WIN handles .cmd wrappers (pnpm.cmd, node.cmd, etc.) on Windows
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: IS_WIN, ...opts })
  if (result.status !== 0) throw new Error(`Command failed with exit code ${result.status}`)
}

// ── Actions ────────────────────────────────────────────────────────────────

async function buildRider() {
  console.log('\nBuilding Rider JAR...')
  run('pnpm', ['build'], { cwd: path.join(ROOT, 'rider') })
  console.log('\nCheck rider/releases/ for the .jar file.')
}

async function installVscode() {
  const src = path.join(ROOT, 'vscode')
  const extDir = path.join(os.homedir(), '.vscode', 'extensions', 'nebula-haze')

  // lstat checks the symlink itself, not its target — catches broken links too
  let existing = null
  try { existing = fs.lstatSync(extDir) } catch {}

  if (existing) {
    const isSymlink = existing.isSymbolicLink()
    // realpathSync throws on a broken symlink — null means broken/unresolvable
    const currentTarget = isSymlink
      ? (() => { try { return fs.realpathSync.native(extDir) } catch { return null } })()
      : null

    if (isSymlink && currentTarget === fs.realpathSync.native(src)) {
      console.log(`\nAlready installed at: ${extDir}`)
      console.log('Theme updates are live — just run pnpm build in vscode/ after changes.')
      return
    }

    // Broken symlink or wrong target (repo was moved) — offer to fix it
    const label = isSymlink ? `broken/outdated symlink pointing elsewhere` : `non-symlink path`
    console.log(`\nFound ${label} at: ${extDir}`)
    const ans = await ask('Remove it and reinstall? [y/N] ')
    if (ans.toLowerCase() !== 'y') return
    fs.rmSync(extDir, { recursive: true, force: true })
  }

  console.log(`\nCreating symlink:`)
  console.log(`  ${extDir}  →  ${src}`)

  if (IS_WIN) {
    // Use pwsh ScriptBlock syntax so paths are passed as variables, not shell-interpolated strings
    const result = spawnSync('pwsh', [
      '-Command',
      `& { param($p,$t) New-Item -ItemType SymbolicLink -Path $p -Target $t } '${extDir}' '${src}'`,
    ], { stdio: 'inherit' })

    if (result.status !== 0) {
      console.log('\nFailed. On Windows, either:')
      console.log('  • Run this script as Administrator, or')
      console.log('  • Enable Developer Mode (Settings → System → For Developers)')
      return
    }
  } else {
    run('ln', ['-s', src, extDir])
  }

  console.log('\nDone. Restart VSCode and select Nebula Haze from Ctrl+K Ctrl+T.')
}

async function installOhMyPosh() {
  const configPath = path.join(ROOT, 'prompt', 'nebula-haze.omp.json')
  const marker = 'nebula-haze.omp.json'

  if (IS_WIN) {
    const result = spawnSync('pwsh', ['-Command', '$PROFILE'], { encoding: 'utf8' })
    const profilePath = result.stdout.trim()

    if (!profilePath) {
      console.log('\nCould not determine PowerShell profile path. Add manually:')
      console.log(`  oh-my-posh init pwsh --config "${configPath}" | Invoke-Expression`)
      return
    }

    const initLine = `oh-my-posh init pwsh --config "${configPath}" | Invoke-Expression`

    if (fs.existsSync(profilePath) && fs.readFileSync(profilePath, 'utf8').includes(marker)) {
      console.log(`\nAlready configured in ${profilePath}`)
      return
    }

    console.log(`\nAdd this line to your PowerShell profile (${profilePath}):\n`)
    console.log(`  ${initLine}\n`)
    const ans = await ask('Append automatically? [y/N] ')
    if (ans.toLowerCase() === 'y') {
      fs.appendFileSync(profilePath, `\n${initLine}\n`)
      console.log('\nAppended. Restart your terminal.')
    }
  } else {
    const initLine = `eval "$(oh-my-posh init bash --config ${configPath})"`
    const rcFile = path.join(os.homedir(), '.bashrc')

    if (fs.existsSync(rcFile) && fs.readFileSync(rcFile, 'utf8').includes(marker)) {
      console.log('\nAlready configured in ~/.bashrc')
      return
    }

    console.log('\nAdd this line to ~/.bashrc:\n')
    console.log(`  ${initLine}\n`)
    const ans = await ask('Append automatically? [y/N] ')
    if (ans.toLowerCase() === 'y') {
      fs.appendFileSync(rcFile, `\n${initLine}\n`)
      console.log('\nAppended. Run: source ~/.bashrc')
    }
  }
}

// ── Menu ───────────────────────────────────────────────────────────────────

const MENU = [
  ['Build Rider JAR',                buildRider],
  ['Install VSCode theme (symlink)', installVscode],
  ['Install oh-my-posh prompt',      installOhMyPosh],
]

async function main() {
  const platformLabel = IS_WIN ? 'Windows' : `${os.type()} (${process.platform})`
  console.log(`\nNebula Haze Setup  ·  ${platformLabel}\n`)
  MENU.forEach(([label], i) => console.log(`  ${i + 1})  ${label}`))
  console.log()

  const raw = await ask('Choice [1-3]: ')
  const idx = parseInt(raw, 10) - 1

  if (idx >= 0 && idx < MENU.length) {
    await MENU[idx][1]()
  } else {
    console.log('Invalid choice.')
  }

  rl.close()
}

main().catch((err) => {
  console.error(err.message)
  rl.close()
  process.exit(1)
})
