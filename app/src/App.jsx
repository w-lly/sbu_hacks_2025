import React, { useState, useEffect, createContext, useContext } from 'react';
import { Home, CheckSquare, FolderOpen, Plus, Trash2, ChevronRight, ChevronLeft, Settings, Link2, FileText, Image, Menu } from 'lucide-react';

// IndexedDB Helper
class DB {
  constructor() {
    this.dbName = 'UmiPlannerDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        
        if (!db.objectStoreNames.contains('groups')) {
          db.createObjectStore('groups', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('objects')) {
          db.createObjectStore('objects', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('objectFields')) {
          db.createObjectStore('objectFields', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('todos')) {
          db.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('customPages')) {
          db.createObjectStore('customPages', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async getAll(storeName) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async add(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, key) {
    const tx = this.db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, key) {
    const tx = this.db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

const db = new DB();

// Context for global state
const AppContext = createContext();

// Theme definitions
const themes = {
  light: {
    bg: 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50',
    panel: 'bg-white/90 backdrop-blur-sm',
    card: 'bg-white',
    group: 'bg-gradient-to-br from-purple-100 to-pink-100',
    object: 'bg-gradient-to-br from-blue-50 to-purple-50',
    text: 'text-gray-800',
    border: 'border-purple-200',
    button: 'bg-purple-400 hover:bg-purple-500 text-white',
    input: 'bg-white border-purple-200',
    accent: 'bg-purple-500'
  },
  dark: {
    bg: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    panel: 'bg-slate-800/90 backdrop-blur-sm',
    card: 'bg-slate-800',
    group: 'bg-gradient-to-br from-purple-900/50 to-pink-900/50',
    object: 'bg-gradient-to-br from-blue-900/30 to-purple-900/30',
    text: 'text-gray-100',
    border: 'border-purple-700',
    button: 'bg-purple-600 hover:bg-purple-700 text-white',
    input: 'bg-slate-700 border-purple-700 text-white',
    accent: 'bg-purple-600'
  }
};

// Avatar customization options
const avatarOptions = {
  skinTone: ['#FFDAB9', '#F0C49A', '#D4A574', '#C08858', '#8D5524', '#5C3317'],
  hairStyle: ['short', 'long', 'curly', 'bald', 'ponytail'],
  hairColor: ['#2C1B18', '#6A4E42', '#B55239', '#E7C566', '#EFEFEF'],
  eyes: ['happy', 'neutral', 'excited', 'sleepy'],
  mouth: ['smile', 'neutral', 'grin', 'laugh'],
  clothing: ['tshirt', 'hoodie', 'formal', 'casual'],
  clothingColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
};

// Avatar Component
function Avatar({ config, size = 'md' }) {
  const sizes = { sm: 40, md: 80, lg: 120 };
  const s = sizes[size];

  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      {/* Head */}
      <circle cx="50" cy="40" r="25" fill={config.skinTone} />
      
      {/* Hair */}
      {config.hairStyle === 'short' && (
        <path d="M 25 35 Q 25 15 50 15 Q 75 15 75 35" fill={config.hairColor} />
      )}
      {config.hairStyle === 'long' && (
        <>
          <path d="M 25 35 Q 25 15 50 15 Q 75 15 75 35" fill={config.hairColor} />
          <rect x="20" y="35" width="10" height="30" fill={config.hairColor} />
          <rect x="70" y="35" width="10" height="30" fill={config.hairColor} />
        </>
      )}
      {config.hairStyle === 'curly' && (
        <>
          <circle cx="30" cy="25" r="8" fill={config.hairColor} />
          <circle cx="45" cy="20" r="8" fill={config.hairColor} />
          <circle cx="55" cy="20" r="8" fill={config.hairColor} />
          <circle cx="70" cy="25" r="8" fill={config.hairColor} />
        </>
      )}
      {config.hairStyle === 'ponytail' && (
        <>
          <path d="M 25 35 Q 25 15 50 15 Q 75 15 75 35" fill={config.hairColor} />
          <ellipse cx="50" cy="15" rx="6" ry="15" fill={config.hairColor} />
        </>
      )}
      
      {/* Eyes */}
      {config.eyes === 'happy' && (
        <>
          <path d="M 40 35 Q 42 37 44 35" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M 56 35 Q 58 37 60 35" stroke="#000" strokeWidth="2" fill="none" />
        </>
      )}
      {config.eyes === 'neutral' && (
        <>
          <circle cx="42" cy="36" r="2" fill="#000" />
          <circle cx="58" cy="36" r="2" fill="#000" />
        </>
      )}
      {config.eyes === 'excited' && (
        <>
          <circle cx="42" cy="36" r="3" fill="#000" />
          <circle cx="58" cy="36" r="3" fill="#000" />
        </>
      )}
      {config.eyes === 'sleepy' && (
        <>
          <line x1="38" y1="36" x2="46" y2="36" stroke="#000" strokeWidth="2" />
          <line x1="54" y1="36" x2="62" y2="36" stroke="#000" strokeWidth="2" />
        </>
      )}
      
      {/* Mouth */}
      {config.mouth === 'smile' && (
        <path d="M 40 45 Q 50 50 60 45" stroke="#000" strokeWidth="2" fill="none" />
      )}
      {config.mouth === 'neutral' && (
        <line x1="42" y1="47" x2="58" y2="47" stroke="#000" strokeWidth="2" />
      )}
      {config.mouth === 'grin' && (
        <path d="M 40 45 Q 50 52 60 45" stroke="#000" strokeWidth="2.5" fill="none" />
      )}
      {config.mouth === 'laugh' && (
        <ellipse cx="50" cy="47" rx="8" ry="5" fill="#000" />
      )}
      
      {/* Body/Clothing */}
      {config.clothing === 'tshirt' && (
        <rect x="25" y="65" width="50" height="35" fill={config.clothingColor} rx="5" />
      )}
      {config.clothing === 'hoodie' && (
        <>
          <rect x="25" y="65" width="50" height="35" fill={config.clothingColor} rx="5" />
          <circle cx="50" cy="65" r="15" fill={config.clothingColor} />
        </>
      )}
      {config.clothing === 'formal' && (
        <>
          <rect x="25" y="65" width="50" height="35" fill={config.clothingColor} rx="5" />
          <rect x="47" y="65" width="6" height="35" fill="#FFF" />
        </>
      )}
      {config.clothing === 'casual' && (
        <rect x="25" y="65" width="50" height="35" fill={config.clothingColor} rx="8" />
      )}
    </svg>
  );
}

// Avatar Creator Component
function AvatarCreator({ onSave, onCancel, initialConfig }) {
  const [config, setConfig] = useState(initialConfig || {
    skinTone: avatarOptions.skinTone[0],
    hairStyle: avatarOptions.hairStyle[0],
    hairColor: avatarOptions.hairColor[0],
    eyes: avatarOptions.eyes[0],
    mouth: avatarOptions.mouth[0],
    clothing: avatarOptions.clothing[0],
    clothingColor: avatarOptions.clothingColor[0]
  });

  const cycle = (key, options) => {
    const currentIndex = options.indexOf(config[key]);
    const nextIndex = (currentIndex + 1) % options.length;
    setConfig({ ...config, [key]: options[nextIndex] });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full text-gray-800">
        <h3 className="text-2xl font-bold mb-4">Create Your Avatar</h3>
        
        <div className="flex justify-center mb-6">
          <Avatar config={config} size="lg" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Skin Tone</span>
            <button 
              onClick={() => cycle('skinTone', avatarOptions.skinTone)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Next
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-semibold">Hair Style</span>
            <button 
              onClick={() => cycle('hairStyle', avatarOptions.hairStyle)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              {config.hairStyle}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Hair Color</span>
            <button 
              onClick={() => cycle('hairColor', avatarOptions.hairColor)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Next
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Eyes</span>
            <button 
              onClick={() => cycle('eyes', avatarOptions.eyes)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              {config.eyes}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Mouth</span>
            <button 
              onClick={() => cycle('mouth', avatarOptions.mouth)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              {config.mouth}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Clothing</span>
            <button 
              onClick={() => cycle('clothing', avatarOptions.clothing)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              {config.clothing}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold">Clothing Color</span>
            <button 
              onClick={() => cycle('clothingColor', avatarOptions.clothingColor)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button 
            onClick={() => onSave(config)} 
            className="flex-1 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Save Avatar
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Page (U-mi Logo)
function MainPage({ theme }) {
  const t = themes[theme];
  const { setCurrentPage, avatarConfig } = useContext(AppContext);

  return (
    <div className={`h-full flex flex-col items-center justify-center ${t.panel}`}>
      <div className="text-center">
        <div className={`text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text`}>
          U-mi
        </div>
        <button
          onClick={() => setCurrentPage('menu')}
          className={`px-8 py-4 rounded-lg ${t.button} text-xl font-semibold shadow-lg hover:shadow-xl transition`}
        >
          Enter App
        </button>
      </div>
    </div>
  );
}

// Menu Page
function MenuPage({ theme }) {
  const t = themes[theme];
  const { setCurrentPage, avatarConfig, setShowAvatarCreator } = useContext(AppContext);
  const [customPages, setCustomPages] = useState([]);

  useEffect(() => {
    loadCustomPages();
  }, []);

  const loadCustomPages = async () => {
    const pages = await db.getAll('customPages');
    setCustomPages(pages);
  };

  const addCustomPage = async () => {
    const name = prompt('Custom page name:');
    if (name && name.trim()) {
      await db.add('customPages', { name: name.trim(), icon: 'FolderOpen' });
      loadCustomPages();
    }
  };

  const deleteCustomPage = async (id) => {
    if (confirm('Delete this custom page?')) {
      await db.delete('customPages', id);
      loadCustomPages();
    }
  };

  return (
    <div className={`h-full ${t.panel} p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Header with avatar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Menu</h1>
          <div 
            className="cursor-pointer hover:opacity-80 transition"
            onClick={() => setShowAvatarCreator(true)}
          >
            <Avatar config={avatarConfig} size="md" />
          </div>
        </div>

        {/* Menu Icons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {/* To-Do List */}
          <button
            onClick={() => setCurrentPage('todos')}
            className={`${t.card} p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center gap-3`}
          >
            <CheckSquare size={48} className="text-purple-500" />
            <span className="font-semibold">To-Do List</span>
          </button>

          {/* Groups */}
          <button
            onClick={() => setCurrentPage('groups')}
            className={`${t.card} p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center gap-3`}
          >
            <FolderOpen size={48} className="text-purple-500" />
            <span className="font-semibold">Groups</span>
          </button>

          {/* Custom Pages */}
          {customPages.map((page) => (
            <div key={page.id} className="relative">
              <button
                onClick={() => setCurrentPage(`custom-${page.id}`)}
                className={`w-full ${t.card} p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center gap-3`}
              >
                <FolderOpen size={48} className="text-purple-500" />
                <span className="font-semibold">{page.name}</span>
              </button>
              <button
                onClick={() => deleteCustomPage(page.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Add Custom Page */}
          <button
            onClick={addCustomPage}
            className={`${t.card} p-6 rounded-lg shadow-lg hover:shadow-xl transition flex flex-col items-center gap-3 border-2 border-dashed ${t.border}`}
          >
            <Plus size={48} className="text-purple-500" />
            <span className="font-semibold">Add Custom</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// To-Do List Page
function TodoPage({ theme }) {
  const t = themes[theme];
  const { setCurrentPage, avatarConfig } = useContext(AppContext);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const todoList = await db.getAll('todos');
    setTodos(todoList.sort((a, b) => b.createdAt - a.createdAt));
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      await db.add('todos', { text: newTodo, completed: false, createdAt: Date.now() });
      setNewTodo('');
      loadTodos();
    }
  };

  const toggleTodo = async (todo) => {
    await db.put('todos', { ...todo, completed: !todo.completed });
    loadTodos();
  };

  const deleteTodo = async (id) => {
    await db.delete('todos', id);
    loadTodos();
  };

  return (
    <div className={`h-full ${t.panel} p-6`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('menu')} className={`p-2 rounded ${t.card}`}>
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">To-Do List</h1>
          </div>
          <Avatar config={avatarConfig} size="sm" />
        </div>

        {/* Add Todo */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a task..."
            className={`flex-1 px-4 py-3 rounded-lg ${t.input} border`}
          />
          <button onClick={addTodo} className={`px-6 py-3 rounded-lg ${t.button}`}>
            <Plus size={20} />
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.map((todo) => (
            <div key={todo.id} className={`${t.card} p-4 rounded-lg shadow flex items-center gap-3`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
                className="w-6 h-6"
              />
              <span className={`flex-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                {todo.text}
              </span>
              <button onClick={() => deleteTodo(todo.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Draggable Group Card
function GroupCard({ group, theme, onDragStart, onDragEnd, onDragOver, onDrop, onClick, onDelete }) {
  const t = themes[theme];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, group)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, group.id)}
      className={`${t.group} p-4 rounded-lg shadow-lg cursor-move hover:shadow-xl transition`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold" onClick={onClick}>{group.name}</h3>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

// Groups Page
function GroupsPage({ theme, customPageId = null }) {
  const t = themes[theme];
  const { setCurrentPage, avatarConfig, setSelectedGroup, setBreadcrumbs } = useContext(AppContext);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [draggedGroup, setDraggedGroup] = useState(null);

  useEffect(() => {
    loadGroups();
  }, [customPageId]);

  const loadGroups = async () => {
    const allGroups = await db.getAll('groups');
    const filtered = customPageId 
      ? allGroups.filter(g => g.customPageId === customPageId)
      : allGroups.filter(g => !g.customPageId);
    setGroups(filtered.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };

  const addGroup = async () => {
    if (newGroupName.trim()) {
      const order = groups.length;
      const groupData = { name: newGroupName, order };
      if (customPageId) groupData.customPageId = customPageId;
      await db.add('groups', groupData);
      setNewGroupName('');
      loadGroups();
    }
  };

  const deleteGroup = async (id) => {
    if (confirm('Delete this group and all its objects?')) {
      await db.delete('groups', id);
      const objects = await db.getAll('objects');
      const objsToDelete = objects.filter(o => o.groupId === id);
      for (const obj of objsToDelete) {
        await db.delete('objects', obj.id);
        const fields = await db.getAll('objectFields');
        const objFields = fields.filter(f => f.objectId === obj.id);
        for (const field of objFields) {
          await db.delete('objectFields', field.id);
        }
        const files = await db.getAll('files');
        const objFiles = files.filter(f => f.objectId === obj.id);
        for (const file of objFiles) {
          await db.delete('files', file.id);
        }
      }
      loadGroups();
    }
  };

  const viewGroup = (group) => {
    setSelectedGroup(group);
    setBreadcrumbs([{ name: 'Groups', page: customPageId ? `custom-${customPageId}` : 'groups' }, { name: group.name }]);
    setCurrentPage('group-detail');
  };

  const handleDragStart = (e, group) => {
    setDraggedGroup(group);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedGroup(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedGroup && draggedGroup.id !== targetId) {
      const targetGroup = groups.find(g => g.id === targetId);
      const draggedOrder = draggedGroup.order;
      const targetOrder = targetGroup.order;
      
      await db.put('groups', { ...draggedGroup, order: targetOrder });
      await db.put('groups', { ...targetGroup, order: draggedOrder });
      
      loadGroups();
    }
  };

  return (
    <div className={`h-full ${t.panel} p-6`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('menu')} className={`p-2 rounded ${t.card}`}>
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Groups</h1>
          </div>
          <Avatar config={avatarConfig} size="sm" />
        </div>

        {/* Add Group */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGroup()}
            placeholder="New group name..."
            className={`flex-1 px-4 py-3 rounded-lg ${t.input} border`}
          />
          <button onClick={addGroup} className={`px-6 py-3 rounded-lg ${t.button}`}>
            Add Group
          </button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              theme={theme}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => viewGroup(group)}
              onDelete={() => deleteGroup(group.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Draggable Object Card
function ObjectCard({ object, theme, onClick, onDragStart, onDragEnd, onDragOver }) {
  const t = themes[theme];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, object)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onClick={onClick}
      className={`${t.object} p-4 rounded shadow hover:shadow-lg cursor-pointer transition`}
    >
      <h4 className="font-semibold">{object.name}</h4>
    </div>
  );
}

// Group Detail Page (shows objects within a group)
function GroupDetailPage({ theme }) {
  const t = themes[theme];
  const { selectedGroup, setCurrentPage, avatarConfig, breadcrumbs, setSelectedObject, setBreadcrumbs } = useContext(AppContext);
  const [objects, setObjects] = useState([]);
  const [newObjectName, setNewObjectName] = useState('');
  const [draggedObject, setDraggedObject] = useState(null);

  useEffect(() => {
    if (selectedGroup) {
      loadObjects();
    }
  }, [selectedGroup]);

  const loadObjects = async () => {
    const allObjects = await db.getAll('objects');
    const filtered = allObjects.filter(o => o.groupId === selectedGroup.id);
    setObjects(filtered.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };

  const addObject = async () => {
    if (newObjectName.trim()) {
      const order = objects.length;
      await db.add('objects', { groupId: selectedGroup.id, name: newObjectName, order });
      setNewObjectName('');
      loadObjects();
    }
  };

  const deleteObject = async (id) => {
    if (confirm('Delete this object?')) {
      await db.delete('objects', id);
      const fields = await db.getAll('objectFields');
      const objFields = fields.filter(f => f.objectId === id);
      for (const field of objFields) {
        await db.delete('objectFields', field.id);
      }
      const files = await db.getAll('files');
      const objFiles = files.filter(f => f.objectId === id);
      for (const file of objFiles) {
        await db.delete('files', file.id);
      }
      loadObjects();
    }
  };

  const viewObject = (obj) => {
    setSelectedObject(obj);
    setBreadcrumbs([...breadcrumbs, { name: obj.name }]);
    setCurrentPage('object-detail');
  };

  const handleDragStart = (e, obj) => {
    setDraggedObject(obj);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedObject(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const goBack = () => {
    const prevPage = breadcrumbs[0].page;
    setCurrentPage(prevPage);
    setBreadcrumbs([]);
  };

  if (!selectedGroup) return null;

  return (
    <div className={`h-full ${t.panel} p-6`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className={`p-2 rounded ${t.card}`}>
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="text-sm text-gray-500">{breadcrumbs[0]?.name}</div>
              <h1 className="text-2xl font-bold">{selectedGroup.name}</h1>
            </div>
          </div>
          <Avatar config={avatarConfig} size="sm" />
        </div>

        {/* Add Object */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newObjectName}
            onChange={(e) => setNewObjectName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addObject()}
            placeholder="New object name..."
            className={`flex-1 px-4 py-3 rounded-lg ${t.input} border`}
          />
          <button onClick={addObject} className={`px-6 py-3 rounded-lg ${t.button}`}>
            Add Object
          </button>
        </div>

        {/* Objects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {objects.map((obj) => (
            <div key={obj.id} className="relative">
              <ObjectCard
                object={obj}
                theme={theme}
                onClick={() => viewObject(obj)}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
              />
              <button
                onClick={() => deleteObject(obj.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Object Detail Page
function ObjectDetailPage({ theme }) {
  const t = themes[theme];
  const { selectedObject, setCurrentPage, avatarConfig, breadcrumbs, setBreadcrumbs, setSelectedObject } = useContext(AppContext);
  const [fields, setFields] = useState([]);
  const [files, setFiles] = useState([]);
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    if (selectedObject) {
      loadObjectData();
    }
  }, [selectedObject]);

  const loadObjectData = async () => {
    const allFields = await db.getAll('objectFields');
    const f = allFields.filter(field => field.objectId === selectedObject.id);
    const allFiles = await db.getAll('files');
    const fl = allFiles.filter(file => file.objectId === selectedObject.id);
    const o = await db.getAll('objects');
    setFields(f);
    setFiles(fl);
    setObjects(o);
  };

  const addField = async (type) => {
    const label = prompt('Field label:');
    if (label && label.trim()) {
      let value = '';
      if (type === 'link') {
        const linkedObjName = prompt('Link to object (enter name):');
        const linkedObj = objects.find(o => o.name === linkedObjName);
        if (linkedObj) value = linkedObj.id.toString();
        else {
          alert('Object not found');
          return;
        }
      } else {
        value = prompt('Field value:') || '';
      }
      
      await db.add('objectFields', { objectId: selectedObject.id, type, label, value });
      loadObjectData();
    }
  };

  const deleteField = async (id) => {
    await db.delete('objectFields', id);
    loadObjectData();
  };

  const updateField = async (field, value) => {
    await db.put('objectFields', { ...field, value });
    loadObjectData();
  };

  const addFile = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        await db.add('files', {
          objectId: selectedObject.id,
          name: file.name,
          type: file.type,
          data: e.target.result
        });
        loadObjectData();
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteFile = async (id) => {
    await db.delete('files', id);
    loadObjectData();
  };

  const navigateToLinkedObject = async (fieldValue) => {
    const linkedObj = objects.find(o => o.id === parseInt(fieldValue));
    if (linkedObj) {
      setSelectedObject(linkedObj);
      setBreadcrumbs([...breadcrumbs, { name: linkedObj.name }]);
    }
  };

  const goBack = () => {
    setBreadcrumbs(breadcrumbs.slice(0, -1));
    setCurrentPage('group-detail');
  };

  if (!selectedObject) return null;

  return (
    <div className={`h-full ${t.panel} p-6 overflow-y-auto`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className={`p-2 rounded ${t.card}`}>
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <span>{crumb.name}</span>
                    {idx < breadcrumbs.length - 1 && <ChevronRight size={14} />}
                  </React.Fragment>
                ))}
              </div>
              <h1 className="text-2xl font-bold">{selectedObject.name}</h1>
            </div>
          </div>
          <Avatar config={avatarConfig} size="sm" />
        </div>

        {/* Add Fields/Files */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => addField('text')} className={`px-4 py-2 rounded ${t.button} text-sm`}>
            + Text Field
          </button>
          <button onClick={() => addField('link')} className={`px-4 py-2 rounded ${t.button} text-sm flex items-center gap-1`}>
            <Link2 size={16} />
            Link
          </button>
          <label className={`px-4 py-2 rounded ${t.button} text-sm cursor-pointer flex items-center gap-1`}>
            <FileText size={16} />
            Add File
            <input type="file" onChange={addFile} className="hidden" />
          </label>
        </div>

        {/* Fields */}
        <div className="space-y-3 mb-6">
          {fields.map((field) => (
            <div key={field.id} className={`${t.card} p-4 rounded-lg shadow`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="font-semibold text-sm block mb-2">{field.label}</label>
                  {field.type === 'link' ? (
                    <button
                      onClick={() => navigateToLinkedObject(field.value)}
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <Link2 size={14} />
                      {objects.find(o => o.id === parseInt(field.value))?.name || 'Unknown'}
                    </button>
                  ) : (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateField(field, e.target.value)}
                      className={`w-full px-3 py-2 rounded ${t.input} border`}
                    />
                  )}
                </div>
                <button onClick={() => deleteField(field.id)} className="text-red-500 ml-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Files */}
        {files.length > 0 && (
          <div>
            <h3 className="font-bold mb-3 text-lg">Files</h3>
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className={`${t.card} p-4 rounded-lg shadow flex justify-between items-center`}>
                  <div className="flex items-center gap-2">
                    {file.type.startsWith('image/') ? <Image size={18} /> : <FileText size={18} />}
                    <a href={file.data} download={file.name} className="hover:underline">
                      {file.name}
                    </a>
                  </div>
                  <button onClick={() => deleteFile(file.id)} className="text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState('main');
  const [avatarConfig, setAvatarConfig] = useState(null);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    initDB();
  }, []);

  const initDB = async () => {
    await db.init();
    const themeSetting = await db.get('settings', 'theme');
    if (themeSetting) setTheme(themeSetting.value);
    
    const avatarSetting = await db.get('settings', 'avatar');
    if (avatarSetting) {
      setAvatarConfig(avatarSetting.value);
    } else {
      // Default avatar
      setAvatarConfig({
        skinTone: avatarOptions.skinTone[0],
        hairStyle: avatarOptions.hairStyle[0],
        hairColor: avatarOptions.hairColor[0],
        eyes: avatarOptions.eyes[0],
        mouth: avatarOptions.mouth[0],
        clothing: avatarOptions.clothing[0],
        clothingColor: avatarOptions.clothingColor[0]
      });
    }
    
    setInitialized(true);
  };

  const saveTheme = async (newTheme) => {
    await db.put('settings', { key: 'theme', value: newTheme });
    setTheme(newTheme);
    setShowSettings(false);
  };

  const saveAvatar = async (config) => {
    await db.put('settings', { key: 'avatar', value: config });
    setAvatarConfig(config);
    setShowAvatarCreator(false);
  };

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-2xl font-bold text-purple-500">Loading U-mi...</div>
      </div>
    );
  }

  const t = themes[theme];

  const contextValue = {
    theme,
    setTheme,
    currentPage,
    setCurrentPage,
    avatarConfig,
    setAvatarConfig,
    showAvatarCreator,
    setShowAvatarCreator,
    selectedGroup,
    setSelectedGroup,
    selectedObject,
    setSelectedObject,
    breadcrumbs,
    setBreadcrumbs
  };

  // Check if current page is a custom page
  const isCustomPage = currentPage.startsWith('custom-');
  const customPageId = isCustomPage ? parseInt(currentPage.replace('custom-', '')) : null;

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`h-screen ${t.bg} ${t.text}`}>
        {/* Settings Button (only show after main page) */}
        {currentPage !== 'main' && (
          <div className="absolute top-4 right-4 z-50">
            <button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-full ${t.card} shadow-lg`}>
              <Settings size={20} />
            </button>
          </div>
        )}

        {/* Settings Menu */}
        {showSettings && (
          <div className={`absolute top-16 right-4 z-50 ${t.card} p-4 rounded-lg shadow-xl`}>
            <h3 className="font-bold mb-3">Theme</h3>
            <button 
              onClick={() => saveTheme('light')} 
              className={`block w-full text-left px-4 py-2 rounded mb-1 ${theme === 'light' ? t.accent + ' text-white' : 'hover:bg-gray-100'}`}
            >
              Light Pastel
            </button>
            <button 
              onClick={() => saveTheme('dark')} 
              className={`block w-full text-left px-4 py-2 rounded ${theme === 'dark' ? t.accent + ' text-white' : 'hover:bg-gray-100'}`}
            >
              Dark Pastel
            </button>
          </div>
        )}

        {/* Avatar Creator Modal */}
        {showAvatarCreator && (
          <AvatarCreator
            initialConfig={avatarConfig}
            onSave={saveAvatar}
            onCancel={() => setShowAvatarCreator(false)}
          />
        )}

        {/* Page Router */}
        {currentPage === 'main' && <MainPage theme={theme} />}
        {currentPage === 'menu' && <MenuPage theme={theme} />}
        {currentPage === 'todos' && <TodoPage theme={theme} />}
        {currentPage === 'groups' && <GroupsPage theme={theme} />}
        {currentPage === 'group-detail' && <GroupDetailPage theme={theme} />}
        {currentPage === 'object-detail' && <ObjectDetailPage theme={theme} />}
        {isCustomPage && <GroupsPage theme={theme} customPageId={customPageId} />}
      </div>
    </AppContext.Provider>
  );
}