import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { Configuration } from "webpack";

const webpackConfig: Configuration = {
  entry: {
    main: path.join(__dirname, 'src', 'main.ts'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: 'ts-loader',
        exclude: '/node_modules/',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),
  ],
}

export default webpackConfig
