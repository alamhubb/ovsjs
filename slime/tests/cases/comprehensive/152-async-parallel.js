// Parallel async
async function parallel() {
  const [a, b] = await Promise.all([
    Promise.resolve(1),
    Promise.resolve(2)
  ]);
  return a + b;
}