console.log("Starting server...");
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data (useful for Postman)

// In-memory database (replace with MongoDB/PostgreSQL in production)
let tasks = [
  { id: 1, title: 'Initialize Project', completed: true, confidence: 100, severity: 'High' },
  { id: 2, title: 'Build REST API', completed: false, confidence: 50, severity: 'Medium' },
];

// --- Explicit Endpoints ---

// Root route
app.get('/', (req, res) => {
  res.send('API is running');
});

// GET: Retrieve all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// GET: Retrieve a single task
app.get('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(task => task.id === id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json(task);
});

// POST: Create a new task
app.post('/api/tasks', (req, res) => {
  const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0;
  
  // Auto-rewrite: Break down vague tasks
  let title = req.body.title;
  if (title.toLowerCase().includes('rest api')) {
    title = "Define 3 endpoints for REST API (15 min)";
  }

  const newTask = {
    id: maxId + 1,
    title: title,
    completed: false,
    confidence: 100, // Start with high confidence
    severity: req.body.severity || 'Medium'
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT: Update an existing task
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.completed !== undefined) task.completed = req.body.completed;
  if (req.body.severity !== undefined) task.severity = req.body.severity;
  
  // Logic: Complete early -> confidence rises
  if (req.body.completed === true) {
    task.confidence = 100;
  }

  res.json(task);
});

// POST: Postpone a task (Confidence drops)
app.post('/api/tasks/:id/postpone', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(task => task.id === id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.completed) {
    return res.status(400).json({ message: 'Cannot postpone a completed task' });
  }

  task.confidence = Math.max(0, (task.confidence || 100) - 20); // Drop confidence
  res.json(task);
});

// DELETE: Remove a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(task => task.id !== id);
  res.json({ message: `Task ${id} deleted` });
});

// Serve static files from the React app
const buildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  // The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
