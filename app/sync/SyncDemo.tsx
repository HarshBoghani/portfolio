'use client';

/**
 * ============================================================
 * Sync Engine Demo
 * ============================================================
 *
 * Interactive demo showing the sync engine in action.
 * Features:
 * - Create, update, delete tasks (like Linear issues)
 * - String search/filter across tasks
 * - Status and priority filtering
 * - Real-time sync status indicator
 * - Sync ID display (shows the global version)
 *
 * This demonstrates the core concepts from Linear's sync engine:
 * - Optimistic updates (UI updates instantly)
 * - Transactions (mutations are packaged and sent to server)
 * - Delta sync (server broadcasts changes via syncId)
 * - Offline resilience (pending transactions queue)
 */

import { useState } from 'react';
import { useSyncEngine, useModel, useSearch } from '@/sync/hooks';
import '@/sync/models'; // Register models
import {
  createTaskData,
  TaskStatus,
  TaskPriority,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from '@/sync/models/task';
import type { TaskStatusType, TaskPriorityType } from '@/sync/models/task';
import type { SyncRecord } from '@/sync/core/types';
import { syncFeedbackSchema } from '@/lib/sync-feedback-schema';
import {
  taskCreateSchema,
  taskUpdateSchema,
  MAX_TODO_TITLE_LENGTH,
  MAX_TOTAL_TODOS,
} from '@/lib/sync-task-schema';
import { isProfane } from '@/lib/bad-words-filter';
import SyncPageViews from '@/components/ui/SyncPageViews';

// ============================================================
// Status Badge Component
// ============================================================

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    [TaskStatus.TODO]:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [TaskStatus.IN_PROGRESS]:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    [TaskStatus.DONE]:
      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    [TaskStatus.CANCELLED]:
      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  const icons: Record<string, string> = {
    [TaskStatus.TODO]: '\u25CB', // ○
    [TaskStatus.IN_PROGRESS]: '\u25D4', // ◔
    [TaskStatus.DONE]: '\u25CF', // ●
    [TaskStatus.CANCELLED]: '\u2715', // ✕
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? colors[TaskStatus.TODO]}`}
    >
      <span>{icons[status] ?? icons[TaskStatus.TODO]}</span>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ============================================================
// Priority Badge Component
// ============================================================

function PriorityBadge({ priority }: { priority: number }) {
  const colors: Record<number, string> = {
    [TaskPriority.NONE]: 'text-gray-400',
    [TaskPriority.LOW]: 'text-blue-500',
    [TaskPriority.MEDIUM]: 'text-yellow-500',
    [TaskPriority.HIGH]: 'text-orange-500',
    [TaskPriority.URGENT]: 'text-red-500',
  };

  const bars = priority || 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs ${colors[priority] ?? colors[0]}`}
      title={PRIORITY_LABELS[priority] ?? 'No priority'}
    >
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`inline-block h-3 w-0.5 rounded-full ${
            i <= bars ? 'bg-current' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </span>
  );
}

// ============================================================
// Task Row Component
// ============================================================

function TaskRow({
  record,
  onUpdate,
  onDelete,
}: {
  record: SyncRecord;
  onUpdate: (id: string, changes: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(record.data.title as string);
  const [editError, setEditError] = useState<string | null>(null);

  const handleSaveTitle = () => {
    setEditError(null);
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === record.data.title) {
      setIsEditing(false);
      return;
    }
    const parsed = taskUpdateSchema.safeParse({ title: trimmed });
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? 'Invalid title');
      return;
    }
    if (isProfane(parsed.data.title!)) {
      setEditError('Please use appropriate language');
      return;
    }
    onUpdate(record.id, { title: parsed.data.title });
    setIsEditing(false);
  };

  const cycleStatus = () => {
    const order: TaskStatusType[] = [
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];
    const currentIndex = order.indexOf(record.data.status as TaskStatusType);
    const nextStatus = order[(currentIndex + 1) % order.length];
    onUpdate(record.id, { status: nextStatus });
  };

  const cyclePriority = () => {
    const current = (record.data.priority as number) ?? 0;
    const next = current >= 4 ? 0 : current + 1;
    onUpdate(record.id, { priority: next });
  };

  return (
    <div className="group flex flex-col gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 transition-all hover:border-gray-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:contents">
        {/* Status toggle */}
        <button
          onClick={cycleStatus}
          className="order-1 shrink-0 transition-transform hover:scale-110"
          title="Click to cycle status"
        >
          <StatusBadge status={record.data.status as string} />
        </button>

        {/* Title */}
        <div className="order-3 min-w-0 flex-1 sm:order-2">
          {isEditing ? (
            <div className="flex flex-col gap-0.5">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value.slice(0, MAX_TODO_TITLE_LENGTH));
                  setEditError(null);
                }}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setEditTitle(record.data.title as string);
                    setEditError(null);
                    setIsEditing(false);
                  }
                }}
                maxLength={MAX_TODO_TITLE_LENGTH}
                className="w-full rounded border border-blue-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-600 dark:bg-gray-800/50"
                autoFocus
              />
              {editError && (
                <span className="text-[10px] text-red-500">{editError}</span>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setEditTitle(record.data.title as string);
                setIsEditing(true);
              }}
              className={`block w-full truncate text-left text-sm ${
                record.data.status === TaskStatus.DONE
                  ? 'text-gray-400 line-through dark:text-gray-600'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {record.data.title as string}
            </button>
          )}
          {(record.data.description as string) && (
            <p className="mt-0.5 truncate text-xs text-gray-400">
              {record.data.description as string}
            </p>
          )}
        </div>

        {/* Priority */}
        <button
          onClick={cyclePriority}
          className="order-2 shrink-0 transition-transform hover:scale-110 sm:order-3"
          title="Click to cycle priority"
        >
          <PriorityBadge priority={record.data.priority as number} />
        </button>

        {/* Delete button */}
        <button
          onClick={() => onDelete(record.id)}
          className="order-5 shrink-0 rounded p-1.5 text-gray-300 opacity-100 transition-all hover:bg-red-50 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 dark:text-gray-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="Delete task"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Create Task Form
