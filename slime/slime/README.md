### What is slime?

Slime is a highly fault-tolerant js/ts parser and generator, just like the children's toy slime

### Why use slime instead of babel, recast, espree, esprima, typescript

* babel, recast, espree and esprima do not support fault tolerance

parser `let a =` will cause an error

* typescript

ast is not an extension of estree

