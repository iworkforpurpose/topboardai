const { bolticClient, TASKS_TABLE_NAME } = require('../config/boltic');

const LEGACY_KEY_MAP = {
  laptop_received: 'laptop_recieved',
  login_details_received: 'email_credentials',
  slack_setup: 'slack_invite',
};

// Align with Boltic table schema (task_key, employee_email, title, description, category, day_number, completed, completed_at, status).
const DEFAULT_TASKS = [
  {
    task_key: 'email_credentials',
    title: 'Have you received your company email credentials?',
    description: 'Confirm you received your corporate email login and password.',
    category: 'Access'
  },
  {
    task_key: 'laptop_recieved',
    title: 'Have you received your laptop or work device?',
    description: 'Confirm your assigned hardware has been delivered.',
    category: 'Logistics'
  },
  {
    task_key: 'slack_invite',
    title: 'Have you received your Slack invitation?',
    description: 'Confirm you received the Slack invite and joined the workspace.',
    category: 'Access'
  }
];

const DEFAULT_TASKS_BY_KEY = DEFAULT_TASKS.reduce((acc, task) => {
  acc[task.task_key] = task;
  return acc;
}, {});

function toCanonicalKey(taskKey) {
  return LEGACY_KEY_MAP[taskKey] || taskKey;
}

async function ensureTasksForEmployee(employeeEmail) {
  if (!TASKS_TABLE_NAME) {
    throw new Error('TASKS_TABLE_NAME is not configured');
  }

  const { data: allTasks, error } = await bolticClient.records.findAll(TASKS_TABLE_NAME);
  if (error) {
    throw new Error(error.message || 'Failed to fetch tasks');
  }

  const normalizedEmail = (employeeEmail || '').trim().toLowerCase();
  const existing = (allTasks || []).filter(t => (t.employee_email || '').trim().toLowerCase() === normalizedEmail);

  // Canonicalize legacy keys and ensure a single task per canonical key
  const existingByKey = new Map();
  for (const task of existing) {
    const canonicalKey = toCanonicalKey(task.task_key);
    const defaults = DEFAULT_TASKS_BY_KEY[canonicalKey];
    const shouldUpdateKey = canonicalKey !== task.task_key;
    const shouldUpdateCopy = defaults && (
      task.title !== defaults.title ||
      task.description !== defaults.description ||
      task.category !== defaults.category
    );

    let updatedTask = { ...task, task_key: canonicalKey };

    if (shouldUpdateKey || shouldUpdateCopy) {
      const patch = {
        task_key: canonicalKey,
        title: defaults?.title || task.title,
        description: defaults?.description || task.description,
        category: defaults?.category || task.category,
      };
      const { data: updated, error: updateError } = await bolticClient.records.updateById(
        TASKS_TABLE_NAME,
        task.id || task._id,
        patch
      );
      if (!updateError && updated) {
        updatedTask = { ...updatedTask, ...updated };
      }
    }

    if (!existingByKey.has(canonicalKey)) {
      existingByKey.set(canonicalKey, updatedTask);
    }
  }

  const existingKeys = new Set(existingByKey.keys());
  const created = [];
  for (const task of DEFAULT_TASKS) {
    if (existingKeys.has(task.task_key)) {
      continue;
    }
    const payload = {
      employee_email: normalizedEmail,
      task_key: task.task_key,
      title: task.title,
      description: task.description,
      category: task.category,
      day_number: 1,
      status: 'PENDING',
      completed: false,
      completed_at: null,
      resource_link: null,
    };
    const { data, error: insertError } = await bolticClient.records.insert(TASKS_TABLE_NAME, payload);
    if (insertError) {
      throw new Error(insertError.message || 'Failed to seed tasks');
    }
    created.push(data);
    existingByKey.set(task.task_key, data);
  }

  return Array.from(existingByKey.values());
}

async function getTasksForEmployee(employeeEmail) {
  const tasks = await ensureTasksForEmployee(employeeEmail);
  return tasks.map(task => {
    const completed = task.completed ?? task.is_completed;
    const normalizedStatus = (typeof task.status === 'string' && task.status.trim())
      ? task.status
      : (completed ? 'COMPLETED' : 'PENDING');
    return {
      id: task.id || task._id,
      employeeEmail: task.employee_email,
      taskKey: task.task_key,
      title: task.title,
      description: task.description,
      category: task.category,
      status: normalizedStatus,
      isCompleted: !!completed,
      completedAt: task.completed_at || null,
    };
  });
}

async function updateTaskStatus(taskId, isCompleted) {
  if (!TASKS_TABLE_NAME) {
    throw new Error('TASKS_TABLE_NAME is not configured');
  }
  const updates = {
    completed: isCompleted,
    status: isCompleted ? 'COMPLETED' : 'PENDING',
    completed_at: isCompleted ? new Date().toISOString() : null,
  };
  const { data, error } = await bolticClient.records.updateById(TASKS_TABLE_NAME, taskId, updates);
  if (error) {
    throw new Error(error.message || 'Failed to update task');
  }
  const completed = data.completed ?? data.is_completed;
  const normalizedStatus = (typeof data.status === 'string' && data.status.trim())
    ? data.status
    : (completed ? 'COMPLETED' : 'PENDING');
  return {
    id: data.id || data._id,
    employeeEmail: data.employee_email,
    taskKey: data.task_key,
    title: data.title,
    description: data.description,
    category: data.category,
    status: normalizedStatus,
    isCompleted: !!completed,
    completedAt: data.completed_at || null,
  };
}

module.exports = {
  getTasksForEmployee,
  updateTaskStatus,
};
