import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: ['src/hux-workers/application/worker.js'],
    output: {
      file: 'dist/worker.bundle.umd.js',
      format: 'umd',
      name: 'worker',
      inlineDynamicImports: true,
    },
    plugins: [
      nodeResolve(),
      terser({
        warnings: true,
        mangle: {
          module: true,
        },
      }),
      {
        name: 'worker-to-string',
        renderChunk(code) {
          return 'export default `' + code + '`;';
        },
      },
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/bundle.umd.min.js',
      format: 'umd',
      name: 'hux'
    },
    plugins: [
      nodeResolve(),
      commonjs({
        transformMixedEsModules: true,
        include: ['src/**', 'node_modules/**']
      }),
      typescript(),
      json(),
      babel(),
      terser()
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'test/regression/scripts/bundle.umd.js',
      format: 'umd',
      name: 'hux',
    },
    plugins: [
      nodeResolve({ browser: true }),
      commonjs({
        transformMixedEsModules: true,
        include: ['src/**', 'node_modules/**']
      }),
      typescript(),
      json(),
      babel()
    ],
  },
];
