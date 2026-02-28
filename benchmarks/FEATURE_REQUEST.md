# Feature Request: Add due dates and overdue filtering

You are working in a TypeScript Node.js project that manages in-memory tasks.

Implement the following feature in the existing task store:

## Functional requirements

1. Extend task model to include optional `dueDate` in ISO date format (`YYYY-MM-DD`).
2. Add a function to assign or update due date for an existing task:
   - `setTaskDueDate(taskId: string, dueDate: string): Task`
3. Validate `dueDate` format. Throw an error for invalid format.
4. Add a function to list overdue tasks relative to a provided `today` date:
   - `listOverdueTasks(today: string): Task[]`
5. Overdue means:
   - task is not completed
   - task has a due date
   - due date is strictly earlier than `today`
6. Ensure returned overdue tasks are sorted by due date ascending.

## Non-functional requirements

- Keep all existing functionality working.
- Preserve TypeScript strict typing.
- Add/update tests to cover new behavior and edge cases.
- Keep implementation simple and readable.

## Constraints

- No external date libraries.
- Use only built-in JavaScript/TypeScript capabilities.
