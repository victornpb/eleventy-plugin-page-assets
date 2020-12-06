// IMPORTS
const path = require("path");
const fs = require("fs");
const pm = require("picomatch");
const walk = require("./utils/walk");
const hashFile = require("./utils/hashFile");
// END IMPORTS


const PREFIX = "eleventy-plugin-page-assets";
const LOG_PREFIX = `[\x1b[34m${PREFIX}\x1b[0m]`;

let pluginOptions = {
  postsMatching: "*.md",
  assetsMatching: "*.png|*.jpg|*.gif",
  recursive: false,
};

async function transform(content, outputPath) {
  const template = this;
  if (outputPath && outputPath.endsWith(".html")) {
    const inputPath = template.inputPath;

    if (
      pm.isMatch(inputPath, pluginOptions.postsMatching, { contains: true })
    ) {
      const templateDir = path.dirname(template.inputPath);
      const outputDir = path.dirname(outputPath);

      let files = [];
      if (pluginOptions.recursive) {
        for await (const file of walk(templateDir)) {
          files.push(file);
        }
      } else {
        files = await fs.promises.readdir(templateDir);
        files = files.map((f) => path.join(templateDir, f));
      }

      files = files.filter((file) =>
        pm.isMatch(file, pluginOptions.assetsMatching, { contains: true })
      );

      if (files.length) {
        for (file of files) {
          const relativeSubDir = path.relative(templateDir, path.dirname(file));
          const basename = path.basename(file);

          const from = file;
          const destDir = path.join(outputDir, relativeSubDir);
          const dest = path.join(destDir, basename);

          console.log(LOG_PREFIX, "Copying... ", from, " -> ", dest);
          fs.mkdirSync(destDir, { recursive: true });
          await fs.promises.copyFile(from, dest);
        }
      }
    }
  }
  return content;
}

// export plugin
module.exports = {
  configFunction(eleventyConfig, options) {
    pluginOptions = Object.assign(pluginOptions, options);
    eleventyConfig.addTransform(`${PREFIX}-transform`, transform);
  },
};
