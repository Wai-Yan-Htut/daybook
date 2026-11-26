"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
};

type Filter = "all" | "active" | "completed";

async function responseError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  return typeof body?.error === "string" ? body.error : "Something went wrong. Please try again.";
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks", { cache: "no-store" });
        if (!response.ok) throw new Error(await responseError(response));
        setTasks(await response.json());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load tasks.");
      } finally {
        setLoading(false);
      }
    }

    void loadTasks();
  }, []);

  const remainingCount = tasks.filter((task) => !task.completed).length;
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  }), [filter, tasks]);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, description, completed: false }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const created: Task = await response.json();
      setTasks((current) => [created, ...current]);
      setTitle("");
      setDescription("");
      setFilter("all");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not create the task.");
    } finally {
      setSaving(false);
    }
  }

  async function updateTask(task: Task, completed: boolean) {
    setError("");
    setBusyTaskId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          completed,
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const updated: Task = await response.json();
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update the task.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function deleteTask(task: Task) {
    setError("");
    setBusyTaskId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete the task.");
    } finally {
      setBusyTaskId(null);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Task Manager home">
          <span className="brand-mark" aria-hidden="true">✓</span>
          <span>daybook</span>
        </a>
        <span className="topbar-note">A little more clarity, every day.</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">YOUR PERSONAL TASK LIST</p>
          <h1 id="page-title">Make room for<br className="desktop-break" /> what matters.</h1>
          <p className="intro-copy">One thing at a time. Keep your day moving.</p>
        </div>
        <div className="today-card" aria-label={`${remainingCount} tasks remaining`}>
          <span className="today-label">ON YOUR LIST</span>
          <strong>{remainingCount.toString().padStart(2, "0")}</strong>
          <span className="today-foot">{remainingCount === 1 ? "thing to do" : "things to do"}</span>
        </div>
      </section>

      <div className="workspace">
        <section className="composer-card" aria-labelledby="add-heading">
          <div className="card-heading">
            <span className="heading-icon" aria-hidden="true">＋</span>
            <div>
              <h2 id="add-heading">Add a task</h2>
              <p>Write it down and let it go.</p>
            </div>
          </div>
          <form onSubmit={addTask}>
            <label htmlFor="task-title">Task</label>
            <input
              id="task-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs doing?"
              maxLength={200}
              required
            />
            <label htmlFor="task-description">A little more detail <span>(optional)</span></label>
            <textarea
              id="task-description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a note or a reminder..."
              maxLength={2000}
              rows={4}
            />
            <button className="add-button" type="submit" disabled={saving || !title.trim()}>
              <span aria-hidden="true">＋</span> {saving ? "Adding task…" : "Add to my list"}
            </button>
          </form>
        </section>

        <section className="list-panel" aria-labelledby="list-heading">
          <div className="list-header">
            <div>
              <p className="eyebrow">A FRESH START</p>
              <h2 id="list-heading">Your tasks</h2>
            </div>
            <span className="task-count">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</span>
          </div>

          <div className="filters" role="group" aria-label="Filter tasks">
            {(["all", "active", "completed"] as const).map((value) => (
              <button
                key={value}
                className={filter === value ? "filter-button selected" : "filter-button"}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value === "all" ? "Everything" : value === "active" ? "To do" : "Done"}
              </button>
            ))}
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}

          {loading ? (
            <div className="empty-state"><span className="loader" aria-hidden="true" />Loading your tasks…</div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">✳</span>
              <strong>{tasks.length === 0 ? "Your list is open." : "Nothing here for now."}</strong>
              <span>{tasks.length === 0 ? "Add a task when you’re ready." : "Try another filter to see more tasks."}</span>
            </div>
          ) : (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <li className={task.completed ? "task-row is-complete" : "task-row"} key={task.id}>
                  <button
                    className="complete-button"
                    type="button"
                    aria-label={`${task.completed ? "Mark as to do" : "Complete"}: ${task.title}`}
                    aria-pressed={task.completed}
                    disabled={busyTaskId === task.id}
                    onClick={() => void updateTask(task, !task.completed)}
                  >
                    {task.completed && <span aria-hidden="true">✓</span>}
                  </button>
                  <div className="task-copy">
                    <div className="task-title-line">
                      <h3>{task.title}</h3>
                      {task.completed && <span className="done-tag">DONE</span>}
                    </div>
                    {task.description && <p>{task.description}</p>}
                    <time dateTime={task.createdAt}>Added {formatDate(task.createdAt)}</time>
                  </div>
                  <button
                    className="delete-button"
                    type="button"
                    aria-label={`Delete ${task.title}`}
                    disabled={busyTaskId === task.id}
                    onClick={() => void deleteTask(task)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="footer-note">A clearer day starts with one small step.</footer>
    </main>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
