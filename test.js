/* eslint-env node, mocha */
var requirejs = require("requirejs");
var assert = require("chai").assert;

var req = requirejs.config({
  baseUrl: ".",
});

beforeEach(function () {
  // Reset RequireJS' cache of modules.
  Object.keys(requirejs.s.contexts._.defined).forEach(function (mod) {
    req.undef(mod);
  });
  assert.equal(Object.keys(requirejs.s.contexts._.defined).length, 0);
});

it("starts with good values", function (done) {
  req(["optional!"], function loaded(mod) {
    assert.isDefined(mod.version);
    assert.sameMembers(mod.failed, []);
    done();
  });
});

it("loads the module when it exists", function _test(done) {
  requirejs.define("existent", function factory() {
    return 1;
  });
  req(["optional!existent"], function loaded(mod) {
    assert.equal(mod, 1);
    done();
  });
});

it("returns {} when the module cannot load", function _test(done) {
  req(["optional!nonexistent"], function loaded(mod) {
    assert.deepEqual(mod, {});
    done();
  });
});

it("returns {} when the module cannot load", function _test(done) {
  req(["optional!nonexistent"], function loaded(mod) {
    assert.deepEqual(mod, {});
    done();
  });
});

it("returns {} when a dependent cannot load", function _test(done) {
  requirejs.define("nonexistent-dep", ["nonexistent2"], function factory() {
    return 1;
  });
  req(["optional!nonexistent-dep"], function loaded(mod) {
    assert.deepEqual(mod, {});
    done();
  });
});

it("the plugin does not affect calls that do not use it", function _test(done) {
  req(["optional!nonexistent"], function loaded(mod) {
    assert.deepEqual(mod, {});
    req(["nonexistent"],
        function loaded2() {
          throw new Error("should not be successful");
        },
        function failed() {
          // We should get here because this require call did not use the
          // plugin.
          done();
        });
  });
});

it("the plugin can be inspected", function _test(done) {
  requirejs.define("inspect", ["optional!nonexistent", "optional"],
         function (nonexistent4, optional) {
           assert.sameMembers(optional.failed, ["nonexistent"]);
         });
  req(["inspect"], done);
});
