const FlowWebpackPlugin = require('flow-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    plugins: [
        new FlowWebpackPlugin(),
    ],
    entry: [
        'babel-polyfill', './src/index.js'
    ],
    output: {
        path: __dirname,
        publicPath: '/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['react', 'es2015', 'stage-1']
                }
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader']
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                loader: 'file-loader',
                options: {

                }
            }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    devServer: {
        historyApiFallback: true,
        contentBase: './',
        proxy: {
            "/api": "http://localhost:9121"
        }
    }
};
