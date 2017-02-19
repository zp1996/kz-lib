module.exports = Object.assign({ 
	dev_manifest: require('./lib/dev/manifest.json'),
	prod_manifest: require('./lib/prod/manifest.json')
}, require('./lib.json'));
