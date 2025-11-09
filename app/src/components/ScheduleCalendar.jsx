import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { themes } from '../utils/themes';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ScheduleCell = ({ day, time, theme, scheduleItem, onRemove, onEdit, objectColor, isFirst, isLast }) => {
  const t = themes[theme];
  const { setNodeRef, isOver } = useSortable({
    id: `schedule-${day}-${time}`,
    data: { type: 'schedule', day, time }
  });

  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDragRef,
  } = useSortable({
    id: scheduleItem ? `schedule-item-${scheduleItem.id}` : null,
    data: { type: 'schedule-item', scheduleItem },
    disabled: !scheduleItem || !isFirst,
  });

  const handleClick = (e) => {
    if (scheduleItem && !e.target.closest('button')) {
      onEdit(scheduleItem);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[40px] transition-all relative ${
        isOver ? 'ring-2 ring-purple-400 ring-inset' : ''
      } ${scheduleItem ? '' : `border ${t.border}`}`}
    >
      {scheduleItem && (
        <div 
          ref={isFirst ? setDragRef : null}
          className={`${objectColor} text-white text-[10px] px-2 py-1 h-full flex flex-col group ${isFirst ? 'cursor-move' : 'cursor-pointer'} relative`}
          {...(isFirst ? dragAttributes : {})}
          {...(isFirst ? dragListeners : {})}
          onClick={handleClick}
        >
          <div className="flex items-center justify-between gap-1 flex-1">
            <span className="truncate flex-1 font-medium">{scheduleItem.objectName}</span>
            {isFirst && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(scheduleItem);
                }}
                className="hover:bg-black/30 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                title="Remove"
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          {scheduleItem.duration > 1 && isFirst && (
            <div className="text-[8px] opacity-75 mt-0.5">
              {Math.trunc(scheduleItem.duration * 15/60)}hr and {(scheduleItem.duration * 15)%60}min
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ScheduleCalendar = ({ 
  theme, 
  scheduleItems, 
  objectColorMap, 
  onRemove, 
  onEdit, 
  onClose,
  sortableItems 
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const t = themes[theme];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 15) {
      times.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }

  const getScheduleItem = (day, time) => {
    const timeIndex = times.indexOf(time);
    
    for (const item of scheduleItems) {
      if (item.day !== day) continue;
      
      const itemTimeIndex = times.indexOf(item.time);
      const duration = item.duration || 1;
      
      if (timeIndex >= itemTimeIndex && timeIndex < itemTimeIndex + duration) {
        const isFirst = timeIndex === itemTimeIndex;
        const isLast = timeIndex === itemTimeIndex + duration - 1;
        
        return { 
          ...item, 
          isExpanded: !isFirst && !isLast,
          isFirst,
          isLast
        };
      }
    }
    
    return null;
  };

  const containerClasses = isZoomed
    ? "fixed inset-0 z-50 bg-white overflow-auto p-6"
    : `${t.card} rounded-xl p-4 mb-6 shadow-lg`;

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center mb-3">
        <h2 className={`font-bold ${isZoomed ? 'text-2xl' : 'text-lg'}`}>Weekly Schedule</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            title={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          {!isZoomed && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className={isZoomed ? "min-w-full" : "min-w-[600px]"}>
          {/* Day Headers */}
          <div className="grid grid-cols-8 mb-2 sticky top-0 bg-white z-10">
            <div className={`font-semibold text-center ${isZoomed ? 'text-base py-2' : 'text-xs'}`}>
              Time
            </div>
            {days.map(day => (
              <div 
                key={day} 
                className={`font-semibold text-center ${isZoomed ? 'text-base py-2' : 'text-xs'}`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Time Rows */}
          <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
            <div className={isZoomed ? "max-h-[calc(100vh-200px)] overflow-y-auto" : "max-h-[300px] overflow-y-auto"}>
              {times.map(time => (
                <div key={time} className="grid grid-cols-8">
                  <div className={`font-medium text-center flex items-center justify-center ${
                    isZoomed ? 'text-sm py-2' : 'text-[10px]'
                  }`}>
                    {time}
                  </div>
                  {days.map(day => {
                    const item = getScheduleItem(day, time);
                    if (item?.isExpanded) {
                      const color = objectColorMap[item.objectId] || 'bg-gray-400';
                      return <div key={day} className={`${color} opacity-90`} />;
                    }
                    return (
                      <ScheduleCell
                        key={day}
                        day={day}
                        time={time}
                        theme={theme}
                        scheduleItem={item}
                        objectColor={item ? objectColorMap[item.objectId] : ''}
                        isFirst={item?.isFirst}
                        isLast={item?.isLast}
                        onRemove={onRemove}
                        onEdit={onEdit}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
};