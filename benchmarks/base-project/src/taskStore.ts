export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const tasks = new Map<string, Task>();

export function clearTasks(): void {
  tasks.clear();
}

export function createTask(id: string, title: string): Task {
  if (!id.trim()) {
    throw new Error("Task id is required");
  }

  if (!title.trim()) {
    throw new Error("Task title is required");
  }

  if (tasks.has(id)) {
    throw new Error(`Task already exists: ${id}`);
  }

  const task: Task = {
    id,
    title,
    completed: false
  };

  tasks.set(id, task);
  return task;
}

export function completeTask(id: string): Task {
  const existing = tasks.get(id);
  if (!existing) {
    throw new Error(`Task not found: ${id}`);
  }

  const updated: Task = {
    ...existing,
    completed: true
  };

  tasks.set(id, updated);
  return updated;
}

export function listTasks(): Task[] {
  return Array.from(tasks.values());
}
