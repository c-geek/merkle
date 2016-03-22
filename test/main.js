var should = require('should');
var assert = require('assert');
var fs = require('fs');
var async = require('async');
var merkle = require('../merkle');
var es = require('event-stream');

//data available for tests
var abc = ['a', 'b', 'c'];
var abcEmpty = ['a', 'b', 'c', ''];
var abcc = ['a', 'b', 'c', 'c'];
var abcde = ['a', 'b', 'c', 'd', 'e'];

// tree generation tests
describe('Merkle Tree Generation Tests', function() {

  describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'sha1')", function() {

    var root = null;

    before(function(done) {
      var m = merkle('sha1');
      m.pipe(es.mapSync(function(data) {
        root = data;
        done();
      }));

      abcde.forEach(function(c) {
        m.write(c);
      });
      m.end();
    });

    it("should have root '114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9'", function() {
      assert.equal(root, "114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9");
    });
  });

  describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'sha256')", function() {

    var root = null;

    before(function(done) {
      var m = merkle('sha256');
      m.pipe(es.mapSync(function(data) {
        root = data;
        done();
      }));

      abcde.forEach(function(c) {
        m.write(c);
      });
      m.end();
    });

    it("should have root '16E6BEB3E080910740A2923D6091618CAA9968AEAD8A52D187D725D199548E2C'", function() {
      assert.equal(root, "16E6BEB3E080910740A2923D6091618CAA9968AEAD8A52D187D725D199548E2C");
    });
  });

  describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'md5')", function() {

    var root = null;

    before(function(done) {
      var m = merkle('md5');
      m.pipe(es.mapSync(function(data) {
        root = data;
        done();
      }));

      abcde.forEach(function(c) {
        m.write(c);
      });
      m.end();
    });

    it("should have root '064705BD78652C090975702C9E02E229'", function() {
      assert.equal(root, "064705BD78652C090975702C9E02E229");
    });
  });

  describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'none')", function() {

    var root = null;

    before(function(done) {
      var m = merkle('none');
      m.pipe(es.mapSync(function(data) {
        root = data;
        done();
      }));

      abcde.forEach(function(c) {
        m.write(c);
      });
      m.end();
    });

    it("should have root 'ABCDE'", function() {
      assert.equal(root, "ABCDE");
    });
  });

  describe("merkle stream.json() ['a', 'b', 'c', 'd', 'e'] with 'sha1')", function() {

    var tree = null;

    before(function(done) {
      var m = merkle('sha1').json();
      m.pipe(es.mapSync(function(data) {
        tree = data;
        done();
      }));

      abcde.forEach(function(c) {
        m.write(c);
      });
      m.end();
    });

    it("tree shoulnt be null", function() {
      should.exist(tree);
    });

    it("should have root '114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9'", function() {
      assert.equal(tree.root, "114B6E61CB5BB93D862CA3C1DFA8B99E313E66E9");
    });

    it('should have depth 3, levels 4, nodes 6', function() {
      assert.equal(tree.depth, 3);
      assert.equal(tree.levels, 4);
      assert.equal(tree.nodes, 6);
    });
  });

  describe("merkle('md5').sync(['a', 'b', 'c', 'd', 'e'])", function() {

    var tree = merkle('md5').sync(abcde);

    it("tree shoulnt be null", function() {
      should.exist(tree);
    });

    it("should have root '064705BD78652C090975702C9E02E229'", function() {
      assert.equal(tree.root(), "064705BD78652C090975702C9E02E229");
    });

    it('should have depth 3, levels 4, nodes 6', function() {
      assert.equal(tree.depth(), 3);
      assert.equal(tree.levels(), 4);
      assert.equal(tree.nodes(), 6);
    });
  });

  describe("merkle('none').async(['a', 'b', 'c', 'd', 'e'])", function() {

    var tree = null;

    before(function(done) {
      var m = merkle('none').async(abcde, function(err, json) {
        tree = json;
        done();
      });
    });

    it("tree shouldn't be null", function() {
      should.exist(tree);
    });

    it("should have root 'ABCDE'", function() {
      assert.equal(tree.root(), "ABCDE");
    });

    it('should have depth 3, levels 4, nodes 6', function() {
      assert.equal(tree.depth(), 3);
      assert.equal(tree.levels(), 4);
      assert.equal(tree.nodes(), 6);
    });
  });

  describe("merkle('sha512').async(['a', 'b', 'c', 'd', 'e'])", function() {

    var tree = merkle('sha512').sync(abcde);

    it("tree shoulnt be null", function() {
      should.exist(tree);
    });

    it("should have root '0F1DDB0F6F807FC6E00948C4DCD9035F83C2CD737F24BCEA278763DF60D90EFE4D7D126F42763A77FBDF520879B0D4A4699CD6AD36A839CF495E32AE35F8E5B7'", function() {
      assert.equal(tree.root(), "0F1DDB0F6F807FC6E00948C4DCD9035F83C2CD737F24BCEA278763DF60D90EFE4D7D126F42763A77FBDF520879B0D4A4699CD6AD36A839CF495E32AE35F8E5B7");
    });

    it('should have depth 3, levels 4, nodes 6', function() {
      assert.equal(tree.depth(), 3);
      assert.equal(tree.levels(), 4);
      assert.equal(tree.nodes(), 6);
    });
  });

  describe("merkle('ripemd160').async(['a', 'b', 'c', 'd', 'e'])", function() {

    var tree = merkle('ripemd160').sync(abcde);

    it("tree shoulnt be null", function() {
      should.exist(tree);
    });

    it("should have root 'A915A61779C0EB390447CE88A989041D625756C6'", function() {
      assert.equal(tree.root(), "A915A61779C0EB390447CE88A989041D625756C6");
    });

    it('should have depth 3, levels 4, nodes 6', function() {
      assert.equal(tree.depth(), 3);
      assert.equal(tree.levels(), 4);
      assert.equal(tree.nodes(), 6);
    });
  });

  describe("merkle('whirlpool').async(['a', 'b', 'c', 'd', 'e'])", function() {

    var tree = merkle('whirlpool').sync(abcde);

    it("tree shoulnt be null", function() {
      should.exist(tree);
    });

    it("should have root '57D1AB5281015F92DA7D3EAF740B643F5861565A03A4FC82126F21F69FD3C566FB0A1EA04F572E90FAE7C7AF4984CAE146DBA4618F4D1463A746822D4E21E5EB", function() {
      assert.equal(tree.root(), "57D1AB5281015F92DA7D3EAF740B643F5861565A03A4FC82126F21F69FD3C566FB0A1EA04F572E90FAE7C7AF4984CAE146DBA4618F4D1463A746822D4E21E5EB");
    });

    it('should have depth 3, levels 4, nodes 6', function() {
      assert.equal(tree.depth(), 3);
      assert.equal(tree.levels(), 4);
      assert.equal(tree.nodes(), 6);
    });
  });

  // tests for merkle tree construction vulnerbility https://bitcointalk.org/?topic=102395
  describe("test vulnerbility of redundant leaves in tree construction using ['a', 'b', 'c'] vs ['a', 'b', 'c', 'c']", function() {

    var treeAbc = merkle('sha256').sync(abc);
    var treeAbcc = merkle('sha256').sync(abcc);

    it("tree shoulnt be null", function() {
      should.exist(treeAbc);
      should.exist(treeAbcc);
    });

    it("should assert non equality in merkle tree roots of ['a', 'b', 'c'] vs ['a', 'b', 'c', 'c']", function() {
      assert.notEqual(treeAbc.root(), treeAbcc.root());
    });

  });

  // tests for merkle tree construction vulnerbility https://github.com/chainpoint/chainpoint/issues/8
  describe("test vulnerbility of redundant leaves in tree construction using ['a', 'b', 'c'] vs ['a', 'b', 'c', '' ]", function() {

    var treeAbc = merkle('sha256').sync(abc);
    var treeAbcEmpty = merkle('sha256').sync(abcEmpty);


    it("tree shoulnt be null", function() {
      should.exist(treeAbc);
      should.exist(treeAbcEmpty);
    });

    it("should assert non equality in merkle tree roots of ['a', 'b', 'c'] vs ['a', 'b', 'c', '' ]", function() {
      assert.notEqual(treeAbc.root(), treeAbcEmpty.root());
    });

  });

  describe("test already hashed leaves", function() {

    describe("md5", function() {

      var tree = merkle('md5').sync(['064705BD78652C090975702C9E02E229']);

      it("should have root '064705BD78652C090975702C9E02E229'", function() {
        assert.equal(tree.root(), "064705BD78652C090975702C9E02E229");
      });
    });

    describe("sha1", function() {

      var tree = merkle('sha1').sync(['EFFDB5F96A28ACD2EB19DCB15D8F43AF762BD0AE']);

      it("should have root 'EFFDB5F96A28ACD2EB19DCB15D8F43AF762BD0AE'", function() {
        assert.equal(tree.root(), "EFFDB5F96A28ACD2EB19DCB15D8F43AF762BD0AE");
      });
    });

    describe("sha256", function() {

      var tree = merkle('sha256').sync(['24D166CD6C8B826C779040B49D5B6708D649B236558E8744339DFEE6AFE11999']);

      it("should have root '24D166CD6C8B826C779040B49D5B6708D649B236558E8744339DFEE6AFE11999'", function() {
        assert.equal(tree.root(), "24D166CD6C8B826C779040B49D5B6708D649B236558E8744339DFEE6AFE11999");
      });
    });

    describe("sha512", function() {

      var tree = merkle('sha512').sync(['DDEA8EEE5CB0D9F74B29866E3F4558BB2EAF75298D84B04BD074B2ABD103246C1FB0703A118F847F21B975A49FE18E3D284BCAF9728F20D99EB31A4F5468CA3C']);

      it("should have root 'DDEA8EEE5CB0D9F74B29866E3F4558BB2EAF75298D84B04BD074B2ABD103246C1FB0703A118F847F21B975A49FE18E3D284BCAF9728F20D99EB31A4F5468CA3C'", function() {
        assert.equal(tree.root(), "DDEA8EEE5CB0D9F74B29866E3F4558BB2EAF75298D84B04BD074B2ABD103246C1FB0703A118F847F21B975A49FE18E3D284BCAF9728F20D99EB31A4F5468CA3C");
      });
    });

    describe("ripemd160", function() {

      var tree = merkle('ripemd160').sync(['7A96FE067027216ECEFBDE8163A3E4BCDAA365FE']);

      it("should have root '7A96FE067027216ECEFBDE8163A3E4BCDAA365FE'", function() {
        assert.equal(tree.root(), "7A96FE067027216ECEFBDE8163A3E4BCDAA365FE");
      });
    });

    describe("whirlpool", function() {

      var tree = merkle('whirlpool').sync(['AF85293F325AC3048B93E3170DFF700DB760D988D87317E31C546C2A1DEE5C23EC4F169C8783B34B1F9653707918AF654A9CD5F86CE059770EA8595B22716D73']);

      it("should have root 'AF85293F325AC3048B93E3170DFF700DB760D988D87317E31C546C2A1DEE5C23EC4F169C8783B34B1F9653707918AF654A9CD5F86CE059770EA8595B22716D73'", function() {
        assert.equal(tree.root(), "AF85293F325AC3048B93E3170DFF700DB760D988D87317E31C546C2A1DEE5C23EC4F169C8783B34B1F9653707918AF654A9CD5F86CE059770EA8595B22716D73");
      });
    });
  });

  describe('using lowercase', function() {

    var USE_LOWERCASE = false; // This is a constant, false value is coherent with the name

    describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'md5')", function() {

      var root = null;

      before(function(done) {
        var m = merkle('md5', USE_LOWERCASE);
        m.pipe(es.mapSync(function(data) {
          root = data;
          done();
        }));

        abcde.forEach(function(c) {
          m.write(c);
        });
        m.end();
      });

      it("should have root '14bb879020adb0cd3bf3935576f58f25'", function() {
        assert.equal(root, "14bb879020adb0cd3bf3935576f58f25");
      });
    });

    describe("merkle stream ['a', 'b', 'c', 'd', 'e'] with 'none')", function() {

      var root = null;

      before(function(done) {
        var m = merkle('none', USE_LOWERCASE);
        m.pipe(es.mapSync(function(data) {
          root = data;
          done();
        }));

        abcde.forEach(function(c) {
          m.write(c);
        });
        m.end();
      });

      it("should have root 'abcde'", function() {
        assert.equal(root, "abcde");
      });
    });
  });
});

