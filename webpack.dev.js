const path = require ("path")
const {merge} = require("webpack-merge")
const common = require("./webpack.common")
module.exports = merge(common, {
    mode: "development",
    devtool: false,
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.html$/,
                use: ["html-loader"]
            },
            {
                test: /\.mp4$/,
                use: 'file-loader?name=video/[name].[ext]',
            }
        ]
    },
})