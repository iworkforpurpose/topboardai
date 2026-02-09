const express = require('express');
const router = express.Router();
const { listTasks, setTaskStatus } = require('../controllers/taskController');

// GET /api/tasks?employeeEmail=xxx
router.get('/', listTasks);

// PUT /api/tasks/:id { isCompleted: boolean }
router.put('/:id', setTaskStatus);

module.exports = router;
