# Task Manager with Confidence Meter

A smart task management application built with React and Node.js that helps you track not just what needs to be done, but how confident you are about doing it.

**🔗 Live Demo:** [https://ayush-task-manager.vercel.app/](https://ayush-task-manager.vercel.app/)

## 🚀 Advanced Features

### 🧠 Task Confidence Meter
- Every task starts with **100% confidence**.
- **Postponing** a task drops its confidence by **20%**.
- **Completing** a task restores confidence to **100%**.
- Visual progress bars indicate the health of your task list.

### ⚡ Smart Sorting & Prioritization
The task list automatically sorts itself to keep you focused:
1.  **High Severity** tasks always appear at the top.
2.  **Low Confidence** (Postponed) tasks float up next, demanding attention.
3.  Remaining tasks are sorted by Severity and Confidence.

### 📊 Severity Levels
- Categorize tasks as **Low**, **Medium**, or **High**.
- Visual color-coded badges for quick scanning.

### 📈 Real-time Stats
- Dashboard displays the **Average Confidence** of your entire backlog.

## 🛠️ Tech Stack
- **Frontend:** React, CSS3
- **Backend:** Node.js, Express
- **Deployment:** Vercel Configuration included

## 📦 Installation & Running

### Prerequisites
- Node.js installed

### 1. Start the Backend
```bash
cd server
npm install
node index.js
```
Server runs on `http://localhost:5000`

### 2. Start the Frontend
```bash
cd client
npm install
npm start
```
Client runs on `http://localhost:3000`

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get all tasks |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update task (title, status, severity) |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `POST` | `/api/tasks/:id/postpone` | Postpone task (decreases confidence) |

## ☁️ Deployment

This project is configured for **Vercel**.
1. Push to GitHub.
2. Import project in Vercel.
3. Vercel will detect `vercel.json` and deploy both client and server.