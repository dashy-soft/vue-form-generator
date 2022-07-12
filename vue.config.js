const path = require("path");
const webpack = require("webpack");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const version = require("./package.json").version;
const banner = `
/**
 * vue-form-generator ${version}
 * https://github.com/vue-generators/vue-form-generator/
 * Released under the MIT License.
 */
`;

module.exports = {
	publicPath: process.env.NODE_ENV === "production" ? "" : "/",
	outputDir: process.env.NODE_ENV === "production" ? "dist" : path.resolve("dev/projects"),
	lintOnSave: true,
	runtimeCompiler: false,
	transpileDependencies: [],
	productionSourceMap: false,
	chainWebpack: (config) => {
		if (process.env.NODE_ENV === "production") {
			config.plugin("banner").use(webpack.BannerPlugin, [
				{
					banner,
					raw: true,
					entryOnly: true
				}
			]);
			config.plugin("lodash").use(LodashModuleReplacementPlugin, [
				{
					shorthands: true,
					cloning: true,
					currying: true,
					caching: true,
					collections: true,
					exotics: true,
					guards: true,
					metadata: true,
					deburring: true,
					unicode: true,
					chaining: true,
					memoizing: true,
					coercions: true,
					flattening: true,
					paths: false,
					placeholders: true
				}
			]);
		} else if (process.env.NODE_ENV === "test") {
			config.devtool("eval");
			config.module
				.rule("istanbul")
				.test(/\.(js|vue)$/)
				.enforce("post")
				.include.add(path.resolve(__dirname, "/src"))
				.end()
				.use("istanbul-instrumenter-loader")
				.loader("istanbul-instrumenter-loader")
				.options({ esModules: true });
		} else {
			config.resolve.alias.set("vue-form-generator", path.resolve(__dirname, "src"));
		}
	},
	css: {
		modules: false,
		sourceMap: false,
		loaderOptions: {}
	}
};
