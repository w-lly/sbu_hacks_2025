import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
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

const SortableGroup = ({ group, onClick, onDelete, theme, objectCount }) => {
  const t = themes[theme];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `group-${group.id}`, data: { type: 'group', group } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${t.group} p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 
        ${isDragging ? 'z-50 scale-105' : 'z-0'} cursor-pointer group`}
    >
      <div className="flex justify-between items-start mb-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing mr-2"
        >
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                <div className="w-1 h-1 rounded-full bg-purple-400"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1" onClick={onClick}>
          <h3 className="text-lg sm:text-xl font-bold mb-1">{group.name}</h3>
          <p className={`text-xs sm:text-sm ${t.textSecondary}`}>
            {objectCount} {objectCount === 1 ? 'item' : 'items'}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div onClick={onClick} className="flex items-center justify-end text-purple-600 dark:text-purple-400 text-sm font-medium">
        <span>View</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

export const GroupsPage = ({ embedded = false }) => {
  const { 
    theme, 
    customPageId, 
    setSelectedGroup, 
    setCurrentPage,
    setBreadcrumbs 
  } = useAppStore();
  
  const [groups, setGroups] = useState([]);
  const [objects, setObjects] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
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
    loadGroups();
  }, [customPageId]);

  const loadGroups = async () => {
    const allGroups = await db.groups.toArray();
    const filtered = customPageId 
      ? allGroups.filter(g => g.customPageId === customPageId)
      : allGroups.filter(g => !g.customPageId);
    setGroups(filtered.sort((a, b) => (a.order || 0) - (b.order || 0)));

    const allObjects = await db.objects.toArray();
    setObjects(allObjects);
  };

  const getObjectCount = (groupId) => {
    return objects.filter(o => o.groupId === groupId).length;
  };

  const addGroup = async () => {
    if (newGroupName.trim()) {
      const order = groups.length;
      const groupData = { name: newGroupName.trim(), order };
      if (customPageId) groupData.customPageId = customPageId;
      await db.groups.add(groupData);
      setNewGroupName('');
      loadGroups();
    }
  };

  const deleteGroup = async (id) => {
    if (confirm('Delete this group and all its objects?')) {
      await db.groups.delete(id);
      
      const objsToDelete = objects.filter(o => o.groupId === id);
      for (const obj of objsToDelete) {
        await db.objects.delete(obj.id);
        await db.objectFields.where('objectId').equals(obj.id).delete();
        await db.files.where('objectId').equals(obj.id).delete();
      }
      
      loadGroups();
    }
  };

  const viewGroup = (group) => {
    setSelectedGroup(group);
    const pageName = customPageId ? 'Custom Group' : 'Groups';
    setBreadcrumbs([{ name: pageName }, { name: group.name }]);
    setCurrentPage('group-detail');
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Handle group reordering
    if (active.id.toString().startsWith('group-') && over.id.toString().startsWith('group-')) {
      const activeGroupId = parseInt(active.id.toString().replace('group-', ''));
      const overGroupId = parseInt(over.id.toString().replace('group-', ''));

      if (activeGroupId !== overGroupId) {
        const oldIndex = groups.findIndex((g) => g.id === activeGroupId);
        const newIndex = groups.findIndex((g) => g.id === overGroupId);

        const newGroups = arrayMove(groups, oldIndex, newIndex);
        setGroups(newGroups);

        for (let i = 0; i < newGroups.length; i++) {
          await db.groups.update(newGroups[i].id, { order: i });
        }
      }
    }
  };

  const activeGroup = activeId && activeId.toString().startsWith('group-')
    ? groups.find(g => g.id === parseInt(activeId.toString().replace('group-', '')))
    : null;

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} p-4 sm:p-6 md:p-8`}>
      <div className="max-w-6xl mx-auto">
        {!embedded && (
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Groups</h1>
        )}

        {/* Add Group */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGroup()}
            placeholder="New group name..."
            className={`flex-1 px-4 py-3 rounded-xl ${t.input} border focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm sm:text-base`}
          />
          <button 
            onClick={addGroup} 
            className={`px-4 sm:px-6 py-3 rounded-xl ${t.button} shadow hover:shadow-lg transition-all whitespace-nowrap`}
          >
            <span className="hidden sm:inline">Add Group</span>
            <Plus size={20} className="sm:hidden" />
          </button>
        </div>

        {/* Groups Grid with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={groups.map((g) => `group-${g.id}`)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {groups.map((group) => (
                <SortableGroup
                  key={group.id}
                  group={group}
                  onClick={() => viewGroup(group)}
                  onDelete={() => deleteGroup(group.id)}
                  theme={theme}
                  objectCount={getObjectCount(group.id)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeGroup ? (
              <div className={`${t.group} p-6 rounded-2xl shadow-2xl scale-105`}>
                <h3 className="text-lg sm:text-xl font-bold">{activeGroup.name}</h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {groups.length === 0 && (
          <div className={`${t.card} p-8 rounded-xl text-center ${t.textSecondary}`}>
            <p>No groups yet. Create one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};