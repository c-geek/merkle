
var crypto = require('crypto');
var through = require('through');

var REGEXP = {
  'md5':       "^[0-9a-f]{32}$",
  'sha1':      "^[0-9a-f]{40}$",
  'ripemd160': "^[0-9a-f]{40}$",
  'sha256':    "^[0-9a-f]{64}$",
  'sha512':    "^[0-9a-f]{128}$",
  'whirlpool': "^[0-9a-f]{128}$",
  'DEFAULT':   "^$"
};

function Merkle (hashFunc, hashFuncName, useUpperCaseForHash) {

  var that = this;

  var resFunc = function () {
    return root();
  };

  var regexpStr = REGEXP[hashFuncName] || REGEXP.DEFAULT;
  if (useUpperCaseForHash) {
    // Use only capital letters if upper case is enabled
    regexpStr = regexpStr.replace('a', 'A').replace('f', 'F');
  }
  that.hashResultRegexp = new RegExp(regexpStr);
  that.leaves = [];
  that.treeDepth = 0;
  that.rows = [];
  that.nodesCount = 0;

  function feed(anyData) {
    var data = String(anyData);
    if(data && data.match(that.hashResultRegexp)){
      // Push leaf without hashing it since it is already a hash
      that.leaves.push(data);
    }
    else{
      var hash = hashFunc(data);
      if (useUpperCaseForHash) {
        hash = hash.toUpperCase();
      }
      that.leaves.push(hash);
    }
    return that;
  }

  function depth() {
    // Compute tree depth
    if(!that.treeDepth){
      var pow = 0;
      while(Math.pow(2, pow) < that.leaves.length){
        pow++;
      }
      that.treeDepth = pow;
    }
    return that.treeDepth;
  }

  function levels() {
    return depth() + 1;
  }

  function nodes() {
    return that.nodesCount;
  }

  function root() {
    return that.rows[0][0];
  }

  function level(i) {
    return that.rows[i];
  }

  function compute() {
    var theDepth = depth();
    if(that.rows.length == 0){
      // Compute the nodes of each level
      for (var i = 0; i < theDepth; i++) {
        that.rows.push([]);
      }
      that.rows[theDepth] = that.leaves;
      for (var j = theDepth-1; j >= 0; j--) {
        that.rows[j] = getNodes(that.rows[j+1]);
        that.nodesCount += that.rows[j].length;
      }
    }
  }

  function getNodes(leaves) {
    var remainder = leaves.length % 2;
    var nodes = [];
    var hash;
    for (var i = 0; i < leaves.length - 1; i = i + 2) {
      hash = hashFunc(leaves[i] + leaves[i+1]);
      if (useUpperCaseForHash) {
        hash = hash.toUpperCase();
      }
      nodes[i/2] = hash;
    }
    if(remainder === 1){
      nodes[((leaves.length-remainder)/2)] = leaves[leaves.length - 1];
    }
    return nodes;
  }
  
  function getProofPath(index, excludeParent) {
    var proofPath = [];

    for (var currentLevel = depth(); currentLevel > 0; currentLevel--) {
      var currentLevelNodes = level(currentLevel);
      var currentLevelCount = currentLevelNodes.length;

      // if this is an odd end node to be promoted up, skip to avoid proofs with null values
      if (index == currentLevelCount - 1 && currentLevelCount % 2 == 1) {
        index = Math.floor(index / 2);
        continue;
      }

      var nodes = {};
      if (index % 2) { // the index is the right node
        nodes.left = currentLevelNodes[index - 1];
        nodes.right = currentLevelNodes[index];
      } else {
        nodes.left = currentLevelNodes[index];
        nodes.right = currentLevelNodes[index + 1];
      }

      index = Math.floor(index / 2); // set index to the parent index
      if (!excludeParent) {
        proofPath.push({
          parent: level(currentLevel - 1)[index],
          left: nodes.left,
          right: nodes.right
        });
      } else {
        proofPath.push({
          left: nodes.left,
          right: nodes.right
        });
      }

    }
    return proofPath;
  }

  // PUBLIC

  /**
  * Return the stream, with resulting stream begin root hash string.
  **/
  var stream = through(
    function write (data) {
      feed('' + data);
    },
    function end () {
      compute();
      this.emit('data', resFunc());
      this.emit('end');
    });

  /**
  * Return the stream, but resulting stream will be json.
  **/
  stream.json = function () {
    resFunc = function() {
      return {
        root: root(),
        level: level(),
        depth: depth(),
        levels: levels(),
        nodes: nodes(),
        getProofPath: getProofPath
      };
    };
    return this;
  };

  /**
  * Computes merkle tree synchronously, returning json result.
  **/
  stream.sync = function (leaves) {
    leaves.forEach(function(leaf){
      feed(leaf);
    });
    compute();
    resFunc = function() {
      return {
        root: root,
        level: level,
        depth: depth,
        levels: levels,
        nodes: nodes,
        getProofPath: getProofPath
      };
    };
    return resFunc();
  };

  /**
  * Computes merkle tree asynchronously, returning json as callback result.
  **/
  stream.async = function (leaves, done) {
    leaves.forEach(function(leaf){
      feed(leaf);
    });
    compute();
    resFunc = function() {
      return {
        root: root,
        level: level,
        depth: depth,
        levels: levels,
        nodes: nodes,
        getProofPath: getProofPath
      };
    };
    done(null, resFunc());
  };

  return stream;
}

module.exports = function (hashFuncName, useUpperCaseForHash) {
  return new Merkle(function (input) {
    if (hashFuncName === 'none') {
      return input;
    } else {
      var hash = crypto.createHash(hashFuncName);
      return hash.update(input).digest('hex');
    }
  }, hashFuncName,

  // Use upper case y default
  useUpperCaseForHash !== false);
};
