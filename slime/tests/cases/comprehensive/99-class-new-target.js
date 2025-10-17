// new.target
function Base() {
  if (new.target === Base) {
    return {type: 'base'};
  }
}
const obj = new Base();






