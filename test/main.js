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

describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'sha256')", function(){

  var root = null;

  before(function (done) {
    var m = merkle('sha256');
    m.pipe(es.mapSync(function (data) {
      root = data;
      done();
    }));
    
    abcde.forEach(function(c){
      m.write(c);
    });
    m.end();
  });

  it("should have root '16E6BEB3E080910740A2923D6091618CAA9968AEAD8A52D187D725D199548E2C'", function(){
    assert.equal(root, "16E6BEB3E080910740A2923D6091618CAA9968AEAD8A52D187D725D199548E2C");
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

  it("tree shouldn't be null", function(){
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


describe("merkle('sha512').async(['a', 'b', 'c', 'd', 'e'])", function(){

  var tree = merkle('sha512').sync(abcde);

  it("tree shoulnt be null", function(){
    should.exist(tree);
  });

  it("should have root '0F1DDB0F6F807FC6E00948C4DCD9035F83C2CD737F24BCEA278763DF60D90EFE4D7D126F42763A77FBDF520879B0D4A4699CD6AD36A839CF495E32AE35F8E5B7'", function(){
    assert.equal(tree.root(), "0F1DDB0F6F807FC6E00948C4DCD9035F83C2CD737F24BCEA278763DF60D90EFE4D7D126F42763A77FBDF520879B0D4A4699CD6AD36A839CF495E32AE35F8E5B7");
  });

  it('should have depth 3, levels 4, nodes 6', function(){
    assert.equal(tree.depth(), 3);
    assert.equal(tree.levels(), 4);
    assert.equal(tree.nodes(), 6);
  });
});


describe("merkle('ripemd160').async(['a', 'b', 'c', 'd', 'e'])", function(){

  var tree = merkle('ripemd160').sync(abcde);

  it("tree shoulnt be null", function(){
    should.exist(tree);
  });

  it("should have root 'A915A61779C0EB390447CE88A989041D625756C6'", function(){
    assert.equal(tree.root(), "A915A61779C0EB390447CE88A989041D625756C6");
  });

  it('should have depth 3, levels 4, nodes 6', function(){
    assert.equal(tree.depth(), 3);
    assert.equal(tree.levels(), 4);
    assert.equal(tree.nodes(), 6);
  });
});

describe("merkle('whirlpool').async(['a', 'b', 'c', 'd', 'e'])", function(){

  var tree = merkle('whirlpool').sync(abcde);

  it("tree shoulnt be null", function(){
    should.exist(tree);
  });

  it("should have root '57D1AB5281015F92DA7D3EAF740B643F5861565A03A4FC82126F21F69FD3C566FB0A1EA04F572E90FAE7C7AF4984CAE146DBA4618F4D1463A746822D4E21E5EB", function(){
    assert.equal(tree.root(), "57D1AB5281015F92DA7D3EAF740B643F5861565A03A4FC82126F21F69FD3C566FB0A1EA04F572E90FAE7C7AF4984CAE146DBA4618F4D1463A746822D4E21E5EB");
  });

  it('should have depth 3, levels 4, nodes 6', function(){
    assert.equal(tree.depth(), 3);
    assert.equal(tree.levels(), 4);
    assert.equal(tree.nodes(), 6);
  });
});