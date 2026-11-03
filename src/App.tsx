import { useEffect, useState } from 'react';

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent
} from '@dnd-kit/core';

import { useDraggable, useDroppable } from '@dnd-kit/core';

import { initializeGuestSession } from './services/auth';

import {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
  type Task
} from './services/tasks';

import './App.css';

function getDueDateStatus(dueDate: string | null) {
  if (!dueDate) return null;

  // Compare calendar dates, ignoring the current time.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${dueDate}T00:00:00`);
  const difference = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (difference < 0) return "overdue";
  if (difference <= 3) return "due-soon";
  return "on-track";
}

const columns: { id: Task['status']; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' }
];

// Makes an individual task draggable
function DraggableTaskCard({
  task,
  onDelete,
  onMove,
  onPriorityChange
}: {
  task: Task;
  onDelete: (id: string) => void;
  onMove: (id: string, status: Task['status']) => void;
  onPriorityChange: (
    id: string,
    priority: Task['priority']
  ) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: task.id
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="task-card"
    >
    <div className="task-card-header">
        <button
            className="drag-handle"
            {...listeners}
            {...attributes}
            aria-label={`Drag ${task.title}`}
            title="Drag task"
        >
            ⠿
        </button>

        <h3>{task.title}</h3>
    </div>
    

      <div className="task-card-content">

        <select
          className={`priority-select priority-${task.priority}`}
          value={task.priority}
          onChange={(event) =>
            onPriorityChange(
              task.id,
              event.target.value as Task['priority']
            )
          }
          aria-label={`Change priority for ${task.title}`}
        >
          <option value="low">Low Priority</option>
          <option value="normal">Normal Priority</option>
          <option value="high">High Priority</option>
        </select>

        {task.description && (
          <p className="task-description">
            {task.description}
          </p>
        )}

        {task.due_date && (
            <>
                <p className="due-date">
                    Due: {task.due_date}
                </p>

                <span className={`due-date-indicator ${getDueDateStatus(task.due_date)}`}>
                    {getDueDateStatus(task.due_date) === "overdue"
                        ? "Overdue"
                        : getDueDateStatus(task.due_date) === "due-soon"
                        ? "Due soon"
                        : "On track"}
                </span>
            </>
        )}
            
            

        <select
            className="status-select"
            value={task.status}
            onChange={(event) =>
                onMove(
                task.id,
                event.target.value as Task['status']
                )
            }
            aria-label={`Move ${task.title}`}
        >
          {columns.map((option) => (
            <option key={option.id} value={option.id}>
              Move to {option.title}
            </option>
          ))}
        </select>

        <button
          className="delete-button"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>

      <p className="task-user_id">
        User ID: {task.user_id}
      </p>
    </article>
  );
}

