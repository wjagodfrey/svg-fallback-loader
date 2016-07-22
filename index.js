'use strict';

const fs          = require("fs-promise");
const path        = require('path');
const svg2png     = require('svg2png');
const sizeOf      = require('image-size');
const mkdirp      = require('mkdirp-promise')
const loaderUtils = require('loader-utils');
const deepAssign  = require('deep-assign');

module.exports = function(source) {
  this.cacheable(true);

  let query = loaderUtils.parseQuery(this.query);
  var configKey = query.configKey || 'svgFallbackLoader';

  let config = {
    output:{
      base: this.options.output.path,
      retina: './retina/',
      fallback: './fallback/',
      svg: './svg/'
    }
  };

  // extend user configuration onto defaults
  config = deepAssign({}, config, this.options[configKey]);

  // require a base path
  if (!config.output.base) {
    throw new Error('No base path configured');
  }

  // calculate paths
  let svgResourcePath  = this.resourcePath;
  let svgName          = path.basename(svgResourcePath, path.extname(svgResourcePath));
  let basePath         = config.output.base;
  let retinaPath       = path.join(basePath, config.output.retina, `${svgName}.png`);
  let fallbackPath     = path.join(basePath, config.output.fallback, `${svgName}.png`);
  let svgPath          = path.join(basePath, config.output.svg, `${svgName}.svg`);

  let svgSize = sizeOf(svgResourcePath);

  console.log(svgName, svgSize);

  // perform conversions
  fs.readFile(svgResourcePath)
    .then(mkdirp(path.dirname(retinaPath)))
    .then(mkdirp(path.dirname(fallbackPath)))
    .then(mkdirp(path.dirname(svgPath)))
    .then((svgBuffer) => {
      return Promise.all([
        // retina conversion
        svg2png(svgBuffer, {
          width: (svgSize.width * 2),
          height: (svgSize.height * 2)
        })
          .then(buffer => fs.writeFile(retinaPath, buffer)),
        // fallback conversion
        svg2png(svgBuffer, {
          width: svgSize.width,
          height: svgSize.height
        })
          .then(buffer => fs.writeFile(fallbackPath, buffer))
      ]);
    })
    // copy svgs across
    .then(fs.copy(svgResourcePath, svgPath))
    .catch((e) => {
      throw new Error(e);
    });

  let result = `module.exports = {
    name: '${svgName}',
    retina: '${retinaPath}',
    fallback: '${fallbackPath}',
    svg: '${svgPath}',
  };`;

  return result;
};
