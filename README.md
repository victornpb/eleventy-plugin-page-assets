
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
        postsMatching: "src/posts/*/*.md",
        assetsMatching: "*.png|*.jpg|*.gif|*.svg"
    });
};
```

# How to use it

This folder structure 
```
📁 src/posts/
  📁 some-title/
    📄 index.md <-- when a template file is processed
    🖼 cover.png    assets relative to it are automatically
    🖼 image.jpg    copied to the final permalink folder
  📁 good-title/
    📄 index.md 
    🖼 cover.png
```

Output
```
📁 dist/
  📁 perma-some-title/
    📄 index.html 
    🖼 cover.png 
    🖼 image.jpg 
  📁 perma-good-title/
    📄 index.html 
    🖼 cover.png
```


# Options
| Attribute | Example Value | Description | Default
| ------ | ------ | ------ | ------ |
| `postPath` [required] | `src/posts/*/*.md` | Pattern (glob) filtering which templates to process | `*.md`
| `assetsMatching` [required] | "*.png|*.jpg|*.gif" | Specify a pattern (glob) that matches which files are going to be copied over | `*.png|*.jpg|*.gif`

> **Notes**
> - All files that matches the pattern and are on the same folder level as the template are going to be copied, even if not used by the template.
> - Paths are not rewritten in the html file.


----

## TO-DO:

- [  ] Parse the rendered html files looking for assets, and only used imported assets (similat to how what webpack loaders work)
- [  ] Rewrite paths on the output files, possibly renaming files to md5 hashes, so images also have permalinks.
- [  ] Write tests 
