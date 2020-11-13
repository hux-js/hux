import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import bundleSize from 'rollup-plugin-bundle-size';
import brotli from "rollup-plugin-brotli";
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
      typescript(),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'hux',
    },
    plugins: [
      nodeResolve(),
      bundleSize(),
      brotli(),
      typescript(),
    ],
  },
];