'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Filter, Plus, Sparkles, Trash2 } from 'lucide-react';
import * as React from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Badge from '@/components/ui/badge';

type FilterMode = 'all' | 'active' | 'done';

type Todo = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function formatCount(n: number) {
  return new Intl.NumberFormat('pt-BR').format(n);
}

export default function TodoPage() {
  const [todos, setTodos] = React.useState<Todo[]>(() => [
    { id: uid(), title: 'Construir UI pixel-perfect', done: true, createdAt: Date.now() - 1000 * 60 * 60 * 20 },
    { id: uid(), title: 'Adicionar animações sutis', done: false, createdAt: Date.now() - 1000 * 60 * 60 * 6 },
    { id: uid(), title: 'Garantir Acessibilidade (focus-visible)', done: false, createdAt: Date.now() - 1000 * 60 * 25 },
  ]);

  const [filter, setFilter] = React.useState<FilterMode>('all');
  const [query, setQuery] = React.useState('');
  const [value, setValue] = React.useState('');

  const remaining = todos.filter((t) => !t.done).length;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos
      .filter((t) => {
        if (filter === 'active') return !t.done;
        if (filter === 'done') return t.done;
        return true;
      })
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [todos, filter, query]);

  function addTodo() {
    const title = value.trim();
    if (!title) return;
    setTodos((prev) => [{ id: uid(), title, done: false, createdAt: Date.now() }, ...prev]);
    setValue('');
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function removeTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearDone() {
    setTodos((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Sparkles className="h-5 w-5 text-indigo-200" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">Todos</h1>
          </div>
          <p className="max-w-2xl text-sm text-zinc-400">
            UI com microinterações, filtros e feedback visual. Pronta para integrar com API/DB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={remaining === 0 ? 'success' : 'info'}>
            {remaining === 0 ? 'Tudo em dia' : `${formatCount(remaining)} pendente(s)`}
          </Badge>
          <Badge tone="neutral">{formatCount(todos.length)} no total</Badge>
        </div>
      </div>

      {/* Controls */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_-60px_rgba(99,102,241,0.65)] backdrop-blur">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="sr-only" htmlFor="new-todo">
                Adicionar novo todo
              </label>
              <div className="relative">
                <Input
                  id="new-todo"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Adicionar uma tarefa…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addTodo();
                  }}
                  className="pr-12"
                />
                <Button
                  type="button"
                  onClick={addTodo}
                  className="absolute right-1.5 top-1.5 h-8 rounded-lg px-2.5"
                  size="sm"
                  aria-label="Adicionar todo"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <label className="sr-only" htmlFor="search">
                Buscar
              </label>
              <div className="relative">
                <Input
                  id="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar…"
                />
                <div aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Filter className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
              Todas
            </FilterButton>
            <FilterButton active={filter === 'active'} onClick={() => setFilter('active')}>
              Ativas
            </FilterButton>
            <FilterButton active={filter === 'done'} onClick={() => setFilter('done')}>
              Concluídas
            </FilterButton>

            <Button
              type="button"
              variant="secondary"
              onClick={clearDone}
              disabled={!todos.some((t) => t.done)}
              className="ml-0 sm:ml-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar concluídas
            </Button>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="space-y-3">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center"
            >
              <p className="text-sm text-zinc-300">Nada por aqui.</p>
              <p className="mt-1 text-xs text-zinc-500">Tente mudar o filtro ou a busca.</p>
            </motion.div>
          ) : (
            filtered.map((t) => (
              <TodoRow
                key={t.id}
                todo={t}
                onToggle={() => toggleTodo(t.id)}
                onRemove={() => removeTodo(t.id)}
              />
            ))
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function FilterButton({
  active,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <Button
      type="button"
      variant={active ? 'primary' : 'ghost'}
      size="sm"
      className={active ? '' : 'text-zinc-300'}
      {...props}
    >
      {children}
    </Button>
  );
}

function TodoRow({
  todo,
  onToggle,
  onRemove,
}: {
  todo: Todo;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.99 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -left-20 top-1/2 h-32 w-64 -translate-y-1/2 rotate-12 bg-indigo-500/10 blur-2xl" />
      </div>

      <div className="relative flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
          aria-label={todo.done ? 'Marcar como não concluída' : 'Marcar como concluída'}
        >
          {todo.done ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          ) : (
            <Circle className="h-5 w-5 text-indigo-200" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={[
              'truncate text-sm font-medium transition',
              todo.done ? 'text-zinc-400 line-through decoration-white/20' : 'text-zinc-100',
            ].join(' ')}
          >
            {todo.title}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {todo.done ? 'Concluída' : 'Em andamento'}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Remover todo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}