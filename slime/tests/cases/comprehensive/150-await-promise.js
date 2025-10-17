// await Promise
async function getData() {
  const data = await Promise.resolve(42);
  return data;
}