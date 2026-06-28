import { OvsVirtualCode } from '../ovs-language-server/src/OvsLanguagePlugin'

const source = 'div {'
const virtualCode = new OvsVirtualCode({
  getText: (start: number, end: number) => source.slice(start, end),
  getLength: () => source.length,
  getChangeRange: () => undefined,
})

const embedded = virtualCode.embeddedCodes[0]
if (!embedded) {
  throw new Error('Expected OVS virtual code to create a TypeScript embedded code')
}

const generated = embedded.snapshot.getText(0, embedded.snapshot.getLength())
if (generated === source) {
  throw new Error('OVS transform failure must not fall back to identity source text')
}

if (!generated.includes('OVS transform failed')) {
  throw new Error(`Expected explicit transform failure code, got: ${generated}`)
}

const mapping = embedded.mappings[0]
if (!mapping || mapping.sourceOffsets[0] !== 0 || mapping.lengths[0] !== source.length) {
  throw new Error('Expected transform failure mapping to cover the original OVS source')
}

const nestedSource = [
  'const title = "Qin"',
  'export default div {',
  '  h1 { title }',
  '}',
  '',
].join('\n')
const nestedVirtualCode = new OvsVirtualCode({
  getText: (start: number, end: number) => nestedSource.slice(start, end),
  getLength: () => nestedSource.length,
  getChangeRange: () => undefined,
})
const nestedEmbedded = nestedVirtualCode.embeddedCodes[0]
if (!nestedEmbedded) {
  throw new Error('Expected nested OVS virtual code to create a TypeScript embedded code')
}

const nestedGenerated = nestedEmbedded.snapshot.getText(0, nestedEmbedded.snapshot.getLength())
if (/\$OvsHtmlTag\.\s*\n\s*[A-Za-z_$]/.test(nestedGenerated)) {
  throw new Error(`OVS virtual TypeScript must not split member callees after dot: ${nestedGenerated}`)
}
if (!nestedGenerated.includes('$OvsHtmlTag.h1(')) {
  throw new Error(`Expected nested HTML tag to generate a valid member call, got: ${nestedGenerated}`)
}

console.log('test-ovs-virtual-code-error passed')
