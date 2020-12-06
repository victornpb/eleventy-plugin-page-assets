# eleventy-plugin-meta-generator

Adds a meta-generator tag to the head of the generated html files

## Installation

That's simple!

```sh
npm install eleventy-plugin-meta-generator
```

## Usage

Update your `.eleventy.js` like so:

```js
// For liquid
const generator = require('eleventy-plugin-meta-generator');

module.exports = function (eleventyConfig) {
  eleventyConfig.addLiquidTag("generator", () => {
    return {
      render: function() {
        return generator()
      }
    };
  });

  return {
    templateFormats: [
      'liquid'
    ]
  };
};
```

```js
const generator = require('eleventy-plugin-meta-generator');

module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksTag("generator", (nunjucksEngine) => {
    return new function() {
      this.tags = ["generator"];

      this.parse = function(parser, nodes, lexer) {
        var tok = parser.nextToken();

        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);

        return new nodes.CallExtensionAsync(this, "run", args);
      };

      this.run = function(_, myStringArg, callback) {
	generator()
	  .then((metaTag) => {
	    let ret = new nunjucksEngine.runtime.SafeString(metaTag);
	    callback(null, ret);
	  });
      };
    };
  });

  return {
    templateFormats: [
      'njk'
    ]
  };
```

Then you can use the new tag in your layout files:

```liquid
<!-- liquid syntax -->
{% generator %}
```

```njk
<!-- nunjucks syntax -->
{% generator '' %}
```

## License

MIT. See [LICENSE](./LICENSE)
