import test from 'node:test';
import assert from 'node:assert/strict';

import { clearTasks, completeTask, createTask, listTasks } from '../src/taskStore.ts';

test('createTask adds a new task with completed=false', () => {
  clearTasks();

  const task = createTask('a1', 'Draft feature request');

  assert.equal(task.id, 'a1');
  assert.equal(task.title, 'Draft feature request');
  assert.equal(task.completed, false);
  assert.deepEqual(listTasks(), [task]);
});

test('completeTask marks an existing task as completed', () => {
  clearTasks();
  createTask('a2', 'Implement baseline');

  const updated = completeTask('a2');

  assert.equal(updated.completed, true);
  assert.equal(listTasks()[0]?.completed, true);
});

test('createTask throws on duplicate id', () => {
  clearTasks();
  createTask('dup', 'First');

  assert.throws(() => createTask('dup', 'Second'), /Task already exists/);
});

test('completeTask throws for unknown task id', () => {
  clearTasks();

  assert.throws(() => completeTask('missing'), /Task not found/);
});
