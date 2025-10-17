// Complex async
async function complex() {
  const x = await Promise.resolve(1);
  const y = await Promise.resolve(x + 1);
  if (y > 1) {
    return await Promise.resolve(y * 2);
  }
  return y;
}