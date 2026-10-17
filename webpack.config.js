const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const posthtml = require('posthtml');
const posthtmlInclude = require('posthtml-include');
const CopyWebpackPlugin = require('copy-webpack-plugin');

class PostHtmlIncludePlugin {

	apply(compiler) {
		compiler.hooks.compilation.tap('PostHtmlIncludePlugin', (compilation) => {
			const hooks = HtmlWebpackPlugin.getHooks(compilation);
			hooks.beforeEmit.tapPromise('PostHtmlIncludePlugin', async (data) => {
				const result = await posthtml([
					posthtmlInclude({
						root: path.resolve(__dirname, 'public'),
					}),
				]).process(data.html, {
					from: path.resolve(__dirname, 'public/index.html'),
				});
				data.html = result.html;
				return data;
			});
		});
	}
}

module.exports = {
	mode: 'development',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/[name].[contenthash].js',
		clean: true,
	},

	module: {
		rules: [
			{
				test: /\.s?css$/i,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader',
				],
			},
		{
			test: /\.html$/i,
			use: [
				{
					loader: 'html-loader',
					options: {
						sources: false, // Отключаем автоматическую обработку src/srcset
					},
				},
				{
					loader: 'posthtml-loader',
					options: {
						plugins: [
							require('posthtml-include')({
								root: path.resolve(__dirname, 'src/html'),
							}),
						],
					},
				},
			],
		},
			{
				test: /\.(svg|png|jpe?g|gif|webp)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'assets/img/[name][ext]',
				},
			},
		],
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: './src/html/index.html',
			filename: 'index.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/pd-syrup-recipes.html',
			filename: 'pd-syrup-recipes.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/pd-puree-recipes.html',
			filename: 'pd-puree-recipes.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/pd-drinkbase-recipes.html',
			filename: 'pd-drinkbase-recipes.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/odk-syrup-recipes.html',
			filename: 'odk-syrup-recipes.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/odk-puree-recipes.html',
			filename: 'odk-puree-recipes.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/code-recipes.html',
			filename: 'code-recipes.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/osnova-recipes.html',
			filename: 'osnova-recipes.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/drinksome-recipes.html',
			filename: 'drinksome-recipes.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/html/recipes/bubbledrops-recipes.html',
			filename: 'bubbledrops-recipes.html',
		}),
		new PostHtmlIncludePlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'src/assets'),
					to: path.resolve(__dirname, 'dist/assets'),
				},
			],
		}),
	],

	devServer: {
		static: {
			directory: path.resolve(__dirname, 'dist'),
		},
		watchFiles: [
			'public/**/*.html',
		],
		port: 8080,
		open: true,
		hot: true,
	},
	devtool: 'eval-source-map',
};