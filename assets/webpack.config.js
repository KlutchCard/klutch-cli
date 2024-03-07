const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
const CopyPlugin = require("copy-webpack-plugin");

const entries = {
  index: './src/index.tsx'
}

const htmlPlugins = Object.keys(entries).map((ent) => 
  new HtmlWebpackPlugin({
    title: 'Miniapp',
    template: 'index.html',
    filename: `${ent}.html`,
    chunks: [ent],
  })  
)

const copyPlugin = new CopyPlugin({
  patterns: [
      { from: "public", to: "" } //to the dist root directory
  ],
})


module.exports = (env) => {  
  return {
    devtool: 'source-map',
    entry: entries ,
    output: {
      filename: '[name]-[contenthash].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    plugins: [...htmlPlugins,  copyPlugin     
      //new BundleAnalyzerPlugin(({generateStatsFile : true}))
    ],  
    module: {
      rules: [
        {
          test: /\.(jsx|js)$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: [{
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  "targets": "defaults" 
                }],
                ['@babel/preset-react', {
                  "runtime": "automatic"
                }]
              ]
            }
          }]
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },      
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        }, 
 
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },      
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },    
    devServer: {
      static: {
          directory: path.resolve(__dirname, 'dist'),        
      },    
      devMiddleware: {
        writeToDisk: true
      },
      open: true,    
      allowedHosts: "all",
      port: 3001,
      historyApiFallback: true,
      
    },  
  }
}
