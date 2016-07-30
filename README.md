Plugin for RequireJS to load modules optionally. It ensures both non-transitivity and isolation. (Read below for what this means.)

### Usage

Using ``optional!foo`` means

> if ``foo`` fails to load in any way do not make it an error but give me ``{}`` instead.

Example:

    require(["optional!foo"], function (foo) {
      if (foo.something) {
        // Foo was loaded... act accordingly.
      }
      else {
        // Foo was not loaded... act accordingly.
      }
    });

Another way to do test whether the module loaded is to inspect the plugin itself. If you require ``optional!``, you get a reference to the plugin. It contains an array of module names. So:

    define(["optional!foo", "optional"], function (foo, optional) {
      if (optional.failed.indexOf("foo") !== -1) {
        console.log("failed!");
      }
    });

Note that you can also require ``optional!`` for ``optional`` (the 2nd dependency in the example above) but this syntax may not be supported elsewhere.

A very preliminary version of this plugin returned ``undefined`` as the module value for non-existent modules. The problem with this is that this behavior cannot currently be replicated with SystemJS, but one of the goals of this plugin is to have an equivalent for SystemJS that behaves the same way as it does in RequireJS. So we've changed the return value to ``{}`` for consistency with SystemJS.

### Non-transitivity

Suppose ``foo`` depends on ``bar``:

    define("foo", ["bar"], function (bar) {
      return {
        foo: bar.something();
      }
    });


You load ``optional!foo``. This makes ``foo`` is optional, but ``bar`` is not optional because it appears as ``bar``, without the plugin. If ``bar`` does not exist, then the plugin will kick in and ``foo`` will have the value ``{}``. However, ``bar`` won't get a value at all. If it is required somewhere else, that's an error. These are sensible semantics.

Some plugins similar to this one are implemented to make optionality transitive. Consider again the case above. With these plugins, setting ``optional!foo`` makes ``foo`` *and* all its dependencies *individually optional*. When ``bar`` fails to load, it is considered optional and gets the default value assigned by the plugin to modules that fail to load. ``foo`` will then execute its factory function, try to do ``bar.something()`` and will fail there.

### Isolation

This plugin ensures that calling ``require(["optional!foo"])`` in one location has no effect on *other* calls where the dependency is on ``foo``, without the plugin.

Some plugins similar to this one will *define* foo when it fails to load. This breaks isolation. Consider what happens when you use such plugin, when ``foo`` does not exist:

1. Some code requires ``optional!foo``.
2. Some other code requires ``foo``.

When the first code executes, it gets ``{}`` and knows that ``foo`` did not exist. All is well. When the 2nd code executes, it gets ``{}``. However, this 2nd code did not use ``optional!`` and thus is probably not designed to handle ``{}`` as a value. If ``foo`` does not exist, it wants failure. Isolation ensures that it gets a failure.
