
# eleventy-plugin-page-assets

Copy local page assets to permalink folder

# Instalation

Available on [npm](https://www.npmjs.com/package/eleventy-plugin-page-assets)

```sh
npm install eleventy-plugin-page-assets --save-dev
```

Open up your Eleventy config file (probably .eleventy.js) and use addPlugin:

FILENAME .eleventy.js

```js
const pageAssetsPlugin = require('eleventy-plugin-page-assets');

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(pageAssetsPlugin, {
        mode: "parse",
        postsMatching: "src/posts/*/*.md",
    });
};
```


# How it works

This folder structure 
```
📁 src/posts/
  📁 some-title/
    📄 index.md <-- when a template file is processed
    🖼 cover.png    assets relative to it are automatically
    🖼 image.jpg    copied to the permalink folder
  📁 good-title/
    📄 index.md 
    🖼 cover.png
  📁 bar-title/
    📄 index.md
    📁 icons/ 
      🖼 icon.png
  📄 my-post.md
  🖼 img.png
```

Will generate this output
```
📁 dist/
  📁 perma-some-title/
    📄 index.html 
    🖼 89509eae15a24c2276d54d4b7b28194a1391ee48.png 
    🖼 63d8ddb9ffadd92e3d9a95f0e49ae76e7201a672.jpg 
  📁 perma-good-title/
    📄 index.html 
    🖼 d0017352f4da463a61a83a1bc8baf539a4c921c1.png
  📁 perma-bar-title/
    📄 index.md
    🖼 faa22a543b2dcb21fdd9b7795095e364ef00d540.png
  📁 perma-my-post/
    📄 index.md
    🖼 faa22a543b2dcb21fdd9b7795095e364ef00d540.png
```

----

## Directory mode

On directory mode the template is not parsed, assets on the same level as template are copied to the permalink folder, even if not used.

Note: Paths are not rewritten and folder structure is kept inside the perma folder.

This mode is cheaper as it does not parses the html or transforms it.


# Options

| Option                | Required | Type    | Default               | Description                                                                                                                                      |
|-----------------------|----------|---------|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| mode                  | false    | string  | parse                 | Parse mode will resolve assets referenced inside the template.  Directory mode blindly copies files on the folder as the template.               |
| postsMatching         | false    | string  | "*.md"                | Pattern (glob) filtering which templates to process                                                                                              |
| assetsMatching        | false    | string  | "*.png\|*.jpg\|*.gif" | Specify a pattern (glob) that matches which assets are going to be resolved                                                                      |
| recursive             | false    | boolean | false                 | Recursively scan assets under subdirectories (example src/posts/foo/bar/baz/img.jpg) (directory mode only)                                       |
| hashAssets            | false    | boolean | true                  | Rewrite filenames to hashes. This will flatten the paths to always be next to the post .html file. (parse mode only)                             |
| hashingAlg            | false    | string  | sha1                  | Hashing algorithm sha1\|md5\|sha256\|sha512   https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_optionsetc (parse mode only) |
| hashingDigest         | false    | string  | hex                   | Digest of the hash hex\|base64 (parse mode only)                                                                                                 |
| addIntegrityAttribute | false    | boolean | false                 | Add a integrity attribute to the tag (parse mode only)                                                                                           |
|                       |          |         |                       |                                                                                                                                                  |


----

## TO-DO:

- [x] Parse the rendered html files looking for assets, and only used imported assets (similat to how what webpack loaders work)
- [x] Rewrite paths on the output files, possibly renaming files to md5 hashes, so images also have permalinks.
- [ ] Write tests 