// Makes a column accept dropped tasks
function BoardColumn({
  column,
  tasks,
  onDelete,
  onMove,
  onPriorityChange
}: {
  column: (typeof columns)[number];
  tasks: Task[];
  onDelete: (id: string) => void;
  onMove: (id: string, status: Task['status']) => void;
  onPriorityChange: (
    id: string,
    priority: Task['priority']
  ) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id
  });

  return (
    <div
      ref={setNodeRef}
      className={`column ${isOver ? 'column-over' : ''}`}
    >
      <div className="column-header">
        <h2>{column.title}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onMove={onMove}
            onPriorityChange={onPriorityChange}
          />
        ))}

        {tasks.length === 0 && (
          <p className="empty-message">No tasks yet</p>
        )}
      </div>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] =
    useState<Task['priority']>('normal');
  const [newDueDate, setNewDueDate] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    })
  );

  async function loadTasks() {
    const taskData = await getTasks();
    setTasks(taskData);
  }

  useEffect(() => {
    async function connect() {
      try {
        await initializeGuestSession();
        await loadTasks();
      } catch (err) {
        console.error(err);
        setError('Could not load your tasks.');
      } finally {
        setLoading(false);
      }
    }

    connect();
  }, []);

  async function handleAddTask() {
    if (!newTask.trim()) return;

    try {
      await createTask(
        newTask.trim(),
        newDescription.trim(),
        newPriority,
        newDueDate || null
      );

      setNewTask('');
      setNewDescription('');
      setNewPriority('normal');
      setNewDueDate('');

      await loadTasks();
    } catch (err) {
      console.error(err);
      setError('Could not create task.');
    }
  }

  async function handleMoveTask(
    id: string,
    status: Task['status']
  ) {
    try {
      await updateTaskStatus(id, status);
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError('Could not update task.');
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError('Could not delete task.');
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const destination = columns.find(
      (column) => column.id === String(over.id)
    );

    if (!destination) return;

    const task = tasks.find(
      (item) => item.id === String(active.id)
    );

    if (!task || task.status === destination.id) return;

    await handleMoveTask(task.id, destination.id);
  }

  async function handlePriorityChange(
    id: string,
    priority: Task['priority']
  ) {
    try {
      await updateTaskPriority(id, priority);
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError('Could not update priority.');
    }
  }

  const taskStats = [
    {
      label: 'Total Tasks',
      count: tasks.length
    },
    {
      label: 'To Do',
      count: tasks.filter(task => task.status === 'todo').length,
      high: tasks.filter(task => task.status === 'todo' && task.priority === 'high').length,
      normal: tasks.filter(task => task.status === 'todo' && task.priority === 'normal').length,
      low: tasks.filter(task => task.status === 'todo' && task.priority === 'low').length
    },
    {
      label: 'In Progress',
      count: tasks.filter(task => task.status === 'in_progress').length,
      high: tasks.filter(task => task.status === 'in_progress' && task.priority === 'high').length,
      normal: tasks.filter(task => task.status === 'in_progress' && task.priority === 'normal').length,
      low: tasks.filter(task => task.status === 'in_progress' && task.priority === 'low').length
    },
    {
      label: 'In Review',
      count: tasks.filter(task => task.status === 'in_review').length,
      high: tasks.filter(task => task.status === 'in_review' && task.priority === 'high').length,
      normal: tasks.filter(task => task.status === 'in_review' && task.priority === 'normal').length,
      low: tasks.filter(task => task.status === 'in_review' && task.priority === 'low').length
    },
    {
      label: 'Completed',
      count: tasks.filter(task => task.status === 'done').length,
      high: tasks.filter(task => task.status === 'done' && task.priority === 'high').length,
      normal: tasks.filter(task => task.status === 'done' && task.priority === 'normal').length,
      low: tasks.filter(task => task.status === 'done' && task.priority === 'low').length
    }
  ];

  if (loading) {
    return <p className="loading">Loading your board...</p>;
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">TASK BOARD</p>
          <h1>My Task Board</h1>
          <p className="subtitle">
            Keep track of what you're working on.
          </p>
        </div>
      </header>

      <section className="task-input">
        <input
          value={newTask}
          onChange={(event) => setNewTask(event.target.value)}
          placeholder="Task Title"
        />

        <input
          value={newDescription}
          onChange={(event) => setNewDescription(event.target.value)}
          placeholder="Task description..."
        />

        <select
          value={newPriority}
          onChange={(event) =>
            setNewPriority(event.target.value as Task['priority'])
          }
        >
          <option value="low">Low Priority</option>
          <option value="normal">Normal Priority</option>
          <option value="high">High Priority</option>
        </select>

        <input
          type="date"
          value={newDueDate}
          onChange={(event) => setNewDueDate(event.target.value)}
        />

        <button onClick={handleAddTask}>+ Add Task</button>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="dashboard-stats">
        {taskStats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <h2>{stat.count}</h2>

            {'high' in stat && (
              <div className="priority-stats">
                <span className="high-text">
                  High: {stat.high}
                </span>

                <span className="normal-text">
                  Normal: {stat.normal}
                </span>

                <span className="low-text">
                  Low: {stat.low}
                </span>
              </div>
            )}
          </div>
        ))}
      </section>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <section className="board">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={tasks.filter(
                (task) => task.status === column.id
              )}
              onDelete={handleDeleteTask}
              onMove={handleMoveTask}
              onPriorityChange={handlePriorityChange}
            />
          ))}
        </section>
      </DndContext>
    </main>
  );
}

export default App;
