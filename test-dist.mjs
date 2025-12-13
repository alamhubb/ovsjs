// 测试构建后的 vite-plugin-ovs
console.log('Starting test...');

async function test() {
  const { vitePluginOvsTransform } = await import('./vite-plugin-ovs/dist/index.mjs');

  const code = `view Test() { div { 'hello' } }`;
  console.log('Testing code:', code);

  try {
    const result = vitePluginOvsTransform(code);
    console.log('\nTransform succeeded!');
    console.log('Generated code:', result.code);
  } catch (e) {
    console.error('\nTransform failed:', e.message);
    console.error(e.stack);
  }
}

test().catch(e => {
  console.error('Test error:', e);
});
