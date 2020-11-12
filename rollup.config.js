import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: ['./src/hux-workers/worker.js'],
    output: {
      file: 'dist/worker.bundle.umd.js',
      format: 'umd',
    },
    plugins: [
      resolve(),
      terser({
        warnings: true,
        mangle: {
          module: true,
        },
      }),
      {
        name: 'worker-to-string',
        renderChunk(code) {
          return `export default '${code}';`;
        },
      },
    ],
  },
  {
    input: 'index.js',
    output: {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'hux',
    },
    plugins: [
      resolve(),
    ],
  },
];