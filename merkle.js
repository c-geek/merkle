
var crypto = require('crypto');
var through = require('through');

function Merkle (hashFunc) {

  var that = this;

  var resFunc = function () {
    return root();
  };

  that.leaves = [];
  that.treeDepth = 0;
  that.rows = [];
  that.nodesCount = 0;

  function feed(anyData) {
    if(anyData && anyData.match(/^[\w\d]{40}$/)){
      that.leaves.push(anyData.toUpperCase());
    }
    else{
      that.leaves.push(hashFunc(anyData).toUpperCase());
    }
    return that;
  };

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
  };

  function levels() {
    return depth() + 1;
  };

  function nodes() {
    return that.nodesCount;
  };

  function root() {
    return that.rows[0][0];
  };

  function level(i) {
    return that.rows[i];
  };

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
  };

  function getNodes(leaves) {
    var remainder = leaves.length % 2;
    var nodes = [];
    for (var i = 0; i < leaves.length - 1; i = i + 2) {
      nodes[i/2] = hashFunc(leaves[i] + leaves[i+1]).toUpperCase();
    }
    if(remainder === 1){
      nodes[((leaves.length-remainder)/2)] = leaves[leaves.length - 1];
    }
    return nodes;
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
        nodes: nodes()
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
        nodes: nodes
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
        nodes: nodes
      };
    };
    done(null, resFunc());
  };

  return stream;
}

module.exports = function (hashFuncName) {
  return new Merkle(function (input) {
    if (hashFuncName === 'none') {
      return input;
    } else {
      var hash = crypto.createHash(hashFuncName);
      return hash.update(input).digest('hex');
    }
  });
};
