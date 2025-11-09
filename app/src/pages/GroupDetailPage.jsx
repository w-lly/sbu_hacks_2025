import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronLeft, Calendar, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { themes } from '../utils/themes';
import { db } from '../db/database';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import {
  DndContext,
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

// Expanded color palette for different objects
const objectColors = [
  'bg-purple-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-pink-400',
  'bg-indigo-400',
  'bg-red-400',
  'bg-teal-400',
  'bg-orange-400',
  'bg-cyan-400',
  'bg-violet-400',
  'bg-fuchsia-400',
  'bg-rose-400',
  'bg-sky-400',
  'bg-emerald-400',
  'bg-lime-400',
  'bg-amber-400',
  'bg-slate-400',
];

const SortableObject = ({ object, onClick, onDelete, theme, duration, onDurationChange }) => {
  const t = themes[theme];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `object-${object.id}`, data: { type: 'object', object, duration } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      onDurationChange(object.id, 0);
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 96) {
      onDurationChange(object.id, numValue);
    }
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
          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs text-gray-600">Duration:</label>
            <input
              type="number"
              value={duration}
              onChange={handleDurationChange}
              onClick={(e) => e.stopPropagation()}
              min="0"
              max="96"
              step="1"
              className="w-16 px-2 py-1 text-xs border rounded focus:ring-2 focus:ring-purple-400 outline-none"
            />
            <span className="text-xs text-gray-600">× 15min</span>
          </div>
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

const EditDurationModal = ({ scheduleItem, onClose, onSave, objectColor }) => {
  const [duration, setDuration] = useState(scheduleItem.duration || 1);

  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setDuration(0);
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 96) {
      setDuration(numValue);
    }
  };

  const formatDuration = (blocks) => {
    const totalMinutes = blocks * 15;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}hr`;
    return `${hours}hr ${minutes}min`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Edit Duration</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className={`${objectColor} text-white p-3 rounded-lg mb-4`}>
          <div className="font-semibold">{scheduleItem.objectName}</div>
          <div className="text-sm opacity-90">{scheduleItem.day} at {scheduleItem.time}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Duration (15-minute blocks)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={duration}
              onChange={handleDurationChange}
              min="0"
              max="96"
              step="1"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
            />
            <span className="text-sm text-gray-600">= {formatDuration(duration)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(duration)}
            className="flex-1 px-4 py-2 bg-purple-400 text-white rounded-lg hover:bg-purple-500 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export const GroupDetailPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { theme } = useAppStore();
  
  const [group, setGroup] = useState(null);
  const [objects, setObjects] = useState([]);
  const [newObjectName, setNewObjectName] = useState('');
  const [newObjectDuration, setNewObjectDuration] = useState(0);
  const [activeId, setActiveId] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [objectColorMap, setObjectColorMap] = useState({});
  const [objectDurations, setObjectDurations] = useState({});
  const [editingScheduleItem, setEditingScheduleItem] = useState(null);
  const t = themes[theme];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      times.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }

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
      loadSchedule();
    }
  }, [groupId]);

  const loadData = async () => {
    const groupData = await db.groups.get(parseInt(groupId));
    setGroup(groupData);

    const allObjects = await db.objects.toArray();
    const filtered = allObjects.filter(o => o.groupId === parseInt(groupId));
    setObjects(filtered.sort((a, b) => (a.order || 0) - (b.order || 0)));
    
    const colorMap = {};
    const durationMap = {};
    filtered.forEach((obj, index) => {
      colorMap[obj.id] = objectColors[index % objectColors.length];
      durationMap[obj.id] = obj.defaultDuration || 0;
    });
    setObjectColorMap(colorMap);
    setObjectDurations(durationMap);
  };

  const loadSchedule = async () => {
    const items = await db.scheduleItems?.where('groupId').equals(parseInt(groupId)).toArray() || [];
    setScheduleItems(items);
  };

  const addObject = async () => {
    if (newObjectName.trim()) {
      const order = objects.length;
      await db.objects.add({ 
        groupId: parseInt(groupId), 
        name: newObjectName.trim(), 
        order,
        defaultDuration: newObjectDuration
      });
      setNewObjectName('');
      setNewObjectDuration(0);
      loadData();
    }
  };

  const deleteObject = async (id) => {
    if (confirm('Delete this object and all its data?')) {
      await db.objects.delete(id);
      await db.objectFields.where('objectId').equals(id).delete();
      await db.files.where('objectId').equals(id).delete();
      await db.scheduleItems?.where('objectId').equals(id).delete();
      loadData();
      loadSchedule();
    }
  };

  const updateObjectDuration = async (objectId, duration) => {
    if (duration < 0) duration = 0;
    if (duration > 96) duration = 96;
    setObjectDurations(prev => ({ ...prev, [objectId]: duration }));
    await db.objects.update(objectId, { defaultDuration: duration });
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

  const checkConflict = (day, startTime, duration, excludeItemId = null) => {
    const startIndex = times.indexOf(startTime);
    if (startIndex === -1) return true;

    for (let i = 0; i < duration; i++) {
      const checkIndex = startIndex + i;
      if (checkIndex >= times.length) return true;
      
      const checkTime = times[checkIndex];
      const conflict = scheduleItems.find(
        s => s.id !== excludeItemId && s.day === day && s.time === checkTime
      );
      if (conflict) return true;
    }
    return false;
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id.toString().startsWith('schedule-item-')) {
      const itemId = parseInt(active.id.toString().replace('schedule-item-', ''));
      const item = scheduleItems.find(s => s.id === itemId);
      
      if (!item || !over.id.toString().startsWith('schedule-')) return;

      const parts = over.id.toString().split('-');
      const newDay = parts[1];
      const newTime = parts.slice(2).join('-');

      if (!checkConflict(newDay, newTime, item.duration, item.id)) {
        await db.scheduleItems?.update(item.id, {
          day: newDay,
          time: newTime
        });
        loadSchedule();
      }
      return;
    }

    const activeObjectId = parseInt(active.id.toString().replace('object-', ''));

    if (over.id.toString().startsWith('schedule-')) {
      const parts = over.id.toString().split('-');
      const day = parts[1];
      const time = parts.slice(2).join('-');
      const object = objects.find(o => o.id === activeObjectId);
      
      if (object) {
        const duration = objectDurations[object.id] || 0;
        
        if (duration === 0) {
          alert('Cannot add object to schedule - duration is set to 0. Please set a duration first.');
          return;
        }
        
        if (checkConflict(day, time, duration)) {
          alert('Cannot place object here - conflicts with existing schedule items');
          return;
        }
        
        await db.scheduleItems?.add({
          groupId: parseInt(groupId),
          objectId: object.id,
          objectName: object.name,
          day,
          time,
          duration
        });
        
        loadSchedule();
      }
      return;
    }

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

  const removeScheduleItem = async (item) => {
    await db.scheduleItems?.delete(item.id);
    loadSchedule();
  };

  const handleEditScheduleItem = (item) => {
    setEditingScheduleItem(item);
  };

  const handleSaveDuration = async (newDuration) => {
    if (!editingScheduleItem) return;

    if (newDuration === 0) {
      alert('Duration must be at least 1 block (15 minutes)');
      return;
    }

    if (checkConflict(editingScheduleItem.day, editingScheduleItem.time, newDuration, editingScheduleItem.id)) {
      alert('Cannot change duration - conflicts with existing schedule items');
      return;
    }

    await db.scheduleItems?.update(editingScheduleItem.id, { duration: newDuration });
    setEditingScheduleItem(null);
    loadSchedule();
  };

  const activeObject = activeId && activeId.toString().startsWith('object-')
    ? objects.find(o => o.id === parseInt(activeId.toString().replace('object-', '')))
    : null;

  const activeObjectDuration = activeObject ? (objectDurations[activeObject.id] || 0) : 0;

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const sortableItems = [
    ...objects.map((o) => `object-${o.id}`),
    ...scheduleItems.map(item => `schedule-item-${item.id}`),
    ...days.flatMap(day => times.map(time => `schedule-${day}-${time}`))
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={goBack} 
              className={`p-2 rounded-xl ${t.card} shadow hover:shadow-lg transition-all`}
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{group.name}</h1>
            </div>
          </div>

          {/* Add Object and Calendar Toggle */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newObjectName}
              onChange={(e) => setNewObjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addObject()}
              placeholder="New object name..."
              className={`flex-1 px-4 py-3 rounded-xl ${t.input} border focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm sm:text-base`}
            />
            <select
              value={newObjectDuration}
              onChange={(e) => setNewObjectDuration(parseInt(e.target.value))}
              className={`px-3 py-3 rounded-xl ${t.input} border focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm sm:text-base max-h-48 overflow-y-auto`}
            >
              {Array.from({ length: 97 }, (_, i) => {
                const totalMinutes = i * 15;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;

                const label =
                  hours === 0
                    ? `${minutes} min`
                    : minutes === 0
                    ? `${hours} hr`
                    : `${hours} hr ${minutes} min`;

                return (
                  <option key={i} value={i}>
                    {label}
                  </option>
                );
              })}
            </select>
            <button 
              onClick={addObject} 
              className={`px-4 sm:px-6 py-3 rounded-xl ${t.button} shadow hover:shadow-lg transition-all whitespace-nowrap`}
            >
              <span className="hidden sm:inline">Add Object</span>
              <Plus size={20} className="sm:hidden" />
            </button>
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className={`px-4 py-3 rounded-xl shadow hover:shadow-lg transition-all ${
                showSchedule 
                  ? 'bg-purple-400 text-white hover:bg-purple-500' 
                  : `${t.card}`
              }`}
              title={showSchedule ? "Hide schedule" : "Show schedule"}
            >
              <Calendar size={20} />
            </button>
          </div>

          {/* Schedule Calendar Component */}
          {showSchedule && (
            <div className='sticky top-0 z-999 bg-white'>
            <ScheduleCalendar
              theme={theme}
              scheduleItems={scheduleItems}
              objectColorMap={objectColorMap}
              onRemove={removeScheduleItem}
              onEdit={handleEditScheduleItem}
              onClose={() => setShowSchedule(false)}
              sortableItems={sortableItems}
            />
            </div>
          )}

          {/* Objects Grid */}
          <SortableContext
            items={sortableItems}
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
                  duration={objectDurations[obj.id] !== undefined ? objectDurations[obj.id] : 0}
                  onDurationChange={updateObjectDuration}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeObject ? (
              <div className={`${t.object || t.card} p-4 sm:p-5 rounded-xl shadow-2xl scale-105`}>
                <h4 className="font-semibold text-sm sm:text-base">{activeObject.name}</h4>
                <div className="text-xs text-gray-600 mt-1">
                  Duration: {activeObjectDuration === 0 ? 'Not set (0 min)' : `${activeObjectDuration} × 15min (${activeObjectDuration * 15} min)`}
                </div>
                {activeObjectDuration === 0 && (
                  <div className="text-xs text-red-500 mt-1">
                    Cannot add to calendar
                  </div>
                )}
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

      {/* Edit Duration Modal */}
      {editingScheduleItem && (
        <EditDurationModal
          scheduleItem={editingScheduleItem}
          onClose={() => setEditingScheduleItem(null)}
          onSave={handleSaveDuration}
          objectColor={objectColorMap[editingScheduleItem.objectId] || 'bg-gray-400'}
        />
      )}
    </DndContext>
  );
};