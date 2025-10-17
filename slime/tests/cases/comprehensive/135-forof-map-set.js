// For-of Map/Set iteration
const map = new Map([[1, 'a'], [2, 'b']]);
for (const [key, value] of map) {
  const pair = key + value;
}
const set = new Set([1, 2, 3]);
for (const item of set) {
  const x = item;
}