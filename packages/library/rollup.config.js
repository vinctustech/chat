import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'
import pkg from './package.json' with { type: 'json' }

// Peer dependencies stay external: the host app supplies React, Ant Design and
// dayjs, and bundling a second copy of any of them would be a bug.
const external = Object.keys(pkg.peerDependencies || {})

export default [
  {
    input: 'src/index.ts',
    external: (id) => {
      if (external.some((dependency) => id.startsWith(dependency))) {
        return true
      }
      return /node_modules/.test(id)
    },
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
      }),
      resolve({ browser: true, preferBuiltins: false }),
      commonjs(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: pkg.types,
      format: 'esm',
    },
    external,
    plugins: [
      dts({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          declaration: true,
          emitDeclarationOnly: true,
        },
      }),
    ],
  },
]
