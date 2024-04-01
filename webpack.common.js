const HtmlWebpackPlugin = require("html-webpack-plugin")
const path = require ("path")
const webpack = require("webpack")
module.exports = {
    entry: {
        main: "./src/index.js",
        // autoAdoption: "./src/autoAdoption.js"
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery'
          }),
        new HtmlWebpackPlugin({
            template: "./src/template.html"
        })
    ]
}