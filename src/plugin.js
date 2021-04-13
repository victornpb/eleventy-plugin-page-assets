// IMPORTS
const path = require("path");
const fs = require("fs");
const pm = require("picomatch");
const { JSDOM } = require("jsdom");
const walk = require("./utils/walk");
const hashFile = require("./utils/hashFile");
const resolveFile = require("./utils/resolveFile");
// END IMPORTS

const PREFIX = "Eleventy-Plugin-Page-Assets";
const LOG_PREFIX = `[\x1b[34m${PREFIX}\x1b[0m]`;

const pluginOptions = {
  mode: "parse", // directory|parse
  postsMatching: "*.md",
  assetsMatching: "*.png|*.jpg|*.gif",
  
  recursive: false, // only mode:directory

  hashAssets: true, // only mode:parse
  hashingAlg: 'sha1', // only mode:parse
  hashingDigest: 'hex', // only mode:parse

  addIntegrityAttribute: true,
};

const isRelative = (url) => !/^https?:/.test(url);

async function transformParser(content, outputPath) {
  const template = this;
  if (outputPath && outputPath.endsWith(".html")) {
    const inputPath = template.inputPath;

    if (
      pm.isMatch(inputPath, pluginOptions.postsMatching, { contains: true })
    ) {
      const templateDir = path.dirname(template.inputPath);
      const outputDir = path.dirname(outputPath);

        // parse
        const dom = new JSDOM(content);
        const elms = [...dom.window.document.querySelectorAll("img")]; //TODO: handle different tags

        console.log(LOG_PREFIX, `Found ${elms.length} assets in ${outputPath} from template ${inputPath}`);
        await Promise.all(elms.map(async (img) => {

          const src = img.getAttribute("src");
          if (isRelative(src) && pm.isMatch(src, pluginOptions.assetsMatching, { contains: true })) {

            const assetPath = path.join(templateDir, src);
            const assetSubdir = path.relative(templateDir, path.dirname(assetPath));
            const assetBasename = path.basename(assetPath);

            let destDir = path.join(outputDir, assetSubdir);
            let destPath = path.join(destDir, assetBasename);
            let destPathRelativeToPage = path.join('./', assetSubdir, assetBasename);

            // resolve asset
            if (await resolveFile(assetPath)) {

              // calculate hash
              if (pluginOptions.hashAssets) {
                const hash = await hashFile(assetPath, pluginOptions.hashingAlg, pluginOptions.hashingDigest);
                if (pluginOptions.addIntegrityAttribute)
                  img.setAttribute("integrity", `${pluginOptions.hashingAlg}-${hash}`);

                // rewrite paths
                destDir = outputDir; // flatten subdir
                destPath = path.join(destDir, hash + path.extname(assetBasename))
                destPathRelativeToPage = './' + path.join(hash + path.extname(assetBasename))
                img.setAttribute("src", destPathRelativeToPage);
              }

              console.log(LOG_PREFIX, `Writting ./${destPath} from ./${assetPath}`);
              fs.mkdirSync(destDir, { recursive: true });
              await fs.promises.copyFile(assetPath, destPath);

            } else {
              throw new Error(`${LOG_PREFIX} Cannot resolve asset "${src}" in "${outputPath}" from template "${inputPath}"!`);
            }
          }

        }));
        
        console.log(LOG_PREFIX, `Processed ${elms.length} images in "${outputPath}" from template "${inputPath}"`);
        content = dom.serialize();
    }
  }
  return content;
}

async function transformDirectoryWalker(content, outputPath) {
  const template = this;
  if (outputPath && outputPath.endsWith(".html")) {
    const inputPath = template.inputPath;

    if (
      pm.isMatch(inputPath, pluginOptions.postsMatching, { contains: true })
    ) {
      const templateDir = path.dirname(template.inputPath);
      const outputDir = path.dirname(outputPath);

      let assets = [];
      if (pluginOptions.recursive) {
        for await (const file of walk(templateDir)) {
          assets.push(file);
        }
      } else {
        assets = await fs.promises.readdir(templateDir);
        assets = assets.map((f) => path.join(templateDir, f));
      }
      assets = assets.filter(file => pm.isMatch(file, pluginOptions.assetsMatching, { contains: true }));

      if (assets.length) {
        for (file of assets) {
          const relativeSubDir = path.relative(templateDir, path.dirname(file));
          const basename = path.basename(file);

          const from = file;
          const destDir = path.join(outputDir, relativeSubDir);
          const dest = path.join(destDir, basename);

          console.log(LOG_PREFIX, `Writting ./${dest} from ./${from}`);
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
    Object.assign(pluginOptions, options);

    if (pluginOptions.mode === "parse") {
      // html parser
      eleventyConfig.addTransform(`${PREFIX}-transform-parser`, transformParser);
    } else if (pluginOptions.mode === "directory") {
      // directory traverse
      eleventyConfig.addTransform(`${PREFIX}-transform-traverse`, transformDirectoryWalker);
    }
    else {
      throw new Error(`${LOG_PREFIX} Invalid mode! (${options.eleventyConfig}) Allowed modes: parse|directory`);
    }
  },
};
