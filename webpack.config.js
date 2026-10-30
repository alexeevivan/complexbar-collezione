const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Конфиг экспортируется функцией, чтобы учитывать режим (--mode development / production)
module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';

	return {
		mode: isProduction ? 'production' : 'development',
		entry: {
			main: './src/index.js',
			recipes: './src/recipes.js',
			calendar: './src/calendar.js',
			collaboration: './src/collab.js',
			expert: './src/expert.js'
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'js/[name].[contenthash].js',
			// 'auto' — пути к js/css/картинкам считаются относительно страницы,
			// поэтому сайт работает и с корня, и из подпапки GitHub Pages (/complexbar-collezione/)
			publicPath: 'auto',
			clean: true,
		},

		module: {
			rules: [
				{
					test: /\.s?css$/i,
					use: [
						MiniCssExtractPlugin.loader,
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
				{
					test: /\.(woff|woff2|eot|ttf|otf)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'assets/fonts/[name][ext]' // куда сложит шрифты в build
					}
				}
			],
		},

		plugins: [
			new HtmlWebpackPlugin({
				template: './src/html/index.html',
				filename: 'index.html',
				chunks: ['main'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/classes/calendar.html',
				filename: 'calendar.html',
				chunks: ['main', 'calendar'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/classes/collaboration.html',
				filename: 'collaboration.html',
				chunks: ['main', 'collaboration'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/classes/expert-studio.html',
				filename: 'expert-studio.html',
				chunks: ['main', 'expert'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/pd-syrup-recipes.html',
				filename: 'pd-syrup-recipes.html',
				chunks: ['recipes'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/pd-puree-recipes.html',
				filename: 'pd-puree-recipes.html',
				chunks: ['recipes'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/pd-drinkbase-recipes.html',
				filename: 'pd-drinkbase-recipes.html',
				chunks: ['recipes'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/odk-syrup-recipes.html',
				filename: 'odk-syrup-recipes.html',
				chunks: ['recipes'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/odk-puree-recipes.html',
				filename: 'odk-puree-recipes.html',
				chunks: ['recipes'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/code-recipes.html',
				filename: 'code-recipes.html',
				chunks: ['recipes'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/osnova-recipes.html',
				filename: 'osnova-recipes.html',
				chunks: ['recipes'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/drinksome-recipes.html',
				filename: 'drinksome-recipes.html',
				chunks: ['recipes'],
			}),
			new HtmlWebpackPlugin({
				template: './src/html/recipes/bubbledrops-recipes.html',
				filename: 'bubbledrops-recipes.html',
				chunks: ['recipes'],
			}),
			new MiniCssExtractPlugin({
				filename: 'css/[name].[contenthash].css',
			}),
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
				'src/html/**/*.html',
			],
			port: 8080,
			open: true,
			hot: true,
		},

		// source map только для разработки: в production бандл остаётся лёгким
		devtool: isProduction ? false : 'eval-source-map',
	};
};