// ============================================================

function CreateTaskForm({
  onCreate,
  taskCount,
}: {
  onCreate: (data: Record<string, unknown>) => void;
  taskCount: number;
}) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatusType>(TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriorityType>(TaskPriority.NONE);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = taskCreateSchema.safeParse({
      title: title.trim(),
      status,
      priority,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    if (isProfane(parsed.data.title)) {
      setError('Please use appropriate language');
      return;
    }
    if (taskCount >= MAX_TOTAL_TODOS) {
      setError(`Maximum ${MAX_TOTAL_TODOS} tasks allowed`);
      return;
    }

    onCreate(
      createTaskData({
        title: parsed.data.title,
        status,
        priority,
      })
    );
    setTitle('');
    setStatus(TaskStatus.TODO);
    setPriority(TaskPriority.NONE);
  };

  const atLimit = taskCount >= MAX_TOTAL_TODOS;
  const canSubmit =
    title.trim().length > 0 &&
    title.trim().length <= MAX_TODO_TITLE_LENGTH &&
    !atLimit;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value.slice(0, MAX_TODO_TITLE_LENGTH));
            setError(null);
          }}
          placeholder={
            atLimit
              ? `Max ${MAX_TOTAL_TODOS} tasks reached`
              : `Create a new task (max ${MAX_TODO_TITLE_LENGTH} chars)...`
          }
          maxLength={MAX_TODO_TITLE_LENGTH}
          disabled={atLimit}
          className="min-h-[44px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-600"
        />
        {error && <span className="text-[10px] text-red-500">{error}</span>}
      </div>
      <div className="flex gap-2 sm:flex-shrink-0">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatusType)}
          className="min-h-[44px] flex-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 sm:flex-initial"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) =>
            setPriority(Number(e.target.value) as TaskPriorityType)
          }
          className="min-h-[44px] flex-1 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs dark:border-gray-700 dark:bg-gray-900 sm:flex-initial"
        >
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors active:bg-blue-800 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-shrink-0"
      >
        Add
      </button>
    </form>
  );
}

// ============================================================
// Collapsible Section (keeps exact same UI, adds collapse)
// ============================================================

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="border-t border-dashed border-gray-200 px-4 pb-4 pt-3 dark:border-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Architecture Diagram
// ============================================================

