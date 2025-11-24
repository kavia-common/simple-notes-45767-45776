"use client";

import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Types
type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

// Storage keys/constants
const STORAGE_KEY = "notes_app_notes_v1";
const SELECTED_KEY = "notes_app_selected_v1";

// Seed demo data
const seedNotes: Note[] = [
  {
    id: uuidv4(),
    title: "Welcome to Ocean Notes",
    content:
      "This is a simple notes app.\n\n- Create notes with the + New button\n- Click a note in the sidebar to view/edit\n- Search and filter notes\n- Changes persist to your browser's storage\n\nEnjoy!",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: uuidv4(),
    title: "Meeting Ideas",
    content:
      "Agenda:\n1. Status updates\n2. Roadmap review\n3. Risks and mitigations\n\nAction items:\n- Prepare slides\n- Collect metrics",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
  },
];

// Helpers
function loadNotes(): Note[] {
  if (typeof window === "undefined") return seedNotes;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedNotes;
    const parsed = JSON.parse(raw) as Note[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedNotes;
    return parsed;
  } catch {
    return seedNotes;
  }
}

function saveNotes(notes: Note[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // noop
  }
}

function loadSelected(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SELECTED_KEY);
  } catch {
    return null;
  }
}

function saveSelected(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(SELECTED_KEY, id);
    else localStorage.removeItem(SELECTED_KEY);
  } catch {
    // noop
  }
}

// Ocean Professional theme colors as CSS vars applied inline where needed
// We also define a small utility to compose class names
function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// PUBLIC_INTERFACE
export default function Home() {
  /** Main Notes App page: Header, Sidebar (list with search), and Editor area. */
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Load initial notes and selection
  useEffect(() => {
    const initial = loadNotes();
    setNotes(initial);
    const maybeSelected = loadSelected();
    // ensure selected exists
    if (maybeSelected && initial.some((n) => n.id === maybeSelected)) {
      setSelectedId(maybeSelected);
    } else {
      setSelectedId(initial[0]?.id ?? null);
    }
  }, []);

  // Persist notes on change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist selected id on change
  useEffect(() => {
    saveSelected(selectedId);
  }, [selectedId]);

  // Filtered and sorted notes
  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? notes.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        )
      : notes.slice();
    // Sort by updatedAt desc
    base.sort((a, b) => b.updatedAt - a.updatedAt);
    return base;
  }, [notes, query]);

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId]
  );

  function createNote() {
    const now = Date.now();
    const newNote: Note = {
      id: uuidv4(),
      title: "Untitled note",
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) {
      // pick another note if available
      const remaining = notes.filter((n) => n.id !== id);
      setSelectedId(remaining[0]?.id ?? null);
    }
  }

  function updateNote(id: string, fields: Partial<Pick<Note, "title" | "content">>) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, ...fields, updatedAt: Date.now() }
          : n
      )
    );
  }

  // Keyboard accessibility for creating a note (Ctrl/Cmd+N)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const metaOrCtrl = e.ctrlKey || e.metaKey;
      if (metaOrCtrl && e.key.toLowerCase() === "n") {
        e.preventDefault();
        createNote();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Layout
  return (
    <main
      className="min-h-screen"
      style={
        {
          "--color-primary": "#2563EB",
          "--color-secondary": "#F59E0B",
          "--color-error": "#EF4444",
          "--color-surface": "#ffffff",
          "--color-background": "#f9fafb",
          "--color-text": "#111827",
        } as React.CSSProperties
      }
    >
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-blue-500/10 to-gray-50" aria-hidden="true" />

      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-blue-100"
        role="banner"
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600/90 shadow-sm ring-1 ring-blue-400/50 flex items-center justify-center text-white font-bold">
                N
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Ocean Notes
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <kbd
                aria-label="Keyboard shortcut"
                className="hidden sm:inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-2 py-1 text-xs text-gray-600 shadow-sm"
                title="New note"
              >
                <span className="text-gray-500">⌘</span>
                <span>N</span>
              </kbd>
              <button
                type="button"
                onClick={createNote}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-blue-500 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors"
                aria-label="Create new note"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                New
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-4">
          {/* Sidebar */}
          <aside
            className="rounded-xl bg-white/70 backdrop-blur shadow-sm ring-1 ring-blue-100 p-3 sm:p-4"
            aria-label="Notes list"
          >
            {/* Search */}
            <div className="mb-3">
              <label htmlFor="search" className="sr-only">
                Search notes
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full rounded-lg border border-blue-200 bg-white px-9 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="search-help"
                />
              </div>
              <p id="search-help" className="mt-1 text-xs text-gray-500">
                Filter by title or content.
              </p>
            </div>

            {/* List */}
            <ul role="list" className="space-y-2 max-h-[65vh] overflow-auto pr-1">
              {filteredNotes.length === 0 && (
                <li className="text-sm text-gray-500 px-2">No matching notes.</li>
              )}
              {filteredNotes.map((n) => {
                const isActive = n.id === selectedId;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(n.id)}
                      className={cx(
                        "w-full text-left rounded-lg px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ring-offset-1",
                        isActive
                          ? "bg-blue-50/80 border border-blue-200"
                          : "bg-white hover:bg-blue-50/60 border border-transparent"
                      )}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3
                          className={cx(
                            "font-medium line-clamp-1",
                            isActive ? "text-blue-700" : "text-gray-900"
                          )}
                        >
                          {n.title || "Untitled note"}
                        </h3>
                        <time
                          className="text-xs text-gray-500 whitespace-nowrap"
                          dateTime={new Date(n.updatedAt).toISOString()}
                          title={new Date(n.updatedAt).toLocaleString()}
                        >
                          {timeAgo(n.updatedAt)}
                        </time>
                      </div>
                      {n.content ? (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {n.content}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1 italic">
                          No content
                        </p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Editor */}
          <section
            aria-label="Note editor"
            className="rounded-xl bg-white/80 backdrop-blur shadow-sm ring-1 ring-blue-100 p-4 sm:p-6 min-h-[60vh] flex flex-col"
          >
            {!selectedNote ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600">No note selected.</p>
                  <button
                    type="button"
                    onClick={createNote}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-blue-500 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors"
                  >
                    Create your first note
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <label htmlFor="note-title" className="sr-only">
                      Note title
                    </label>
                    <input
                      id="note-title"
                      value={selectedNote.title}
                      onChange={(e) =>
                        updateNote(selectedNote.id, { title: e.target.value })
                      }
                      placeholder="Note title"
                      className="w-full rounded-md border-0 bg-transparent text-2xl font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deleteNote(selectedNote.id)}
                      className="inline-flex items-center gap-2 rounded-lg bg-white text-red-600 px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-red-200 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 transition-colors"
                      aria-label="Delete note"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 7h12M9 7v12m6-12v12M4 7h16l-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 7Zm4-3h8l1 3H7l1-3Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Delete
                    </button>
                    <span
                      className="text-xs text-gray-500"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      Updated {timeAgo(selectedNote.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <label htmlFor="note-content" className="sr-only">
                    Note content
                  </label>
                  <textarea
                    id="note-content"
                    value={selectedNote.content}
                    onChange={(e) =>
                      updateNote(selectedNote.id, { content: e.target.value })
                    }
                    placeholder="Write your note..."
                    className="min-h-[50vh] w-full resize-vertical rounded-lg border border-blue-100 bg-white/60 px-3 py-2 text-gray-800 placeholder:text-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-500">
        <span>
          Ocean Professional · Client-side demo. Env vars respected but not required.
        </span>
      </footer>
    </main>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}
