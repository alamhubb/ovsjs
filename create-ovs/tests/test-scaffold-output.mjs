import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const projectName = 'ovs-qin-managed-smoke'
const tempRoot = mkdtempSync(path.join(tmpdir(), 'create-ovs-smoke-'))
const projectRoot = path.join(tempRoot, projectName)

try {
  const result = spawnSync(
    process.execPath,
    [path.resolve('dist/index.mjs'), projectName],
    {
      cwd: tempRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }
  )

  assert.equal(
    result.status,
    0,
    `create-ovs scaffold failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
  )

  assertFile('qin.config.js')
  assertFile('package.json')
  assertFile('README.md')
  assertFile(path.join('src', 'components', 'HelloWorld.ovs'))

  const qinConfig = read('qin.config.js')
  assertIncludes(qinConfig, `name: "${projectName}"`, 'qin.config.js should replace project name')
  assertIncludes(qinConfig, 'type: "fullstack"', 'qin.config.js should create a Qin fullstack project')
  assertIncludes(qinConfig, 'frontend:', 'qin.config.js should declare frontend metadata')
  for (const scriptName of ['dev', 'build', 'preview', 'test']) {
    assertIncludes(qinConfig, `${scriptName}: `, `qin.config.js should declare ${scriptName} script`)
  }
  assertNoExternalScriptForwarding(qinConfig, 'qin.config.js')

  const packageJson = JSON.parse(read('package.json'))
  assert.equal(packageJson.name, projectName, 'package.json should replace project name')
  assert.equal(packageJson.scripts, undefined, 'package.json should not define scripts')
  assert.equal(
    JSON.stringify(packageJson).includes('npm-run-all'),
    false,
    'package.json should not depend on script runner packages'
  )

  const readme = read('README.md')
  for (const command of ['qin install', 'qin dev', 'qin build']) {
    assertIncludes(readme, command, `README should guide users to ${command}`)
  }
  assertNoExternalScriptForwarding(readme, 'README.md')
} finally {
  rmSync(tempRoot, { recursive: true, force: true })
}

function assertFile(relativePath) {
  const filePath = path.join(projectRoot, relativePath)
  assert.equal(existsSync(filePath), true, `expected scaffold output file ${relativePath}`)
}

function read(relativePath) {
  return readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

function assertIncludes(source, expected, label) {
  assert.equal(source.includes(expected), true, label)
}

function assertNoExternalScriptForwarding(source, label) {
  for (const forbidden of ['npm run', 'npx ', 'pnpm ', 'yarn ']) {
    assert.equal(source.includes(forbidden), false, `${label} should not contain ${forbidden}`)
  }
}
