// Well-known symbols
const obj = {
  [Symbol.iterator]() {
    return {next: () => ({done: true})};
  }
};