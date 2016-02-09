# Merkle [![Build Status](https://api.travis-ci.org/c-geek/merkle.png)](https://travis-ci.org/c-geek/merkle) [![NPM version](https://badge.fury.io/js/merkle.svg)](http://badge.fury.io/js/merkle) [![Licence](http://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/c-geek/merkle/blob/master/LICENSE)

Builds a Merkle tree using either sha512, sha256, ripemd160, whirlpool, sha1, md5 or none algorithms.

## Usage

### Build a Merkle tree
```js
var merkle = require('merkle');
var abcde = ['a', 'b', 'c', 'd', 'e'];
```

#### Sync style

```js
var tree = merkle('sha1').sync(abcde);
```

#### Async style
```js
merkle('sha1').async(abcde, function(err, tree){
  // ...
});
```

#### Stream style
```js
// Stream style -- streams root hash
var merkleStreamRoot = merkle('sha1');
merkleStreamRoot.pipe(process.stdout);

// Stream style -- streams json tree
var es = require('event-stream');
var merkleStreamJson = merkle('sha1').json();
merkleStreamJson
  .pipe(es.stringify())
  .pipe(process.stdout);

abcde.forEach(function(letter){
    merkleStreamJson.write(letter);
});

merkleStreamJson.end();

// out:
// {"root":"114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9","depth":3,"levels":4,"nodes":6}

```

### Working ONLY with lowercase

For historical reasons, hashes were systematically uppercased which could lead to wrong trees (see issue [#8](https://github.com/c-geek/merkle/issues/8)).

We've added an extra parameter to avoid this case alteration, so you can work exclusively with lowercase hashes:

```
var use_uppercase = false;
merkle('sha256', use_uppercase);
```

> We plan to remove this syntax for v1.0.0 and always use lowercase hashes.

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
var sha256tree= merkle('sha256').sync(abcde);
var sha1tree  = merkle('sha1').sync(abcde);
var md5tree   = merkle('md5').sync(abcde);
var cleartree = merkle('none').sync(abcde);

> sha256tree.root();
'16E6BEB3E080910740A2923D6091618CAA9968AEAD8A52D187D725D199548E2C'

> sha1tree.root();
'114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9'

> md5tree.root();
'064705BD78652C090975702C9E02E229'

> cleartree.root();
'ABCDE'
```

### Install globally for merkle command

Installing it globally will introduce the `merkle` command (using sha1 as default):

```bash
$ sudo npm install -g merkle
$ merkle a
86F7E437FAA5A7FCE15D1DDCB9EAEAEA377667B8
```

By default, `merkle` returns the root of the merkle tree:

```bash
$ merkle a b c d e
114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9
```

But it can be asked for some level:

```bash
$ merkle a b c d e -l 0
114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9

$ merkle a b c d e -l 1
585DD1B0A3A55D9A36DE747EC37524D318E2EBEE
58E6B3A414A1E090DFC6029ADD0F3555CCBA127F
```

Or even all levels:

```bash
merkle a b c d e --all
114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9

585DD1B0A3A55D9A36DE747EC37524D318E2EBEE
58E6B3A414A1E090DFC6029ADD0F3555CCBA127F

F4D9EEA3797499E52CC2561F722F935F10365E40
734F7A56211B581395CB40129D307A0717538088
58E6B3A414A1E090DFC6029ADD0F3555CCBA127F

86F7E437FAA5A7FCE15D1DDCB9EAEAEA377667B8
E9D71F5EE7C92D6DC9E92FFDAD17B8BD49418F98
84A516841BA77A5B4648DE2CD0DFCB30EA46DBB4
3C363836CF4E16666669A25DA280A1865C2D2874
58E6B3A414A1E090DFC6029ADD0F3555CCBA127F
```

You can also change of hash algorithm:

```bash
$ merkle a b c d e -h md5
064705BD78652C090975702C9E02E229

$ merkle a b c d e -h clear
ABCDE
```

And just extract some computation statistics:

```bash
$ merkle a b c d e --count
4
=> Total number of levels

$ merkle a b c d e --nodes
6
=> Total number of nodes
```

Finally, you can ask for help:

```bash
$ merkle --help
Build a Merkle Tree and prints its values.
Usage: merkle [leaf...]

Options:
  --version    Prints version
  --help       Prints help
  -l, --level  Prints values of the given level. Defaults to 0 (root).
  -n, --nodes  Prints the number of nodes for the given leaves.
  -c, --count  Prints the number of levels for the given leaves.
  -h, --hash   Hash algorithm to apply on leaves. Values are 'sha1', 'md5' or 'none'.
  -a, --all    Prints all levels of Merkle tree, from leaves to root.
  --level                                                                              [default: 0]
  --hash                                                                               [default: "sha1"]
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
