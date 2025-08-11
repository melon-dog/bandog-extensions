const esbuild = require('esbuild');

esbuild.build({
	entryPoints: ['./src/bandog-extension.ts'],
	bundle: true,
	outfile: './dist/bandog-extension.js',
	platform: 'browser',
	target: 'es2015',
	minify: true,
}).catch(() => process.exit(1));