function ArchitectureDiagramContent() {
  return (
    <pre className="overflow-x-auto text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
      {`
  CLIENT (Browser)                          SERVER (API Routes)
  ┌──────────────────────────────┐          ┌─────────────────────────┐
  │                              │          │                         │
  │  ┌────────────────────────┐  │  push    │  ┌───────────────────┐  │
  │  │  Object Pool (Memory)  │◄─┼──────────┼──│  Server Store     │  │
  │  │  Map<key, SyncRecord>  │──┼──────────┼──│  (syncId counter) │  │
  │  └────────┬───────────────┘  │  delta   │  └───────────────────┘  │
  │           │                  │          │    ▲                    │
  │           ▼                  │          │    │ syncLog            │
  │  ┌────────────────────────┐  │          │    │ (ordered WAL)      │
  │  │  IndexedDB             │  │          │                         │
  │  │  - Records per model   │  │  pull    │  Each action gets a     │
  │  │  - Pending TX queue    │  │◄─────────│  monotonically          │
  │  │  - lastSyncId          │  │  delta   │  increasing syncId      │
  │  └────────────────────────┘  │          │                         │
  │                              │          │  Conflict resolution:   │
  │  Write: Optimistic update    │          │  Last-Write-Wins (LWW)  │
  │  Read: From Object Pool      │          │                         │
  └──────────────────────────────┘          └─────────────────────────┘
`}
    </pre>
  );
}

// ============================================================
// Sync Explain (Linear, my sync, WebSocket)
// ============================================================

function SyncExplainContent() {
  return (
    <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
      <p>
        <strong className="text-gray-700 dark:text-gray-300">
          Linear&apos;s approach:
        </strong>{' '}
        Linear uses an object pool in memory, IndexedDB for offline persistence,
        and a sync log with monotonically increasing syncIds. Delta packets are
        pushed to clients via WebSocket for real-time updates.
      </p>
      <p>
        <strong className="text-gray-700 dark:text-gray-300">
          My implementation:
        </strong>{' '}
        I mirror the same concepts—object pool, IndexedDB, optimistic updates,
        Last-Write-Wins conflict resolution—but use polling instead of WebSocket
        for simplicity.
      </p>
      <p>
        <strong className="text-amber-600 dark:text-amber-400">
          WebSocket note:
        </strong>{' '}
        I am <em>not</em> using WebSocket right now. I could and should—it would
        give instant push of deltas instead of periodic polling. The API and
        sync engine design support swapping polling for WebSocket/SSE later.
      </p>
    </div>
  );
}

// ============================================================
// API Routes Info (how I do it – from app/api/sync)
// ============================================================

function ApiRoutesInfoContent() {
  const routes = [
    {
      method: 'GET',
      path: '/api/sync/bootstrap',
      description:
        'Full initial load – returns all records and current syncId. Used when a client connects for the first time or when the local database needs to be rebuilt. Returns BootstrapResponse { records, syncId, models }.',
    },
    {
      method: 'GET',
      path: '/api/sync/pull?sinceSyncId=N',
      description:
        'Returns all changes since a given syncId. Linear uses WebSocket for delta push; I use polling: clients periodically call this to check for new changes. Client sends lastSyncId → server returns actions after that → client applies to local state. Response: PullResponse { delta }.',
    },
    {
      method: 'POST',
      path: '/api/sync/push',
      description:
        'Receives a transaction from the client and applies it. Server assigns monotonically increasing syncIds, applies changes, and returns delta to the caller. Other clients pick up changes via pull. Request: PushRequest { transaction }. Response: PushResponse { success, delta, error? }.',
    },
  ];

  return (
    <>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        The sync engine talks to these endpoints. Since API route code is not
        visible in the repo, here&apos;s what each one does:
      </p>
      <div className="space-y-3">
        {routes.map((route) => (
          <div
            key={route.path}
            className="rounded border border-gray-100 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                  route.method === 'GET'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                }`}
              >
                {route.method}
              </span>
              <code className="text-xs text-gray-700 dark:text-gray-300">
                {route.path}
              </code>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              {route.description}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================
// Feedback Section (at the very end)
// ============================================================

const FEEDBACK_MAX_CHARS = 200;

function FeedbackSectionContent() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = syncFeedbackSchema.safeParse({ message: message.trim() });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/sync/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: parsed.data.message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to send');
        return;
      }
      setSubmitted(true);
      setMessage('');
    } catch {
      setError('Failed to send');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        This demo may contain some issues. If you run into any, please let me
        know.
      </p>
      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value.slice(0, FEEDBACK_MAX_CHARS));
          setError(null);
        }}
        placeholder="Describe the issue or feedback (max 200 chars)..."
        maxLength={FEEDBACK_MAX_CHARS}
        rows={3}
        disabled={submitted || submitting}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-600"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {message.length}/{FEEDBACK_MAX_CHARS}
        </span>
        <button
          type="submit"
          disabled={!message.trim() || submitting || submitted}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitted ? 'Thanks!' : submitting ? 'Sending...' : 'Send'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}

