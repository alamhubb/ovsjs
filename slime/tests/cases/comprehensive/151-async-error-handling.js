// Error handling
async function test() {
  try {
    const data = await Promise.reject('error');
  } catch (e) {
    return 'caught';
  }
}