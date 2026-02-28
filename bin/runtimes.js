import Runtime from './runtimes/Runtime.js';
import kilocode from './runtimes/Kilocode.js';

Runtime.registerRuntime('kilocode', kilocode);

const runtimes = {
  kilocode,
};

export default runtimes;
