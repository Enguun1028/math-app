// Before dev and build: copy JSXGraph (MIT or LGPL) into public/vendor/, so the graph calculator can load it
// as its own file when it opens instead of making the app's single page bigger.
import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('public/vendor', { recursive: true });
copyFileSync('node_modules/jsxgraph/distrib/jsxgraphcore.js', 'public/vendor/jsxgraphcore.js');
copyFileSync('node_modules/jsxgraph/LICENSE.MIT', 'public/vendor/jsxgraph-LICENSE.txt');
