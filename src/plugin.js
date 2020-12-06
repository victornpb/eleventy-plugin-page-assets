import path from "path";
import fs from "fs";
import pm from "picomatch";

const PREFIX = "eleventy-plugin-page-assets";

let pluginOptions = {
  postsMatching: "*.md",
  assetsMatching: "*.png|*.jpg|*.gif",
};

async function transform(content, outputPath) {
  const template = this;
  if (outputPath && outputPath.endsWith(".html")) {
    const inputPath = template.inputPath;

    if (
      pm.isMatch(inputPath.replace(/^\.\//, ""), pluginOptions.postsMatching)
    ) {
      const templateDir = path.dirname(template.inputPath);
      const outputDir = path.dirname(outputPath);

      let files = await fs.promises.readdir(templateDir);
      files = files.filter((file) =>
        pm.isMatch(file, pluginOptions.assetsMatching)
      );

      if (files.length) {
        for (file of files) {
          const from = path.join(templateDir, file);
          const to = path.join(outputDir, file);

          console.log(`[${PREFIX}]`, "Copying... ", from, " -> ", to);
          fs.mkdirSync(outputDir, { recursive: true });
          await fs.promises.copyFile(from, to);
        }
      }
    }
  }
  return content;
}

// export plugin
export default {
  configFunction(eleventyConfig, options = {}) {
    pluginOptions = Object.assign(pluginOptions, options);
    eleventyConfig.addTransform(`${PREFIX}-transform`, transform);
  },
};
