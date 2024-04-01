const path = require ("path")
const common = require("./webpack.common")
const {merge} = require("webpack-merge")
const miniCssExtractPlugin = require("mini-css-extract-plugin")
module.exports = merge(common, {
    mode: "production",
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, "dist"),
        assetModuleFilename: 'images/[hash][ext][query]',
        clean: true
    },
    plugins: [
        new miniCssExtractPlugin({filename: "[name].[contenthash].css"})
    ],

    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [miniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            },
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
            {
                test: /\.(svg|png|jpg|gif)$/,
                type: "asset/resource"
                // loader: "file-loader",
                // options: {
                //     outputPath: "img"
                // }
            },
            {
                test: /\.mp4$/,
                // type: "asset/resource"
                loader: "file-loader",
                options: {
                    outputPath: "video"
                }
            }
        ]
    },
})