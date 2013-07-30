var sha1  = require('sha1');
var md5   = require('MD5');
var async = require('async');

function Merkle(strings, hashFunc) {

  this.leaves = [];
  this.depth = 0;
  this.levels = [];
  this.nodes = 0;

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
    return this.depth + 1;
  };

  this.countNodes = function () {
    this.process();
    return this.nodes;
  };

  this.process = function() {
    var depth = this.countLevels() - 1;
    if(this.levels.length == 0){
      // Compute the nodes of each level
      for (var i = 0; i < depth; i++) {
        this.levels.push([]);
      }
      this.levels[depth] = this.leaves;
      for (var j = depth-1; j >= 0; j--) {
        this.levels[j] = getNodes(this.levels[j+1]);
        this.nodes += this.levels[j].length;
      }
    }
    return this;
  };

  this.getRoot = function() {
    return this.levels[0][0];
  };

  this.getLevel = function(i) {
    return this.levels[i];
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