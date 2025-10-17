// Complex destructuring
const {name, address: {city, street}, tags: [first, ...rest]} = {
  name: 'Alice',
  address: {city: 'NYC', street: 'Main'},
  tags: ['js', 'ts', 'node']
};
