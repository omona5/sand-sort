import {solve} from './engine.js';
self.onmessage=event=>self.postMessage(solve(event.data));
