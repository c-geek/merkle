var sha1  = require('sha1');
var md5   = require('MD5');
var async = require('async');

function Merkle(strings, hashFunc) {

  this.leaves = [];
  this.treeDepth = 0;
  this.rows = [];
  this.nodesCount = 0;

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

  this.depth = function () {
    // Compute tree depth
    if(!this.treeDepth){
      var pow = 0;
      while(Math.pow(2, pow) < this.leaves.length){
        pow++;
      }
      this.treeDepth = pow;
    }
    return this.treeDepth;
  };

  this.levels = function () {
    return this.depth() + 1;
  };

  this.nodes = function () {
    this.process();
    return this.nodesCount;
  };

  this.process = function() {
    var depth = this.depth();
    if(this.rows.length == 0){
      // Compute the nodes of each level
      for (var i = 0; i < depth; i++) {
        this.rows.push([]);
      }
      this.rows[depth] = this.leaves;
      for (var j = depth-1; j >= 0; j--) {
        this.rows[j] = getNodes(this.rows[j+1]);
        this.nodesCount += this.rows[j].length;
      }
    }
    return this;
  };

  this.root = function() {
    return this.rows[0][0];
  };

  this.level = function(i) {
    return this.rows[i];
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

module.exports = function (strings, hashFuncName) {
  var hashFunc;
  if(hashFuncName == 'sha1'){
    hashFunc = sha1;
  }
  if(hashFuncName == 'md5'){
    hashFunc = md5;
  }
  return new Merkle(strings, hashFunc || function (input) {
    return input;
  });
};