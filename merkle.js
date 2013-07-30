var sha1 = require('sha1');
var async = require('async');

function Merkle(strings, hashFunc) {

  this.leaves = [];
  this.depth = 0;
  this.levels = [];

  // PUBLIC
  this.feed = function(anyData) {
    if(anyData && anyData.match(/^[\w\d]{40}$/)){
      this.leaves.push(anyData.toUpperCase());
    }
    else{
      this.leaves.push(hashFunc(anyData).toUpperCase());
    }
    return this;
  };

  this.countLevels = function () {
    // Compute tree depth
    if(!this.depth){
      var pow = 0;
      while(Math.pow(2, pow) < this.leaves.length){
        pow++;
      }
      this.depth = pow;
    }
    return this.depth;
  };

  this.countNodes = function () {
    // Compute tree depth
    if(!this.depth){
      var pow = 0;
      while(Math.pow(2, pow) < this.leaves.length){
        pow++;
      }
      this.depth = pow;
    }
    return this.depth;
  };

  this.process = function() {
    var depth = this.countLevels();
    if(this.levels.length < depth){
      // Compute the nodes of each level
      for (var i = 0; i < depth; i++) {
        this.levels.push([]);
      }
      this.levels[depth] = this.leaves;
      for (var j = depth-1; j >= 0; j--) {
        this.levels[j] = getNodes(this.levels[j+1]);
      }
    }
    return this.getRoot();
  };

  this.getRoot = function() {
    return this.levels[0][0];
  };

  // PRIVATE
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

  // INIT
  for (var i = 0; i < strings.length; i++) {
    this.feed(new String(strings[i]));
  }
}

module.exports = function (strings, hashFunc) {
  return new Merkle(strings, hashFunc || sha1);
};