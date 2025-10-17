// Symbol property
const id = Symbol('id');
const obj = {
  [id]: 123,
  name: 'test'
};
const value = obj[id];