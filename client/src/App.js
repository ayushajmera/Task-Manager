import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming standard Create React App CSS

const API_URL = '/api/tasks';

// Helper: Sort by High Priority, then Postponed, then others
const sortTasks = (data) => {
  return data.sort((a, b) => {
    const confA = a.confidence !== undefined ? a.confidence : 0;
    const confB = b.confidence !== undefined ? b.confidence : 0;

    // 1. High Priority First
    const isHighA = a.severity === 'High';
    const isHighB = b.severity === 'High';
    if (isHighA !== isHighB) return isHighA ? -1 : 1;

    // 2. Postponed (Confidence < 100) Next
    const isPostponedA = confA < 100;
    const isPostponedB = confB < 100;
    if (isPostponedA !== isPostponedB) return isPostponedA ? -1 : 1;

    // 3. Tie-breakers: Severity (Medium > Low), then Confidence
    const severityWeight = { High: 3, Medium: 2, Low: 1 };
    const sevA = severityWeight[a.severity] || 2;
    const sevB = severityWeight[b.severity] || 2;
    if (sevA !== sevB) return sevB - sevA;
    
    return confA - confB;
  });
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSeverity, setNewTaskSeverity] = useState('Medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch data on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        setTasks(sortTasks(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // 2. Handle Form Submission (POST request)
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, severity: newTaskSeverity }),
      });
      
      const newTask = await response.json();
      // Optimistic UI update: Add to list immediately
      setTasks(prev => sortTasks([...prev, newTask])); 
      setNewTaskTitle('');
      setNewTaskSeverity('Medium');
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // 4. Handle Update (PUT request)
  const handleUpdateTask = async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedTask = await response.json();
      setTasks(prev => {
        const updatedList = prev.map(task => task.id === id ? updatedTask : task);
        return sortTasks(updatedList);
      });
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // 3. Handle Delete (DELETE request)
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // 5. Handle Postpone (Custom Action)
  const handlePostpone = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/postpone`, { method: 'POST' });
      
      // Check if response is JSON (catches 404 HTML responses if server not restarted)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response. Please restart the backend server.");
      }

      if (!response.ok) {
        throw new Error('Failed to postpone task');
      }
      const updatedTask = await response.json();
      setTasks(prevTasks => 
        sortTasks(prevTasks.map(t => t.id === id ? updatedTask : t))
      );
    } catch (err) {
      console.error("Error postponing task:", err);
      alert(err.message); // Alert user to the error
    }
  };

  // Calculate Average Confidence
  const averageConfidence = tasks.length === 0 ? 0 : Math.round(
    tasks.reduce((total, task) => total + (task.confidence || 0), 0) / tasks.length
  );

  if (loading) return <p className="loading">Loading tasks...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="app-container">
      <h1>Task Manager</h1>

      {/* Average Confidence Section */}
      <div className="stats-container">
        <div className="stat-box">
          <span className="stat-label">Average Confidence</span>
          <span className={`stat-value ${averageConfidence < 50 ? 'low-confidence' : 'high-confidence'}`}>
            {averageConfidence}%
          </span>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          className="task-input"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter a new task..."
        />
        <select value={newTaskSeverity} onChange={(e) => setNewTaskSeverity(e.target.value)} className="severity-select">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit" className="btn add-btn">Add Task</button>
      </form>

      {/* Task List */}
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <div className="task-content">
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <input 
                  type="checkbox" 
                  className="task-checkbox"
                  checked={task.completed} 
                  onChange={() => handleUpdateTask(task.id, { completed: !task.completed })}
                />
                <div style={{ flex: 1 }}>
                  <span className={`task-text ${task.completed ? 'task-completed' : ''}`}>
                    {task.title}
                  </span>
                  <span className={`severity-badge severity-${(task.severity || 'Medium').toLowerCase()}`}>{task.severity || 'Medium'}</span>
                  {/* Confidence Meter */}
                  <div className="confidence-meter" title={`Confidence: ${task.confidence}%`}>
                    <div 
                      className="confidence-bar" 
                      style={{ width: `${task.confidence}%`, backgroundColor: task.confidence < 50 ? '#ff4d4d' : '#4caf50' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="task-actions">
              <button 
                type="button"
                className="btn edit-btn"
                onClick={() => {
                  const newTitle = prompt("Update task title:", task.title);
                  if (newTitle) handleUpdateTask(task.id, { title: newTitle });
                }}
              >
                Edit
              </button>
              <button 
                type="button"
                className="btn postpone-btn"
                onClick={() => handlePostpone(task.id)}
                disabled={task.completed}
                style={task.completed ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                Postpone
              </button>
              <button 
                type="button"
                className="btn delete-btn"
                onClick={() => handleDelete(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
