import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { themes } from '../utils/themes';
import leftArrow from "../components/arrow.gif";
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
      className={`${t.object} p-4 sm:p-5 rounded-xl shadow hover:shadow-lg transition-all duration-200 
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
              <div key={i} className="w-1 h-1 rounded-full bg-themeprimary"></div>
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
  const { 
    theme, 
    selectedGroup, 
    setCurrentPage, 
    breadcrumbs,
    setBreadcrumbs,
    setSelectedObject,
    customPageId,
    showSplitView
  } = useAppStore();
  
  const [objects, setObjects] = useState([]);
  const [groups, setGroups] = useState([]);
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
    if (selectedGroup) {
      loadData();
    }
  }, [selectedGroup]);

  const loadData = async () => {
    const allObjects = await db.objects.toArray();
    const filtered = allObjects.filter(o => o.groupId === selectedGroup.id);
    setObjects(filtered.sort((a, b) => (a.order || 0) - (b.order || 0)));

    // Load all groups for cross-panel drag
    const allGroups = await db.groups.toArray();
    const filteredGroups = customPageId 
      ? allGroups.filter(g => g.customPageId === customPageId)
      : allGroups.filter(g => !g.customPageId);
    setGroups(filteredGroups);
  };

  const addObject = async () => {
    if (newObjectName.trim()) {
      const order = objects.length;
      await db.objects.add({ 
        groupId: selectedGroup.id, 
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
    setSelectedObject(obj);
    setBreadcrumbs([...breadcrumbs, { name: obj.name }]);
    setCurrentPage('object-detail');
  };

  const goBack = () => {
    if (showSplitView) {
      setCurrentPage('groups');
      setBreadcrumbs([]);
    } else {
      const prevPage = customPageId ? `custom-${customPageId}` : 'groups';
      setCurrentPage(prevPage);
      setBreadcrumbs([]);
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
    const activeObject = objects.find(o => o.id === activeObjectId);

    // Check if dropped on a group (cross-panel drag)
    if (over.id.toString().startsWith('group-')) {
      const targetGroupId = parseInt(over.id.toString().replace('group-', ''));
      
      if (activeObject && activeObject.groupId !== targetGroupId) {
        await db.objects.update(activeObjectId, { groupId: targetGroupId });
        loadData();
        
        // Reload groups view if in split view
        if (showSplitView) {
          window.dispatchEvent(new CustomEvent('reload-groups'));
        }
      }
    }
    // Reorder within same group
    else if (over.id.toString().startsWith('object-')) {
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

  if (!selectedGroup) return null;

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
              <img
                src={leftArrow}
                style={{
                  filter:
                    "invert(24%) sepia(63%) saturate(320%) hue-rotate(5deg) brightness(92%) contrast(96%)",
                }}
              ></img>
            </button>
            <div>
              <div className={`text-xs sm:text-sm ${t.textSecondary} flex items-center gap-1`}>
                {breadcrumbs.slice(0, -1).map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <span>{crumb.name}</span>
                    {idx < breadcrumbs.length - 2 && <ChevronRight size={12} />}
                  </React.Fragment>
                ))}
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{selectedGroup.name}</h1>
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
              className={`flex-1 px-4 py-3 rounded-xl ${t.input} border focus:ring-2 focus:ring-themeaccent outline-none transition-all text-sm sm:text-base`}
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
              <div className={`${t.object} p-4 sm:p-5 rounded-xl shadow-2xl scale-105`}>
                <h4 className="font-semibold text-sm sm:text-base">{activeObject.name}</h4>
              </div>
            ) : null}
          </DragOverlay>

          {objects.length === 0 && (
            <div className={`${t.card} p-8 rounded-xl text-center ${t.textSecondary} mt-4`}>
              <p>No objects yet. Create one above to get started!</p>
            </div>
          )}

          {showSplitView && objects.length > 0 && (
            <div className={`${t.card} p-4 rounded-xl mt-6 text-center ${t.textSecondary} text-sm`}>
              <p>💡 Tip: Drag objects to groups in the left panel to move them</p>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};