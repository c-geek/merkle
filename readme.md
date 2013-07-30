# Merkle [![Build Status](https://api.travis-ci.org/c-geek/merkle.png)](https://api.travis-ci.org/c-geek/merkle.png)

Builds a Merkle tree using either sha1, md5 or clear algorithm.

## Usage

### Build a Merkle tree
```js
var merkle = require('merkle');

var tree = merkle(['a', 'b', 'c', 'd', 'e'], 'sha1').process();
```
### Extract tree data

You can get tree root using:

```js
> tree.root();
'114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9'
```

Get tree depth:

```js
> tree.depth();
3
```

Get tree number of levels (depth + level of leaves):
```js
> tree.levels();
4
```

Get tree number of nodes

```js
> tree.nodes();
6
```

Get a tree level nodes:

```js
> tree.level(0);
['114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9']

> tree.level(1);
[
  '585DD1B0A3A55D9A36DE747EC37524D318E2EBEE',
  '58E6B3A414A1E090DFC6029ADD0F3555CCBA127F'
]

> tree.level(2);
[
  'F4D9EEA3797499E52CC2561F722F935F10365E40',
  '734F7A56211B581395CB40129D307A0717538088',
  '58E6B3A414A1E090DFC6029ADD0F3555CCBA127F'
]

...
```

### Using different hash algorithms

```js
var sha1tree  = merkle(['a', 'b', 'c', 'd', 'e'], 'sha1').process();
var md5tree   = merkle(['a', 'b', 'c', 'd', 'e'], 'md5').process();
var cleartree = merkle(['a', 'b', 'c', 'd', 'e'], 'clear').process();

> sha1tree.root();
'114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9'

> md5tree.root();
'064705BD78652C090975702C9E02E229'

> cleartree.root();
'ABCDE'
```

## Concepts

Here is an example of Merkle tree with 5 leaves (taken from [Tree Hash EXchange format (THEX)](http://web.archive.org/web/20080316033726/http://www.open-content.net/specs/draft-jchapweske-thex-02.html)):

                       ROOT=H(H+E)
                        /        \
                       /          \
                 H=H(F+G)          E
                /       \           \
               /         \           \
        F=H(A+B)         G=H(C+D)     E
        /     \           /     \      \
       /       \         /       \      \
      A         B       C         D      E


    Note: H() is some hash function

Where A,B,C,D,E *may* be already hashed data. If not, those leaves are turned into hashed data (using either *sha1*, *md5* or *clear* algorithm).

With such a tree structure, merkle considers the tree has exactly 6 nodes: `[ROOT,H,E,F,G,E]`. For a given level, nodes are just an array.

Adding a `Z` value would alter the `E` branch of the tree:

                        ROOT'=H(H+E')
                        /            \
                       /              \
                 H=H(F+G)              E'
                /       \               \
               /         \               \
        F=H(A+B)          G=H(C+D)       E'=H(E+Z)
        /     \           /     \         /     \
       /       \         /       \       /       \
      A         B       C         D     E         Z

`ROOT` changed to `ROOT'`, `E` to `E'`, but `H` did not.

# License

This software is provided under [MIT license](https://raw.github.com/c-geek/merkle/master/LICENSE).
