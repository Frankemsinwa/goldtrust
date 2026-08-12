const { query } = require('../config/db');

// ── USER-FACING ──

// List active tasks + each task's submission state for the current user
const getUserTasks = async (req, res) => {
    try {
        const tasks = await query(
            `SELECT t.*, 
                s.id AS submission_id, s.status AS submission_status, 
                s.proof_url AS submission_proof, s.rejected_reason
             FROM tasks t
             LEFT JOIN task_submissions s ON s.task_id = t.id AND s.user_id = $1
             WHERE t.status = 'active'
             ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(tasks.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks', message: err.message });
    }
};

// Fetch the user's task earnings balance
const getRewardBalance = async (req, res) => {
    try {
        const wallet = await query(
            'SELECT balance FROM wallets WHERE user_id = $1 AND type = $2',
            [req.user.id, 'REWARDS']
        );
        res.json({ balance: wallet.rows.length ? parseFloat(wallet.rows[0].balance) : 0 });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reward balance', message: err.message });
    }
};

// Submit a task with proof
const submitTask = async (req, res) => {
    const { taskId } = req.params;
    let { proof } = req.body;

    if (req.file) {
        proof = req.file.path || req.file.secure_url;
    }

    if (!proof) {
        return res.status(400).json({ error: 'Proof is required to submit a task' });
    }

    try {
        const taskResult = await query('SELECT * FROM tasks WHERE id = $1 AND status = $2', [taskId, 'active']);
        if (taskResult.rows.length === 0) {
            return res.status(400).json({ error: 'Task not found or no longer active' });
        }
        const task = taskResult.rows[0];

        // Prevent duplicate pending/approved submission
        const existing = await query(
            `SELECT * FROM task_submissions 
             WHERE task_id = $1 AND user_id = $2 AND status IN ('pending','approved')`,
            [taskId, req.user.id]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'You have already submitted this task' });
        }

        const result = await query(
            'INSERT INTO task_submissions (task_id, user_id, proof_url, status, reward) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [taskId, req.user.id, proof, 'pending', task.reward]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit task', message: err.message });
    }
};

// ── ADMIN-FACING ──

// List all tasks (admin)
const getAdminTasks = async (req, res) => {
    try {
        const result = await query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks', message: err.message });
    }
};

// Create a task
const createTask = async (req, res) => {
    const { title, description, how_to, link, reward } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Task title is required' });
    }
    try {
        const result = await query(
            'INSERT INTO tasks (title, description, how_to, link, reward, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [title, description, how_to, link, parseFloat(reward) || 0.5, 'active']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task', message: err.message });
    }
};

// Toggle task active/inactive
const setTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }
    try {
        await query('UPDATE tasks SET status = $1 WHERE id = $2', [status, id]);
        res.json({ message: `Task ${status}` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task', message: err.message });
    }
};

// List all submissions (admin)
const getAdminSubmissions = async (req, res) => {
    try {
        const result = await query(
            `SELECT s.*, t.title AS task_title, t.reward AS task_reward, u.full_name, u.email
             FROM task_submissions s
             JOIN tasks t ON s.task_id = t.id
             JOIN users u ON s.user_id = u.id
             ORDER BY s.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch submissions', message: err.message });
    }
};

// Approve or reject a submission
const reviewSubmission = async (req, res) => {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Action must be approve or reject' });
    }

    try {
        const subResult = await query('SELECT * FROM task_submissions WHERE id = $1', [id]);
        if (subResult.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        const sub = subResult.rows[0];

        if (sub.status !== 'pending') {
            return res.status(400).json({ error: 'Submission has already been reviewed' });
        }

        await query('BEGIN');

        if (action === 'approve') {
            // Credit reward to the user's REWARDS wallet (invest-only balance)
            await query(
                'UPDATE task_submissions SET status = $1, reviewed_by = $2, reviewed_at = $3 WHERE id = $4',
                ['approved', req.user.id, new Date(), id]
            );
            await query(
                'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2 AND type = $3',
                [sub.reward, sub.user_id, 'REWARDS']
            );
            await query(
                'INSERT INTO transactions (user_id, type, amount, status, metadata) VALUES ($1, $2, $3, $4, $5)',
                [sub.user_id, 'TASK_REWARD', sub.reward, 'completed', JSON.stringify({ submissionId: id, taskId: sub.task_id })]
            );
        } else {
            await query(
                'UPDATE task_submissions SET status = $1, reviewed_by = $2, reviewed_at = $3, rejected_reason = $4 WHERE id = $5',
                ['rejected', req.user.id, new Date(), reason || null, id]
            );
        }

        await query('COMMIT');
        res.json({ message: `Submission ${action}d successfully` });
    } catch (err) {
        await query('ROLLBACK');
        res.status(500).json({ error: 'Failed to review submission', message: err.message });
    }
};

module.exports = {
    getUserTasks,
    getRewardBalance,
    submitTask,
    getAdminTasks,
    createTask,
    setTaskStatus,
    getAdminSubmissions,
    reviewSubmission
};
