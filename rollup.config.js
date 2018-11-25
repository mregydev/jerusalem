
import commonjs from 'rollup-plugin-commonjs';

import { eslint } from 'rollup-plugin-eslint';

import resolve from 'rollup-plugin-node-resolve';


import json from 'rollup-plugin-json';


const isDebug = process.env.NODE_ENV == "debug";

export default {
    plugins: [eslint({}), resolve(), commonjs({
        include: 'node_modules/**', ignore: ["conditional-runtime-dependency"] 
    }),json({})]
}