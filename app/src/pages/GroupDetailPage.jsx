import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  DragOverlay,
  pointerWithin,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableObject = ({ object, onClick, onDelete, theme }) => {
  const t = themes[theme];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `object-${object.id}`, data: { type: 'object', object } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${t.object || t.card} p-4 sm:p-5 rounded-xl shadow hover:shadow-lg transition-all duration-200 
        ${isDragging ? 'z-50 scale-105' : 'z-0'} cursor-pointer group relative`}
    >
      <div className="flex items-start gap-2">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing pt-1"
        >
          <div className="flex flex-col gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-purple-400"></div>
            ))}
          </div>
        </div>

        <div className="flex-1" onClick={onClick}>
          <h4 className="font-semibold text-sm sm:text-base">{object.name}</h4>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export const GroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { theme, showSplitView } = useAppStore();
  
  const [group, setGroup] = useState(null);
  const [objects, setObjects] = useState([]);
  const [newObjectName, setNewObjectName] = useState('');
  const [activeId, setActiveId] = useState(null);
  const t = themes[theme];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    // Load group
    const groupData = await db.groups.get(parseInt(groupId));
    setGroup(groupData);

    // Load objects
    const allObjects = await db.objects.toArray();
    const filtered = allObjects.filter(o => o.groupId === parseInt(groupId));
    setObjects(filtered.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };

  const addObject = async () => {
    if (newObjectName.trim()) {
      const order = objects.length;
      await db.objects.add({ 
        groupId: parseInt(groupId), 
        name: newObjectName.trim(), 
        order 
      });
      setNewObjectName('');
      loadData();
    }
  };

  const deleteObject = async (id) => {
    if (confirm('Delete this object and all its data?')) {
      await db.objects.delete(id);
      await db.objectFields.where('objectId').equals(id).delete();
      await db.files.where('objectId').equals(id).delete();
      loadData();
    }
  };

  const viewObject = (obj) => {
    navigate(`/object/${obj.id}`);
  };

  const goBack = () => {
    if (group?.customPageId) {
      navigate(`/groups/${group.customPageId}`);
    } else {
      navigate('/groups');
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeObjectId = parseInt(active.id.toString().replace('object-', ''));

    // Reorder within same group
    if (over.id.toString().startsWith('object-')) {
      const overObjectId = parseInt(over.id.toString().replace('object-', ''));

      if (activeObjectId !== overObjectId) {
        const oldIndex = objects.findIndex((o) => o.id === activeObjectId);
        const newIndex = objects.findIndex((o) => o.id === overObjectId);

        const newObjects = arrayMove(objects, oldIndex, newIndex);
        setObjects(newObjects);

        for (let i = 0; i < newObjects.length; i++) {
          await db.objects.update(newObjects[i].id, { order: i });
        }
      }
    }
  };

  const activeObject = activeId && activeId.toString().startsWith('object-')
    ? objects.find(o => o.id === parseInt(activeId.toString().replace('object-', '')))
    : null;

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={goBack} 
              className={`p-2 rounded-xl ${t.card} shadow hover:shadow-lg transition-all`}
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{group.name}</h1>
            </div>
          </div>

          {/* Add Object */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newObjectName}
              onChange={(e) => setNewObjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addObject()}
              placeholder="New object name..."
              className={`flex-1 px-4 py-3 rounded-xl ${t.input} border focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm sm:text-base`}
            />
            <button 
              onClick={addObject} 
              className={`px-4 sm:px-6 py-3 rounded-xl ${t.button} shadow hover:shadow-lg transition-all whitespace-nowrap`}
            >
              <span className="hidden sm:inline">Add Object</span>
              <Plus size={20} className="sm:hidden" />
            </button>
          </div>

          {/* Objects Grid */}
          <SortableContext
            items={objects.map((o) => `object-${o.id}`)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {objects.map((obj) => (
                <SortableObject
                  key={obj.id}
                  object={obj}
                  onClick={() => viewObject(obj)}
                  onDelete={() => deleteObject(obj.id)}
                  theme={theme}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeObject ? (
              <div className={`${t.object || t.card} p-4 sm:p-5 rounded-xl shadow-2xl scale-105`}>
                <h4 className="font-semibold text-sm sm:text-base">{activeObject.name}</h4>
              </div>
            ) : null}
          </DragOverlay>

          {objects.length === 0 && (
            <div className={`${t.card} p-8 rounded-xl text-center ${t.textSecondary} mt-4`}>
              <p>No objects yet. Create one above to get started!</p>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};