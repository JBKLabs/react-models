import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import path from 'path';

import pkg from './package.json';

const examplePath = 'example/node_modules/@jbknowledge/react-models/';

const config = {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
    {
      file: path.join(examplePath, pkg.main),
      format: 'cjs'
    }
  ],
  external: ['react'],
  plugins: [
    resolve(),
    babel({ exclude: 'node_modules/**' }),
    copy({
      targets: [
        { src: 'package.json', dest: examplePath }
      ]
    })
  ]
};

export default config;
