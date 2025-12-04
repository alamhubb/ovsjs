// Symbol
const sym1 = Symbol()
const sym2 = Symbol("description")
const sym3 = Symbol.for("key")

const obj = {
  [sym1]: "value1",
  [sym2]: "value2"
}

const key = Symbol.iterator

