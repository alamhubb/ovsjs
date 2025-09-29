### What is slime?

A suitable for editor scenarios, Slime is a highly fault-tolerant js/ts parser and generator, just like the children's toy slime,Support js code containing various errors as much as possible

### Why use slime instead of babel, recast, espree, esprima, typescript

* babel, recast, espree and esprima do not support fault tolerance

parser `let a =` will cause an error

* typescript

ast is not an extension of estree

