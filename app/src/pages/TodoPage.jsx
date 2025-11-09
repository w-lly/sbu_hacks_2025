import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { themes } from '../utils/themes';
import { db } from '../db/database';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableTodo = ({ todo, onToggle, onDelete, theme }) => {
  const t = themes[theme];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${t.card} p-4 rounded-xl shadow hover:shadow-lg transition-all duration-200 
        ${isDragging ? 'z-50' : 'z-0'}`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          className="w-5 h-5 sm:w-6 sm:h-6 rounded cursor-pointer"
        />
        <span className={`flex-1 text-sm sm:text-base ${todo.completed ? 'line-through opacity-50' : ''}`}>
          {todo.text}
        </span>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export const TodoPage = ({ embedded = false }) => {
  const { theme, setCurrentPage } = useAppStore();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const t = themes[theme];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const todoList = await db.todos.toArray();
    setTodos(todoList.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      const order = todos.length;
      await db.todos.add({ text: newTodo, completed: false, createdAt: Date.now(), order });
      setNewTodo('');
      loadTodos();
    }
  };

  const toggleTodo = async (todo) => {
    await db.todos.update(todo.id, { completed: !todo.completed });
    loadTodos();
  };

  const deleteTodo = async (id) => {
    await db.todos.delete(id);
    loadTodos();
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((t) => t.id === active.id);
      const newIndex = todos.findIndex((t) => t.id === over.id);

      const newTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(newTodos);

      // Update order in database
      for (let i = 0; i < newTodos.length; i++) {
        await db.todos.update(newTodos[i].id, { order: i });
      }
    }
  };
  const goToMenu = () => {
    setCurrentPage('menu');
  };

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} p-4 sm:p-6 md:p-8`}>
      <div className="max-w-3xl mx-auto">
        {!embedded && (
          <div className='mb-6 flex items-center gap-3'>
            <button
              onClick={goToMenu}
              className={`-mt-5 p-2 rounded-full ${t.card} shadow-md hover:shadow-lg hover:scale-105 transition-all`}
              title="Back to menu page"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">To-Do List</h1>
          </div>

        )}

        {/* Add Todo */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a task..."
            className={`flex-1 px-4 py-3 rounded-xl ${t.input} border focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm sm:text-base`}
          />
          <button
            onClick={addTodo}
            className={`px-4 sm:px-6 py-3 rounded-xl ${t.button} shadow hover:shadow-lg transition-all`}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Todo List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todos.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {todos.map((todo) => (
                <SortableTodo
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  theme={theme}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {todos.length === 0 && (
          <div className={`${t.card} p-8 rounded-xl text-center ${t.textSecondary}`}>
            <p>No tasks yet. Add one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};