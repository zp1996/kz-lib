const path = require('path'),
    fs = require('fs'), 
    pathRE = /node_modules\/(\S+)$/,
    fileRE = /^lib\.\w{8}\.js$/,
    writeRE = 'function __webpack_require__(moduleId) {';

let key = '';
let defaultOpts = {
    deps: [],
    uglify: false
};

class SupportAMDPlugin {
    constructor(opts) {
        opts.patterns = opts.deps.map(
            dep => new RegExp(`\\/${dep}\\/`)
        );
        defaultOpts = Object.assign(defaultOpts, opts);
        defaultOpts.manifest = path.join(__dirname, 'lib', opts.dir, 'manifest.json');
    }
    apply(compiler, callback) {
        compiler.plugin('emit', (compilation, callback) => {
            const { compilation: { cache, assets } } = compilation.getStats(),
                { deps, patterns, manifest } = defaultOpts,
                { length } = deps,
                lib = [],
                files = Object.keys(cache);
            let i = 1;
            while (i <= length) {
                const file = files[i++];
                for (let j = 0, len = patterns.length; j < len; j++) {
                    if (patterns[j].test(file)) {
                        lib.push({
                            name: deps[j],
                            path: `./node_modules/${pathRE.exec(file)[1]}`
                        });
                        break;
                    }        
                }
            }

            const { content } = require(manifest);

            key = Object.keys(assets).filter(val => fileRE.test(val))[0];

            let js = 'var lib = {};\nObject.defineProperties(lib, {\n',
                getPath = val => (
                    (
                        content[val.path] || 
                        val.path.replace(/\.\/node_modules/, str => '..')
                    ).id
                );          
            lib.forEach(val => {
                val.path = getPath(val);
                js += `'${val.name}': {
                        get: function() {
                            return ${val.path};
                        }
                    },\n`;
            });
            js += '\n});\nObject.freeze(lib);\n';
            js = assets[key].children.reduce((a, b) => {
                b = b.length ? b : b._value;
                return a + b
            }, js);
            js = js.replace(
                writeRE, 
                x => `${x}moduleId = lib[moduleId] || moduleId;`
            );

            compilation.assets[key].source = () => js;

            callback();
        });

        compiler.plugin('after-emit', (compilation, callback) => {
            const { dir } = defaultOpts;
            var obj = null;
            try {
                obj = require('./lib.json');
            } catch (e) {   
                obj = {};
            };
            fs.writeFileSync(
                path.join(__dirname, 'lib.json'),
                JSON.stringify(
                    Object.assign(obj, { 
                        [dir]: `./node_modules/kz-lib/lib/${dir}/${key}`
                    })
                , null, 2)
            );   

            if (dir === 'prod') {
                const file = path.join(__dirname, 'lib/prod', key);
                require('child_process').exec(`uglifyjs ${file} -m -c unsafe --define process.env.NODE_ENV='production' -o ${file}`, () => {
                    console.log('uglifyjs is over');
                });
            }

            callback();
        });
    }
}

module.exports = SupportAMDPlugin;