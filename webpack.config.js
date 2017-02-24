const webpack = require('webpack'),
    path = require('path'),
    SupportAMDPlugin = require('./SupportAMDPlugin'),
    { exec } = require('child_process'),
    { argv: { env } } = require('optimist'),
    dir = env === 'production' ? 'prod' : 'dev',
    outputPath = path.join(__dirname, 'lib', dir); 

exec(`rm -rf ./lib/${dir}`);

// 依赖的公共资源
const lib = [
    'react',
    'react-dom',
    'redux',
    'redux-thunk',
    'react-redux',
    'pure-render-decorator'
];

module.exports = {
    devtool: 'source-map',
    entry: { lib },
    output: {
        path: outputPath,
        filename: 'lib.[chunkhash:8].js',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(outputPath, 'manifest.json')
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env || 'development')
        }),
        new SupportAMDPlugin({
            deps: lib,
            dir
        })
    ]      
};