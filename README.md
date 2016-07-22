# svg-fallback-loader

### IN DEVELOPMENT

would not recommend

------



### Configuration

The loader can be configured (defaults shown);

```
svgFallbackLoader: {
  output:{
    base: __dirname,
    retina: './retina/',
    fallback: './fallback/',
    svg: './svg/'
  }
}
```

The key of the configuration object can be modified with the following loader query, if it conflicts for any reason:

```
loader: 'svg-fallback-loader?configKey=somethingElse',
```

### Example

```
module.exports = {
  //...
    module: {
        loaders: [
          test: /\.svg$/,
          loader: 'svg-fallback-loader',
          include: /(icons)/ // not required, only if you want this to apply to specific svgs
        ]
    },
    //...
    svgFallbackLoader: {
      output:{
        base: path.join(__dirname, './public/icons/')
        // icon kind (retina, svg etc) directories use defaults
      }
    }
    //...
};
```

Now, when requiring an svg with webpack, you will get back an object like this:

```
{
  name: "icon-arrow-left",
  retina: "/Users/wilfred.godfrey/www/project_name/public/icons/retina/icon-arrow-left.png",
  fallback: "/Users/wilfred.godfrey/www/project_name/public/icons/png/icon-arrow-left.png",
  svg: "/Users/wilfred.godfrey/www/project_name/public/icons/svg/icon-arrow-left.svg"
}
```

Clearly not useful in all situations, but useful nonetheless.

------

I am using it like so:

```
// icons.js

'use strict';

module.exports = {};

requireAll(require.context('./icons/', true, /\.svg$/));

function requireAll(r) {
  r.keys().forEach((key) => {
    let icon = r(key);
    module.exports[icon.name] = icon;
  });
}
```

This module returns an object of icon definitions, with icon names as keys.

This is then passed to a react component that handles which injects icons by name, and injects the correct icon src for the user's browser.

### TODO

* Add tests
* Prevent icon name/path collisions
* Propbably output CSS instead
