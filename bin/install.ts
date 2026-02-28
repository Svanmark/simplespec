import './runtimes/index.js';
import Runtime from './runtimes/Runtime.js';

console.log(`Available runtimes: ${Runtime.listAvailableRuntimes().join(', ')}`);
