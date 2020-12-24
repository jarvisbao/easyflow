const path = require('path')
const { name } = require('./package')

const dev = process.env.NODE_ENV === 'development'
const port = 7006 // dev port
const assetsDir = ''
const ASSET_PATH = dev ? '/' : `/static/${name}/`
const outputDir = `../../static/${name}`
process.env.VUE_APP_ASSET_PATH = ASSET_PATH

function resolve(dir) {
  return path.join(__dirname, dir)
}
function assetsPath(_path) {
  const assetsSubDirectory = assetsDir
  return path.posix.join(assetsSubDirectory, _path)
}
process.env.VUE_APP_NAME = name
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  lintOnSave: true,
  publicPath: ASSET_PATH,
  filenameHashing: true,
  outputDir: outputDir,
  assetsDir: assetsDir,
  // tweak internal webpack configuration.
  // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
  devServer: {
    historyApiFallback: true,
    host: '0.0.0.0',
    hot: true,
    disableHostCheck: true,
    port,
    overlay: {
      warnings: false,
      errors: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    proxy: {
      '/rpcgateway': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  },
  productionSourceMap: dev,
  // 自定义webpack配置
  configureWebpack: config => {
    // config.externals = {
    //   'vue': 'Vue',
    //   'vue-router': 'VueRouter',
    //   'ElementUI': 'ELEMENT',
    //   'axios': 'axios',
    //   'jquery': 'jQuery'
    // }
    const resolves = {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': resolve('src'),
        'vant': '@fire-dragons/vant',
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
    Object.assign(config.resolve, resolves)
    const output = {
      // 把子应用打包成 umd 库格式
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`
    }
    Object.assign(config.output, output)
    if (!dev) {
      //   // 为生产环境修改配置...
      //   // 配置打包 压缩js
      //   config.plugins.push(
      //     new CompressionPlugin({
      //       algorithm: 'gzip',
      //       test: /\.js$|\.html$|.\css/, // 匹配文件名
      //       threshold: 10240, // 对超过10k的数据压缩
      //       deleteOriginalAssets: false, // 不删除源文件
      //       minRatio: 0.8
      //     })
      //   )
      //   // 图片压缩
      //   config.module.rules.push({
      //     test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      //     use: [{
      //       loader: 'image-webpack-loader',
      //       options: {
      //         bypassOnDebug: true, // webpack@1.x
      //         disable: true // webpack@2.x and newer
      //       }
      //     }]
      //   })
      // 去除性能提示
      config.performance = {
        hints: 'warning',
        // 入口起点的最大体积 整数类型（以字节为单位）
        maxEntrypointSize: 50000000,
        // 生成文件的最大体积 整数类型（以字节为单位 300k）
        maxAssetSize: 30000000,
        // 只给出 js 文件的性能提示
        assetFilter: function(assetFilename) {
          return assetFilename.endsWith('.js')
        }
      }
    }
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')
    // 清除已有的所有 loader。
    // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
    svgRule.uses.clear()
    svgRule
      .test(/\.svg$/)
      .include.add(resolve('./src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
    const fileRule = config.module.rule('file')
    fileRule.uses.clear()
    fileRule
      .test(/\.svg$/)
      .exclude.add(resolve('./src/icons'))
      .end()
      .use('file-loader')
      .loader('file-loader')
      .options({
        limit: 10000,
        name: assetsPath('img/[name].[hash:7].[ext]')
      })
    if (!dev) {
      config.plugins.delete('prefetch') // vue-cli3.0   加上这行才能按需加载  移除 prefetch 插件
      // 移除 preload 插件
      config.plugins.delete('preload')
      // 压缩代码
      config.optimization.minimize(true)
      // 分割代码
      config.optimization.splitChunks({
        chunks: 'all'
      })
    }
  }
}
