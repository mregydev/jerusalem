
import commonjs from 'rollup-plugin-commonjs';

import { eslint } from 'rollup-plugin-eslint';

import resolve from 'rollup-plugin-node-resolve';

const isDebug = process.env.NODE_ENV == "debug";

export default {
    plugins: [eslint({}), resolve(), commonjs({
        include: 'node_modules/**'
    }),]
}