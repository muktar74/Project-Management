// Fix: Changed import from CommonJS-style 'require' to standard ES module 'import'.
import express, { json } from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
const port = 4000;

// Middleware
app.use(cors());
// Fix: Use the named import 'json' to correctly apply the JSON body-parsing middleware.
// This resolves a TypeScript overload resolution issue with `app.use(express.json())`.
app.use(json());

// --- DATABASE CONNECTION ---
// IMPORTANT: Replace with your actual PostgreSQL connection details
const pool = new Pool({
  user: 'postgres',       // Your PostgreSQL username (often 'postgres')
  host: 'localhost',      // Or the IP address of your database server
  database: 'zamzam_project_hub',
  password: 'YOUR_PASSWORD_HERE', // <<<<<<<<<<<<<<<  REPLACE WITH YOUR POSTGRESQL PASSWORD
  port: 5432,             // Default PostgreSQL port
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!! Error connecting to the database', err.stack);
    console.error('!!! Please ensure PostgreSQL is running and the password in server.ts is correct.');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  } else {
    console.log('✅ Database connected successfully at', res.rows[0].now);
  }
});


// --- API ENDPOINTS (ROUTES) ---

// ====== USERS ======
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY name');
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/users', async (req, res) => {
    const { id, name, email, avatar, role, settings } = req.body;
    try {
        const query = 'INSERT INTO users(id, name, email, avatar, role, settings) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
        const result = await pool.query(query, [id, name, email, avatar, role, settings]);
        res.status(201).json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.put('/api/users/:id/profile', async (req, res) => {
    const { id } = req.params;
    const { name, email, avatar } = req.body;
    try {
        const query = 'UPDATE users SET name = $1, email = $2, avatar = $3 WHERE id = $4 RETURNING *';
        const result = await pool.query(query, [name, email, avatar, id]);
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.put('/api/users/:id/settings', async (req, res) => {
    const { id } = req.params;
    const { settings } = req.body;
    try {
        const query = 'UPDATE users SET settings = $1 WHERE id = $2 RETURNING *';
        const result = await pool.query(query, [settings, id]);
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});


// ====== PROJECTS ======
app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id, p.name, p.description, p.status, p.progress,
                p.start_date as "startDate", 
                p.end_date as "endDate", 
                COALESCE(json_agg(pm.user_id) FILTER (WHERE pm.user_id IS NOT NULL), '[]') as team
            FROM projects p
            LEFT JOIN project_members pm ON p.id = pm.project_id
            GROUP BY p.id
            ORDER BY p.start_date DESC
        `);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/projects', async (req, res) => {
    const { id, name, description, startDate, endDate, status, progress, team } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const projectInsert = `
            INSERT INTO projects(id, name, description, start_date, end_date, status, progress) 
            VALUES($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id, name, description, status, progress, start_date as "startDate", end_date as "endDate"`;
        const projectResult = await client.query(projectInsert, [id, name, description, startDate, endDate, status, progress]);
        
        if (team && team.length > 0) {
            const memberInsert = 'INSERT INTO project_members(project_id, user_id) VALUES($1, $2)';
            for (const userId of team) { await client.query(memberInsert, [id, userId]); }
        }
        await client.query('COMMIT');
        const savedProject = { ...projectResult.rows[0], team: team || [] };
        res.status(201).json(savedProject);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally { client.release(); }
});

app.put('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, startDate, endDate, status, progress, team } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const projectUpdate = `
            UPDATE projects SET name = $1, description = $2, start_date = $3, end_date = $4, status = $5, progress = $6 
            WHERE id = $7 
            RETURNING id, name, description, status, progress, start_date as "startDate", end_date as "endDate"`;
        const projectResult = await client.query(projectUpdate, [name, description, startDate, endDate, status, progress, id]);

        await client.query('DELETE FROM project_members WHERE project_id = $1', [id]);
        if (team && team.length > 0) {
            const memberInsert = 'INSERT INTO project_members(project_id, user_id) VALUES($1, $2)';
            for (const userId of team) { await client.query(memberInsert, [id, userId]); }
        }
        await client.query('COMMIT');
        const updatedProject = { ...projectResult.rows[0], team: team || [] };
        res.json(updatedProject);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally { client.release(); }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});


// ====== TASKS ======
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.id, t.title, t.description, t.status, t."order", t.priority, t.reminder,
                t.project_id as "projectId",
                t.assignee_id as "assigneeId",
                t.due_date as "dueDate",
                COALESCE(json_agg(td.dependency_id) FILTER (WHERE td.dependency_id IS NOT NULL), '[]') as dependencies
            FROM tasks t
            LEFT JOIN task_dependencies td ON t.id = td.task_id
            GROUP BY t.id
            ORDER BY t."order" ASC
        `);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/tasks', async (req, res) => {
    const { id, title, description, projectId, assigneeId, status, dueDate, order, priority, reminder } = req.body;
    try {
        const query = `
            INSERT INTO tasks(id, title, description, project_id, assignee_id, status, due_date, "order", priority, reminder) 
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING id, title, description, status, "order", priority, reminder,
                      project_id as "projectId", assignee_id as "assigneeId", due_date as "dueDate"`;
        const result = await pool.query(query, [id, title, description, projectId, assigneeId, status, dueDate, order, priority, reminder]);
        res.status(201).json({...result.rows[0], dependencies: []});
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, assigneeId, status, dueDate, order, dependencies, reminder, priority } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const taskUpdate = `
            UPDATE tasks SET title=$1, description=$2, assignee_id=$3, status=$4, due_date=$5, "order"=$6, reminder=$7, priority=$8 
            WHERE id=$9 
            RETURNING id, title, description, status, "order", priority, reminder,
                      project_id as "projectId", assignee_id as "assigneeId", due_date as "dueDate"`;
        const taskResult = await client.query(taskUpdate, [title, description, assigneeId, status, dueDate, order, reminder, priority, id]);

        await client.query('DELETE FROM task_dependencies WHERE task_id = $1', [id]);
        if (dependencies && dependencies.length > 0) {
            const depInsert = 'INSERT INTO task_dependencies(task_id, dependency_id) VALUES($1, $2)';
            for (const depId of dependencies) { await client.query(depInsert, [id, depId]); }
        }
        await client.query('COMMIT');
        const updatedTask = { ...taskResult.rows[0], dependencies: dependencies || [] };
        res.json(updatedTask);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally { client.release(); }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
        res.status(204).send();
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});


// ====== LOGS ======
app.get('/api/logs', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                l.id, l.challenges,
                l.project_id as "projectId", 
                l.user_id as "userId", 
                l.log_date as "date", 
                l.yesterdays_tasks as "yesterdaysTasks", 
                l.todays_plan as "todaysPlan",
                COALESCE(json_agg(lc.user_id) FILTER (WHERE lc.user_id IS NOT NULL), '[]') as "collaboratorIds"
            FROM logs l
            LEFT JOIN log_collaborators lc ON l.id = lc.log_id
            GROUP BY l.id
            ORDER BY l.log_date DESC, l.id DESC
        `);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/logs', async (req, res) => {
    const { id, projectId, userId, date, yesterdaysTasks, todaysPlan, challenges, collaboratorIds } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const logInsert = `
            INSERT INTO logs(id, project_id, user_id, log_date, yesterdays_tasks, todays_plan, challenges) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id, challenges, project_id as "projectId", user_id as "userId", log_date as "date", 
                      yesterdays_tasks as "yesterdaysTasks", todays_plan as "todaysPlan"
        `;
        const logResult = await client.query(logInsert, [id, projectId, userId, date, yesterdaysTasks, todaysPlan, challenges]);

        if (collaboratorIds && collaboratorIds.length > 0) {
            const collabInsert = 'INSERT INTO log_collaborators(log_id, user_id) VALUES($1, $2)';
            for (const collabId of collaboratorIds) { await client.query(collabInsert, [id, collabId]); }
        }
        await client.query('COMMIT');
        const savedLog = { ...logResult.rows[0], collaboratorIds: collaboratorIds || [] };
        res.status(201).json(savedLog);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally { client.release(); }
});


// ====== COMMENTS ======
app.get('/api/comments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, text, timestamp, task_id as "taskId", user_id as "userId" 
            FROM comments 
            ORDER BY timestamp ASC
        `);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/comments', async (req, res) => {
    const { id, taskId, userId, text, timestamp } = req.body;
    try {
        const query = `
            INSERT INTO comments(id, task_id, user_id, text, timestamp) 
            VALUES($1, $2, $3, $4, $5) 
            RETURNING id, text, timestamp, task_id as "taskId", user_id as "userId"`;
        const result = await pool.query(query, [id, taskId, userId, text, timestamp]);
        res.status(201).json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});


// ====== NOTIFICATIONS ======
app.get('/api/notifications', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, message, timestamp, 
                   recipient_id as "recipientId", 
                   sender_id as "senderId", 
                   is_read as "isRead" 
            FROM notifications 
            ORDER BY timestamp DESC
        `);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/api/notifications', async (req, res) => {
    const { notifications } = req.body; // Expect an array of notifications
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const query = 'INSERT INTO notifications(id, recipient_id, sender_id, message, timestamp, is_read) VALUES($1, $2, $3, $4, $5, $6)';
        const createdNotifications = [];
        for (const n of notifications) {
             await client.query(query, [n.id, n.recipientId, n.senderId, n.message, n.timestamp, n.isRead]);
             createdNotifications.push(n);
        }
        await client.query('COMMIT');
        res.status(201).json(createdNotifications);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally { client.release(); }
});

app.put('/api/notifications/:id', async (req, res) => {
    const { id } = req.params;
    const { isRead } = req.body;
    try {
        const query = `
            UPDATE notifications SET is_read = $1 WHERE id = $2 
            RETURNING id, message, timestamp, is_read as "isRead", 
                      recipient_id as "recipientId", sender_id as "senderId"`;
        const result = await pool.query(query, [isRead, id]);
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

app.put('/api/notifications/mark-all-read', async (req, res) => {
    const { recipientId } = req.body;
    try {
        const query = `
            UPDATE notifications SET is_read = true 
            WHERE recipient_id = $1 AND is_read = false 
            RETURNING id, message, timestamp, is_read as "isRead", 
                      recipient_id as "recipientId", sender_id as "senderId"`;
        const result = await pool.query(query, [recipientId]);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// SERVER START
app.listen(port, () => {
  console.log(`✅ Backend server is running at http://localhost:${port}`);
});