// sample data for testing proof paths
var hashSetSingle = ['a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb'];
var hashSetDouble = [
    'a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb',
    'cb4990b9a8936bbc137ddeb6dcab4620897b099a450ecdc5f3e86ef4b3a7135c'
];
var hasSetOddCount = [
    'a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb',
    'cb4990b9a8936bbc137ddeb6dcab4620897b099a450ecdc5f3e86ef4b3a7135c',
    '0c89aa54d16595191ebe5cf5488e2564c42377349c06fe060819f479b467679c',
    'b807b3f529f2bd455f68eec22c89ec8f66dc6cb17a08fa66aefed7ef69d52673',
    '8fc93ed7799f2b6612a0e1052fc6eae1d226841b82d585a5619024ac1fae0c35'
];
var hasSetOddMidCount = [
    'db7a71d5d6c38fa35b9f8a4cc87aa2f63cae88a4d02d999a33064826059ce540',
    '5f0a23e021df3edda32cbea4f69f4a2a57461f8c5ce5790c31d269ad80b07916',
    '67a197d14655f77415d5b25d7414df05fede134f96c57f3c1db065eedd06742e',
    '7a0af2b00512752cf2701ef30cd9fdcda9ecc66a836a32b79938db5055a457a0',
    '06072b3d9c7d2060ba861c9e51f0fde5c02bf8dbcfceb02388bb2b8000a7df4a',
    '9468c347a37612ce437060da960d7c709fcae332c0e05d5158c442a8fff361f8'
];
// proof path tests
describe('Proof Path Tests', function() {
  
  describe("merkle('sha256', false).sync(hashSetSingle)", function(){

    var tree = merkle('sha256', false).sync(hashSetSingle); 
    
    it("tree shoulnt be null", function(){
      should.exist(tree);
    });

    it("should have root 'a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb'", function(){
      assert.equal(tree.root(), "a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb");
    });
    it('tree.getProofPath(0) should equal []', function(){
      assert.deepEqual(tree.getProofPath(0), []);
    });
  });

  describe("merkle('sha256', false).sync(hashSetDouble)", function(){

    var tree = merkle('sha256', false).sync(hashSetDouble);

    it("tree shoulnt be null", function(){
      should.exist(tree);
    });

    it("should have root '88088c32c6b757931e1f71c65758467bf56251efe7a195dbe5ccf0aedbae688f'", function(){
      assert.equal(tree.root(), "88088c32c6b757931e1f71c65758467bf56251efe7a195dbe5ccf0aedbae688f");
    });

    it('tree.getProofPath(0) should be correct', function(){
      assert.deepEqual(tree.getProofPath(0), [{ 
          parent: '88088c32c6b757931e1f71c65758467bf56251efe7a195dbe5ccf0aedbae688f',
          left: 'a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb',
          right: 'cb4990b9a8936bbc137ddeb6dcab4620897b099a450ecdc5f3e86ef4b3a7135c'
      }]);
    });

    it('tree.getProofPath(1) should be correct', function(){
      assert.deepEqual(tree.getProofPath(1), [{ 
          parent: '88088c32c6b757931e1f71c65758467bf56251efe7a195dbe5ccf0aedbae688f',
          left: 'a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb',
          right: 'cb4990b9a8936bbc137ddeb6dcab4620897b099a450ecdc5f3e86ef4b3a7135c'
      }]);
    });

    it('tree.getProofPath(1, true) should be correct', function(){
      assert.deepEqual(tree.getProofPath(1, true), [{ 
          left: 'a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb',
          right: 'cb4990b9a8936bbc137ddeb6dcab4620897b099a450ecdc5f3e86ef4b3a7135c'
      }]);
    });
  });

  describe("merkle('sha256', false).sync(hasSetOddCount)", function(){

    var tree = merkle('sha256', false).sync(hasSetOddCount);

    it("tree shoulnt be null", function(){
      should.exist(tree);
    });

    it("should have root 'a04802183231deeb59ae217141fb89d82ebefb4404bfa96bce00018868bf7468'", function(){
      assert.equal(tree.root(), "a04802183231deeb59ae217141fb89d82ebefb4404bfa96bce00018868bf7468");
    });

    it('tree.getProofPath(0) should be correct', function(){
      assert.deepEqual(tree.getProofPath(0), [ { parent: '88088c32c6b757931e1f71c65758467bf56251efe7a195dbe5ccf0aedbae688f',
      left: 'a292780cc748697cb499fdcc8cb89d835609f11e502281dfe3f6690b1cc23dcb',
      right: 'cb4990b9a8936bbc137ddeb6dcab4620897b099a450ecdc5f3e86ef4b3a7135c' },
    { parent: 'f82b283ae28f711d285ccb50f0044c526a584d27c8ec24875f3a85d5827d3b42',
      left: '88088c32c6b757931e1f71c65758467bf56251efe7a195dbe5ccf0aedbae688f',
      right: 'e3a9b11179e54f48f4acca3742eb45adc8293dfb640ffd8b4e5e4fa8c25e2df1' },
    { parent: 'a04802183231deeb59ae217141fb89d82ebefb4404bfa96bce00018868bf7468',
      left: 'f82b283ae28f711d285ccb50f0044c526a584d27c8ec24875f3a85d5827d3b42',
      right: '8fc93ed7799f2b6612a0e1052fc6eae1d226841b82d585a5619024ac1fae0c35' } ]);
    });

    it('tree.getProofPath(2) should be correct', function(){
      assert.deepEqual(tree.getProofPath(2), [ { parent: 'e3a9b11179e54f48f4acca3742eb45adc8293dfb640ffd8b4e5e4fa8c25e2df1',
      left: '0c89aa54d16595191ebe5cf5488e2564c42377349c06fe060819f479b467679c',
      right: 'b807b3f529f2bd455f68eec22c89ec8f66dc6cb17a08fa66aefed7ef69d52673' },
    { parent: 'f82b283ae28f711d285ccb50f0044c526a584d27c8ec24875f3a85d5827d3b42',
      left: '88088c32c6b757931e1f71c65758467bf56251efe7a195dbe5ccf0aedbae688f',
      right: 'e3a9b11179e54f48f4acca3742eb45adc8293dfb640ffd8b4e5e4fa8c25e2df1' },
    { parent: 'a04802183231deeb59ae217141fb89d82ebefb4404bfa96bce00018868bf7468',
      left: 'f82b283ae28f711d285ccb50f0044c526a584d27c8ec24875f3a85d5827d3b42',
      right: '8fc93ed7799f2b6612a0e1052fc6eae1d226841b82d585a5619024ac1fae0c35' } ]);
    });

    it('tree.getProofPath(4) should be correct', function(){
      assert.deepEqual(tree.getProofPath(4), [ { parent: 'a04802183231deeb59ae217141fb89d82ebefb4404bfa96bce00018868bf7468',
      left: 'f82b283ae28f711d285ccb50f0044c526a584d27c8ec24875f3a85d5827d3b42',
      right: '8fc93ed7799f2b6612a0e1052fc6eae1d226841b82d585a5619024ac1fae0c35' } ]);
    });

    it('tree.getProofPath(2, true) should be correct', function(){
      assert.deepEqual(tree.getProofPath(2, true), [ { 
      left: '0c89aa54d16595191ebe5cf5488e2564c42377349c06fe060819f479b467679c',
      right: 'b807b3f529f2bd455f68eec22c89ec8f66dc6cb17a08fa66aefed7ef69d52673' },
    { left: '88088c32c6b757931e1f71c65758467bf56251efe7a195dbe5ccf0aedbae688f',
      right: 'e3a9b11179e54f48f4acca3742eb45adc8293dfb640ffd8b4e5e4fa8c25e2df1' },
    { 
      left: 'f82b283ae28f711d285ccb50f0044c526a584d27c8ec24875f3a85d5827d3b42',
      right: '8fc93ed7799f2b6612a0e1052fc6eae1d226841b82d585a5619024ac1fae0c35' } ]);
    });
  });

  describe("merkle('sha256', false).sync(hasSetOddMidCount)", function(){

    var tree = merkle('sha256', false).sync(hasSetOddMidCount);

    it("tree shoulnt be null", function(){
      should.exist(tree);
    });

    it("should have root '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e'", function(){
      assert.equal(tree.root(), "99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e");
    });

    it('tree.getProofPath(0) should be correct', function(){
      assert.deepEqual(tree.getProofPath(0), [ { parent: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
      left: 'db7a71d5d6c38fa35b9f8a4cc87aa2f63cae88a4d02d999a33064826059ce540',
      right: '5f0a23e021df3edda32cbea4f69f4a2a57461f8c5ce5790c31d269ad80b07916' },
    { parent: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      left: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
      right: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59' },
    { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
      left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
    });

    it('tree.getProofPath(2) should be correct', function(){
      assert.deepEqual(tree.getProofPath(2), [ { parent: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59',
      left: '67a197d14655f77415d5b25d7414df05fede134f96c57f3c1db065eedd06742e',
      right: '7a0af2b00512752cf2701ef30cd9fdcda9ecc66a836a32b79938db5055a457a0' },
    { parent: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      left: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
      right: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59' },
    { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
      left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
    });

    it('tree.getProofPath(5) should be correct', function(){
      assert.deepEqual(tree.getProofPath(5), [ { parent: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05',
      left: '06072b3d9c7d2060ba861c9e51f0fde5c02bf8dbcfceb02388bb2b8000a7df4a',
      right: '9468c347a37612ce437060da960d7c709fcae332c0e05d5158c442a8fff361f8' },
    { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
      left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
    });

    it('tree.getProofPath(5, true) should be correct', function(){
      assert.deepEqual(tree.getProofPath(5, true), [ { 
      left: '06072b3d9c7d2060ba861c9e51f0fde5c02bf8dbcfceb02388bb2b8000a7df4a',
      right: '9468c347a37612ce437060da960d7c709fcae332c0e05d5158c442a8fff361f8' },
    { 
      left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
    });
  });
  
  describe("merkle('sha256', false).async(hasSetOddMidCount, function(err, tree){ ...", function(){

    merkle('sha256', false).async(hasSetOddMidCount, function(err, tree){
      
      it("tree shoulnt be null", function(){
        should.exist(tree);
      });

      it("should have root '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e'", function(){
        assert.equal(tree.root(), "99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e");
      });

      it('tree.getProofPath(0) should be correct', function(){
        assert.deepEqual(tree.getProofPath(0), [ { parent: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
        left: 'db7a71d5d6c38fa35b9f8a4cc87aa2f63cae88a4d02d999a33064826059ce540',
        right: '5f0a23e021df3edda32cbea4f69f4a2a57461f8c5ce5790c31d269ad80b07916' },
      { parent: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
        left: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
        right: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59' },
      { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
        left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
        right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
      });

      it('tree.getProofPath(2) should be correct', function(){
        assert.deepEqual(tree.getProofPath(2), [ { parent: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59',
        left: '67a197d14655f77415d5b25d7414df05fede134f96c57f3c1db065eedd06742e',
        right: '7a0af2b00512752cf2701ef30cd9fdcda9ecc66a836a32b79938db5055a457a0' },
      { parent: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
        left: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
        right: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59' },
      { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
        left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
        right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
      });

      it('tree.getProofPath(5) should be correct', function(){
        assert.deepEqual(tree.getProofPath(5), [ { parent: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05',
        left: '06072b3d9c7d2060ba861c9e51f0fde5c02bf8dbcfceb02388bb2b8000a7df4a',
        right: '9468c347a37612ce437060da960d7c709fcae332c0e05d5158c442a8fff361f8' },
      { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
        left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
        right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
      });

      it('tree.getProofPath(5, true) should be correct', function(){
        assert.deepEqual(tree.getProofPath(5, true), [ { 
        left: '06072b3d9c7d2060ba861c9e51f0fde5c02bf8dbcfceb02388bb2b8000a7df4a',
        right: '9468c347a37612ce437060da960d7c709fcae332c0e05d5158c442a8fff361f8' },
      { 
        left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
        right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
      });
    });
  });
  
  describe("merkle('sha256', false).json() with hasSetOddMidCount data", function(){

    var tree = null;

    before(function(done) {
      var m = merkle('sha256', false).json();
      m.pipe(es.mapSync(function(data) {
        tree = data;
        done();
      }));

      hasSetOddMidCount.forEach(function(hash) {
        m.write(hash);
      });
      m.end();
    });
    
    it("tree shoulnt be null", function(){
      should.exist(tree);
    });

    it("should have root '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e'", function(){
      assert.equal(tree.root, "99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e");
    });

    it('tree.getProofPath(0) should be correct', function(){
      assert.deepEqual(tree.getProofPath(0), [ { parent: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
      left: 'db7a71d5d6c38fa35b9f8a4cc87aa2f63cae88a4d02d999a33064826059ce540',
      right: '5f0a23e021df3edda32cbea4f69f4a2a57461f8c5ce5790c31d269ad80b07916' },
    { parent: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      left: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
      right: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59' },
    { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
      left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
    });

    it('tree.getProofPath(2) should be correct', function(){
      assert.deepEqual(tree.getProofPath(2), [ { parent: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59',
      left: '67a197d14655f77415d5b25d7414df05fede134f96c57f3c1db065eedd06742e',
      right: '7a0af2b00512752cf2701ef30cd9fdcda9ecc66a836a32b79938db5055a457a0' },
    { parent: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      left: '9ec566c50ee2ca47638d319b2d87cf0f81d8768f6fb10251b4dec7dd76fad0af',
      right: '6aa144c077a4b20360bf751f6f7b4b6ec11e87e66ca6d3718d7a7f332bf43d59' },
    { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
      left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
    });

    it('tree.getProofPath(5) should be correct', function(){
      assert.deepEqual(tree.getProofPath(5), [ { parent: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05',
      left: '06072b3d9c7d2060ba861c9e51f0fde5c02bf8dbcfceb02388bb2b8000a7df4a',
      right: '9468c347a37612ce437060da960d7c709fcae332c0e05d5158c442a8fff361f8' },
    { parent: '99fe125569d7311d46a36b23332fae1455aad5f53037ccedb14417fa6461918e',
      left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
    });

    it('tree.getProofPath(5, true) should be correct', function(){
      assert.deepEqual(tree.getProofPath(5, true), [ { 
      left: '06072b3d9c7d2060ba861c9e51f0fde5c02bf8dbcfceb02388bb2b8000a7df4a',
      right: '9468c347a37612ce437060da960d7c709fcae332c0e05d5158c442a8fff361f8' },
    { 
      left: '121ffea06f0c8e8508ab9bbbc6cfc0ba6e6f44d55f6f2eb58dbc54159b5e902a',
      right: '9037e3deaf8c4a7d2bdc6ffab4cdf25349da4a65684282b626bab038d2dd2c05' } ]);
    });
  });
  
});
