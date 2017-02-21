# kz-lib

依赖：`webpack,uglifyjs`

```
npm install -g webpack
npm install -g uglifyjs
```

其它项目使用：

```
cd node_modules/kz-lib && npm start
```

支持`AMD`,引入相应环境下的`lib`:

```
require(['lib.xxxxxx.js'], function(lib) {
    const React = lib('react');
    const ReactDom = lib('react-dom');
});
```
