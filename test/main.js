var should = require('should');
var assert = require('assert');
var fs     = require('fs');
var async  = require('async');
var merkle = require('../merkle');
var es     = require('event-stream');

var abcde = ['a', 'b', 'c', 'd', 'e'];

describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'sha1')", function(){

  var root = null;

  before(function (done) {
    var m = merkle('sha1');
    m.pipe(es.mapSync(function (data) {
      root = data;
      done();
    }));
    
    abcde.forEach(function(c){
      m.write(c);
    });
    m.end();
  });

  it("should have root '114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9'", function(){
    assert.equal(root, "114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9");
  });
});

describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'md5')", function(){

  var root = null;

  before(function (done) {
    var m = merkle('md5');
    m.pipe(es.mapSync(function (data) {
      root = data;
      done();
    }));
    
    abcde.forEach(function(c){
      m.write(c);
    });
    m.end();
  });

  it("should have root '064705BD78652C090975702C9E02E229'", function(){
    assert.equal(root, "064705BD78652C090975702C9E02E229");
  });
});

describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'none')", function(){

  var root = null;

  before(function (done) {
    var m = merkle('none');
    m.pipe(es.mapSync(function (data) {
      root = data;
      done();
    }));
    
    abcde.forEach(function(c){
      m.write(c);
    });
    m.end();
  });

  it("should have root 'ABCDE'", function(){
    assert.equal(root, "ABCDE");
  });
});

describe("merkle stream.json() ['a', 'b', 'c', 'd', 'e'] with 'sha1')", function(){

  var tree = null;

  before(function (done) {
    var m = merkle('sha1').json();
    m.pipe(es.mapSync(function (data) {
      tree = data;
      done();
    }));
    
    abcde.forEach(function(c){
      m.write(c);
    });
    m.end();
  });

  it("tree shoulnt be null", function(){
    should.exist(tree);
  });

  it("should have root '114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9'", function(){
    assert.equal(tree.root, "114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9");
  });

  it('should have depth 3, levels 4, nodes 6', function(){
    assert.equal(tree.depth, 3);
    assert.equal(tree.levels, 4);
    assert.equal(tree.nodes, 6);
  });
});

describe("merkle('md5').sync(['a', 'b', 'c', 'd', 'e'])", function(){

  var tree = merkle('md5').sync(abcde);

  it("tree shoulnt be null", function(){
    should.exist(tree);
  });

  it("should have root '064705BD78652C090975702C9E02E229'", function(){
    assert.equal(tree.root(), "064705BD78652C090975702C9E02E229");
  });

  it('should have depth 3, levels 4, nodes 6', function(){
    assert.equal(tree.depth(), 3);
    assert.equal(tree.levels(), 4);
    assert.equal(tree.nodes(), 6);
  });
});

describe("merkle('none').async(['a', 'b', 'c', 'd', 'e'])", function(){

  var tree = null;

  before(function (done) {
    var m = merkle('none').async(abcde, function (err, json) {
      tree = json;
      done();
    });
  });

  it("tree shoulnt be null", function(){
    should.exist(tree);
  });

  it("should have root 'ABCDE'", function(){
    assert.equal(tree.root(), "ABCDE");
  });

  it('should have depth 3, levels 4, nodes 6', function(){
    assert.equal(tree.depth(), 3);
    assert.equal(tree.levels(), 4);
    assert.equal(tree.nodes(), 6);
  });
});
