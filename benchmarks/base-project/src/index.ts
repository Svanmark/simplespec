import { clearTasks, completeTask, createTask, listTasks } from './taskStore.ts';

clearTasks();
createTask('1', 'Write benchmark prompt');
createTask('2', 'Run framework implementation');
completeTask('1');

console.log(listTasks());
