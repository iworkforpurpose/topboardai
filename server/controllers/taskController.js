const { getTasksForEmployee, updateTaskStatus } = require('../services/taskService');

async function listTasks(req, res) {
  try {
    const employeeEmail = req.query.employeeEmail;
    if (!employeeEmail) {
      return res.status(400).json({ success: false, message: 'employeeEmail is required' });
    }
    const tasks = await getTasksForEmployee(employeeEmail);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch tasks' });
  }
}

async function setTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { isCompleted } = req.body;
    if (typeof isCompleted !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isCompleted boolean is required' });
    }
    const task = await updateTaskStatus(id, isCompleted);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update task' });
  }
}

module.exports = {
  listTasks,
  setTaskStatus,
};