// ============================================================
// Main Demo Component
// ============================================================

export function SyncDemo() {
  const { isReady } = useSyncEngine();
  const { records, create, update, remove } = useModel('Task');
  const { query, setQuery, results } = useSearch('Task', 'title');

  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter records
  const displayRecords = (query.trim() ? results : records).filter(
    (r) => statusFilter === 'all' || r.data.status === statusFilter
  );

  // Sort: in_progress first, then todo, then done, then cancelled
  const statusOrder: Record<string, number> = {
    [TaskStatus.IN_PROGRESS]: 0,
    [TaskStatus.TODO]: 1,
    [TaskStatus.DONE]: 2,
    [TaskStatus.CANCELLED]: 3,
  };

  const sortedRecords = [...displayRecords].sort((a, b) => {
    const aOrder = statusOrder[a.data.status as string] ?? 99;
    const bOrder = statusOrder[b.data.status as string] ?? 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
  });

  // Counts
  const counts = {
    all: records.length,
    [TaskStatus.TODO]: records.filter((r) => r.data.status === TaskStatus.TODO)
      .length,
    [TaskStatus.IN_PROGRESS]: records.filter(
      (r) => r.data.status === TaskStatus.IN_PROGRESS
    ).length,
    [TaskStatus.DONE]: records.filter((r) => r.data.status === TaskStatus.DONE)
      .length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 pb-32 pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Sync Engine
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Built from scratch, inspired by{' '}
                <a
                  href="https://github.com/wzhudev/reverse-linear-sync-engine"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline decoration-blue-500/30 transition-colors hover:text-blue-600"
                >
                  Linear&apos;s sync engine
                </a>
              </p>
            </div>
            <SyncPageViews />
          </div>
        </div>

        {/* Architecture diagram */}
        <div className="mb-4">
          <CollapsibleSection title="How it works (inspired by Linear)">
            <ArchitectureDiagramContent />
          </CollapsibleSection>
        </div>

        {/* Sync explain: Linear, my impl, WebSocket */}
        <div className="mb-4">
          <CollapsibleSection title="Linear vs mine sync (WebSocket note)">
            <SyncExplainContent />
          </CollapsibleSection>
        </div>

        {/* API routes info (how we do it) */}
        <div className="mb-6">
          <CollapsibleSection title="API routes (how I do it)">
            <ApiRoutesInfoContent />
          </CollapsibleSection>
        </div>

        {/* Loading state */}
        {!isReady && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
              <p className="text-sm text-gray-500">
                Bootstrapping sync engine...
              </p>
            </div>
          </div>
        )}

        {isReady && (
          <>
            {/* Create task */}
            <div className="mb-6">
              <CreateTaskForm onCreate={create} taskCount={records.length} />
            </div>

            {/* Search + Filter bar */}
            <div className="mb-4 flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks by title..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:placeholder:text-gray-600"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                {[
                  { key: 'all', label: 'All', count: counts.all },
                  {
                    key: TaskStatus.TODO,
                    label: 'Todo',
                    count: counts[TaskStatus.TODO],
                  },
                  {
                    key: TaskStatus.IN_PROGRESS,
                    label: 'Active',
                    count: counts[TaskStatus.IN_PROGRESS],
                  },
                  {
                    key: TaskStatus.DONE,
                    label: 'Done',
                    count: counts[TaskStatus.DONE],
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === tab.key
                        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-1 text-[10px] opacity-60">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-1.5">
              {sortedRecords.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-gray-400">
                    {query.trim()
                      ? `No tasks matching "${query}"`
                      : 'No tasks yet. Create one above!'}
                  </p>
                </div>
              ) : (
                sortedRecords.map((record) => (
                  <TaskRow
                    key={record.id}
                    record={record}
                    onUpdate={update}
                    onDelete={remove}
                  />
                ))
              )}
            </div>

            {/* Footer stats */}
            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-xs text-gray-400">
                {records.length} task{records.length !== 1 ? 's' : ''} total
              </p>
            </div>

            {/* Feedback (at the very end) */}
            <div className="mt-8">
              <CollapsibleSection title="Found an issue? Contact me">
                <FeedbackSectionContent />
              </CollapsibleSection>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
