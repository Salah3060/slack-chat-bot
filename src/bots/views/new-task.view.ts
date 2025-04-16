/**
 * @function getNewTaskView
 * @description Returns the Slack modal view configuration for creating a new task
 * @returns {Object} A Slack modal view object
 */
export function getNewTaskView() {
  return {
    type: 'modal',
    callback_id: 'mudeer_task_modal',
    title: { type: 'plain_text', text: 'New Mudeer Task' },
    submit: { type: 'plain_text', text: 'Create' },
    close: { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'input',
        block_id: 'task_name',
        label: { type: 'plain_text', text: 'Task Name' },
        element: { type: 'plain_text_input', action_id: 'input' },
      },
      {
        type: 'input',
        block_id: 'assignee',
        label: { type: 'plain_text', text: 'Assignee' },
        element: { type: 'users_select', action_id: 'user' },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'due_date',
        label: { type: 'plain_text', text: 'Due Date' },
        element: { type: 'datepicker', action_id: 'date' },
        optional: true,
      },
      {
        type: 'input',
        block_id: 'description',
        label: { type: 'plain_text', text: 'Description' },
        element: {
          type: 'plain_text_input',
          multiline: true,
          action_id: 'desc',
        },
        optional: true,
      },
    ],
  };
}
