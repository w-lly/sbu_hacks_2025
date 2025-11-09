import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ChevronRight, FolderPlus } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { themes } from '../utils/themes';
import { db } from '../db/database';
import leftArrow from '../components/arrow.gif';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* -------------------------
   SortableGroup (editable name)
   ------------------------- */
const SortableGroup = ({
  group,
  onClick,
  onDelete,
  onRename,
  theme,
  objectCount,
  containerId,
  children,
  hoveredGroupId,
  hoveredObjectId,
  setHoveredGroupId,
}) => {
  const t = themes[theme];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `group-${group.id}`, data: { type: "group", group } });

  const [isEditing, setIsEditing] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editName, setEditName] = useState(group.name || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setEditName(group.name || "");
  }, [group.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveName = async () => {
    const trimmed = (editName || "").trim();
    if (trimmed && trimmed !== group.name) {
      await onRename(group.id, trimmed);
    } else {
      // if empty or unchanged just exit editing
      setEditName(group.name || "");
    }
    setIsEditing(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // show group delete only when group itself is hovered AND no object inside is actively hovered
  const isGroupHovered = hoveredGroupId === group.id;
  const shouldShowGroupDelete = isGroupHovered && !hoveredObjectId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHoveredGroupId(group.id)}
      onMouseLeave={() => setHoveredGroupId(prev => (prev === group.id ? null : prev))}
      className={`${t.group} flex flex-col p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 
        ${isDragging ? 'z-50 scale-105' : 'z-0'} cursor-pointer`}
      data-group-wrapper
    >
      <div className="flex flex col justify-center mb-3">
        <div 
          {...attributes} 
          {...listeners} 
          className="pr-3 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing mr-2"
        >
          <div className="flex flex-col gap-1">
            {[...Array(3)].map((_, row) => (
              <div key={row} className="flex gap-1">
                {[...Array(2)].map((_, col) => (
                  <div
                    key={col}
                    className="w-1 h-1 rounded-full bg-themeprimary"
                    style={{ opacity: col % 2 === 0 ? 1 : 0.8 }}
                  ></div>
                ))}
          <div className="flex flex-col gap-1">
            {[...Array(3)].map((_, row) => (
              <div key={row} className="flex gap-1">
                {[...Array(2)].map((_, col) => (
                  <div
                    key={col}
                    className="w-1 h-1 rounded-full bg-themeprimary"
                    style={{ opacity: col % 2 === 0 ? 1 : 0.8 }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Title area: clicking viewGroup, dblclick to edit */}
        <div className="flex-1" onClick={onClick}>
          {!isEditing ? (
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="select-none"
            >
              <h3 className="text-lg sm:text-xl font-bold mb-1">
                {group.name}
              </h3>
              <p className={`text-xs sm:text-sm ${t.textSecondary}`}>
                {objectCount} {objectCount === 1 ? "item" : "items"}
              </p>
            </div>
          ) : (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveName();
                  } else if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditName(group.name || "");
                  }
                }}
                className={`w-full px-3 py-2 rounded-md ${t.input} border focus:ring-2 focus:ring-themeaccent outline-none text-sm`}
                className={`w-full px-3 py-2 rounded-md ${t.input} border focus:ring-2 focus:ring-themeaccent outline-none text-sm`}
              />
            </div>
          )}
        </div>

        {/* delete (visible only when hovering the group area AND no object is hovered) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all ${
            shouldShowGroupDelete
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          aria-label={`Delete group ${group.name}`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* children: the droppable container that holds objects for this group */}
      <div
        id={`group-container-${group.id}`}
        data-group-id={group.id}
        className="min-h-[48px] mt-3"
      >
        {children}
      </div>

      <div onClick={onClick} className="flex items-center justify-end text-themetext text-sm font-medium mt-3">
        <span>View</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};

/* -------------------------
   SortableObject (delete only on hover)
   ------------------------- */
const SortableObject = ({
  object,
  onClick,
  theme,
  onDelete,
  hoveredObjectId,
  setHoveredObjectId,
}) => {
  const t = themes[theme];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `object-${object.id}`,
    data: { type: "object", object },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const isThisObjectHovered = hoveredObjectId === object.id;

  return (
    // add 'data-object' attribute for clarity
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setHoveredObjectId(object.id)}
      onMouseLeave={() => setHoveredObjectId(prev => (prev === object.id ? null : prev))}
      className={`p-6 rounded-lg border ${t.card} flex items-center justify-between gap-3 cursor-pointer`}
      onClick={(e) => { e.stopPropagation(); onClick(object); }}
      data-object
    >
      <div className="flex items-center gap-3">
        {/* small drag handle visual (not necessary, already draggable) */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <div className="w-3 h-3 rounded-sm bg-themeprimary"></div>
        </div>
        <div>
          <div className="text-sm font-medium">
            {object.name || `Object ${object.id}`}
          </div>
          <div className={`text-xs ${t.textSecondary}`}>
            {object.summary || ""}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(object);
          }}
          className={`text-red-500 hover:text-red-700 p-1 rounded transition-all ${
            isThisObjectHovered
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          aria-label={`Delete object ${object.name || object.id}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

/* -------------------------
   GroupsPage (main)
   ------------------------- */
export const GroupsPage = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { customPageId: urlCustomPageId } = useParams();
  const { 
    theme, 
    customPageId: storeCustomPageId,
    setCurrentPage,
  } = useAppStore();

  const [groups, setGroups] = useState([]);
  const [objects, setObjects] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [pageTitle, setPageTitle] = useState("Groups");
  const [editingPageTitle, setEditingPageTitle] = useState(false);
  const pageTitleRef = useRef(null);

  // Hover state: track which group or object is hovered to control delete button visibility precisely
  const [hoveredGroupId, setHoveredGroupId] = useState(null);
  const [hoveredObjectId, setHoveredObjectId] = useState(null);

  // Use URL param if available, otherwise use store value
  const activeCustomPageId = urlCustomPageId || storeCustomPageId;

  const t = themes[theme];

  // Use URL param if available, otherwise use store value
  const activeCustomPageId = customPageId || storeCustomPageId;

  useEffect(() => {
    loadGroups();

    // load persisted page title from localStorage (per customPageId)
    const key = `groupsPageTitle_${activeCustomPageId ?? 'default'}`;
    const saved = localStorage.getItem(key);
    if (saved) setPageTitle(saved);
  }, [activeCustomPageId]);

  useEffect(() => {
    if (editingPageTitle && pageTitleRef.current) {
      pageTitleRef.current.focus();
      pageTitleRef.current.select();
    }
  }, [editingPageTitle]);

  const loadGroups = async () => {
    let allGroups;
    
    if (activeCustomPageId) {
      allGroups = await db.groups
        .where('customPageId')
        .equals(parseInt(activeCustomPageId))
        .toArray();
    } else {
      allGroups = await db.groups
        .filter(g => !g.customPageId)
        .toArray();
    }
    
    setGroups(allGroups.sort((a, b) => (a.order || 0) - (b.order || 0)));

    const allObjects = await db.objects.toArray();
    setObjects(allObjects);
  };

  const getObjectCount = (groupId) => {
    return objects.filter((o) => o.groupId === groupId).length;
  };

  const addGroup = async () => {
    const name = prompt('Group name:');
    if (name && name.trim()) {
      const order = groups.length;
      const groupData = { name: newGroupName.trim(), order };
      
      if (activeCustomPageId) {
        groupData.customPageId = parseInt(activeCustomPageId);
      }
      
      await db.groups.add(groupData);
      setNewGroupName("");
      loadGroups();
    }
  };

  const deleteGroup = async (id) => {
    if (confirm("Delete this group and all its objects?")) {
      await db.groups.delete(id);

      const objsToDelete = objects.filter((o) => o.groupId === id);
      for (const obj of objsToDelete) {
        await db.objects.delete(obj.id);
        await db.objectFields.where("objectId").equals(obj.id).delete();
        await db.files.where("objectId").equals(obj.id).delete();
      }

      loadGroups();
    }
  };

  const deleteObject = async (object) => {
    if (confirm("Delete this object?")) {
      await db.objects.delete(object.id);
      await db.objectFields.where("objectId").equals(object.id).delete();
      await db.files.where("objectId").equals(object.id).delete();
      await loadGroups();
    }
  };

  const renameGroup = async (groupId, newName) => {
    // persist
    await db.groups.update(groupId, { name: newName });

    // update local state immediately for snappy UI
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name: newName } : g))
    );

    // also refresh full load in case there are other derived pieces
    loadGroups();
  };

  const viewGroup = (group) => {
    // Navigate to the group detail page
    navigate(`/group/${group.id}`);
  };

  const viewObject = (object) => {
    // Navigate to the object detail page
    navigate(`/object/${object.id}`);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    // ---------- GROUP reordering ----------
    if (activeIdStr.startsWith("group-") && overIdStr.startsWith("group-")) {
      const activeGroupId = parseInt(activeIdStr.replace("group-", ""));
      const overGroupId = parseInt(overIdStr.replace("group-", ""));
      if (activeGroupId !== overGroupId) {
        const oldIndex = groups.findIndex((g) => g.id === activeGroupId);
        const newIndex = groups.findIndex((g) => g.id === overGroupId);

        const newGroups = arrayMove(groups, oldIndex, newIndex);
        setGroups(newGroups);

        // persist group order
        for (let i = 0; i < newGroups.length; i++) {
          await db.groups.update(newGroups[i].id, { order: i });
        }
      }
      return;
    }

    // ---------- OBJECT drag handling ----------
    if (activeIdStr.startsWith("object-")) {
      const activeObjectId = parseInt(activeIdStr.replace("object-", ""));
      const activeObject = objects.find((o) => o.id === activeObjectId);
      if (!activeObject) return;

      // Case A: dropped on another object
      if (overIdStr.startsWith("object-")) {
        const overObjectId = parseInt(overIdStr.replace("object-", ""));
        const overObject = objects.find((o) => o.id === overObjectId);
        if (!overObject) return;

        const sourceGroupId = activeObject.groupId;
        const targetGroupId = overObject.groupId;

        const sourceGroupObjects = objects
          .filter((o) => o.groupId === sourceGroupId)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        const targetGroupObjects = objects
          .filter((o) => o.groupId === targetGroupId)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        const oldIndex = sourceGroupObjects.findIndex(
          (o) => o.id === activeObjectId
        );
        const newIndex = targetGroupObjects.findIndex(
          (o) => o.id === overObjectId
        );

        // If moving within the same group, reorder
        if (sourceGroupId === targetGroupId) {
          const reordered = arrayMove(sourceGroupObjects, oldIndex, newIndex);
          const updatedObjects = objects.map((o) => {
            if (o.groupId !== sourceGroupId) return o;
            const idx = reordered.findIndex((x) => x.id === o.id);
            return idx === -1 ? o : { ...o, order: idx };
          });
          setObjects(updatedObjects);

          for (let i = 0; i < reordered.length; i++) {
            await db.objects.update(reordered[i].id, { order: i });
          }
        } else {
          // Moving between groups
          const newSource = [...sourceGroupObjects];
          const [moved] = newSource.splice(oldIndex, 1);
          moved.groupId = targetGroupId;

          const newTarget = [...targetGroupObjects];
          newTarget.splice(newIndex, 0, moved);

          // assign orders
          for (let i = 0; i < newTarget.length; i++) newTarget[i].order = i;
          for (let i = 0; i < newSource.length; i++) newSource[i].order = i;

          const updatedObjects = objects.map((o) => {
            if (o.id === moved.id) return { ...moved };
            if (o.groupId === sourceGroupId) {
              const idx = newSource.findIndex((x) => x.id === o.id);
              return idx === -1 ? o : { ...o, order: idx };
            }
            if (o.groupId === targetGroupId) {
              const idx = newTarget.findIndex((x) => x.id === o.id);
              return idx === -1 ? o : { ...o, order: idx };
            }
            return o;
          });

          setObjects(updatedObjects);

          const updates = [];
          for (const o of newTarget)
            updates.push(
              db.objects.update(o.id, { groupId: o.groupId, order: o.order })
            );
          for (const o of newSource)
            updates.push(db.objects.update(o.id, { order: o.order }));
          await Promise.all(updates);
        }

        return;
      }

      // Case B: dropped on a group container (header or empty container)
      if (
        overIdStr.startsWith("group-") ||
        overIdStr.startsWith("group-container-")
      ) {
        const groupIdStr = overIdStr.startsWith("group-container-")
          ? overIdStr.replace("group-container-", "")
          : overIdStr.replace("group-", "");
        const targetGroupId = parseInt(groupIdStr);

        const sourceGroupId = activeObject.groupId;

        if (sourceGroupId === targetGroupId) {
          // move to end of same group
          const groupObjs = objects
            .filter((o) => o.groupId === sourceGroupId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          const oldIndex = groupObjs.findIndex((o) => o.id === activeObjectId);
          const newIndex = groupObjs.length - 1;
          if (oldIndex === newIndex) return;
          const reordered = arrayMove(groupObjs, oldIndex, newIndex);
          for (let i = 0; i < reordered.length; i++) {
            await db.objects.update(reordered[i].id, { order: i });
          }
          setObjects(
            objects.map((o) => {
              if (o.groupId !== sourceGroupId) return o;
              const idx = reordered.findIndex((x) => x.id === o.id);
              return { ...o, order: idx };
            })
          );
          return;
        } else {
          // move to different group and append
          const sourceObjs = objects
            .filter((o) => o.groupId === sourceGroupId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          const targetObjs = objects
            .filter((o) => o.groupId === targetGroupId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          const oldIndex = sourceObjs.findIndex((o) => o.id === activeObjectId);
          if (oldIndex === -1) return;

          const [moved] = sourceObjs.splice(oldIndex, 1);
          moved.groupId = targetGroupId;
          targetObjs.push(moved);

          for (let i = 0; i < sourceObjs.length; i++) sourceObjs[i].order = i;
          for (let i = 0; i < targetObjs.length; i++) targetObjs[i].order = i;
          moved.order = targetObjs.findIndex((x) => x.id === moved.id);

          const updated = objects.map((o) => {
            if (o.id === moved.id) return { ...moved };
            if (o.groupId === sourceGroupId) {
              const idx = sourceObjs.findIndex((x) => x.id === o.id);
              return idx === -1 ? o : { ...o, order: idx };
            }
            if (o.groupId === targetGroupId) {
              const idx = targetObjs.findIndex((x) => x.id === o.id);
              return idx === -1 ? o : { ...o, order: idx };
            }
            return o;
          });

          setObjects(updated);

          const updates = [
            ...sourceObjs.map((o) =>
              db.objects.update(o.id, { order: o.order })
            ),
            ...targetObjs.map((o) =>
              db.objects.update(o.id, { order: o.order, groupId: o.groupId })
            ),
          ];
          await Promise.all(updates);

          return;
        }
      }
    }
  };

  const activeGroup =
    activeId && activeId.toString().startsWith("group-")
      ? groups.find(
          (g) => g.id === parseInt(activeId.toString().replace("group-", ""))
        )
      : null;

  const activeObject =
    activeId && activeId.toString().startsWith("object-")
      ? objects.find(
          (o) => o.id === parseInt(activeId.toString().replace("object-", ""))
        )
      : null;

  // Save pageTitle to localStorage when editing finishes
  const persistPageTitle = () => {
    const key = `groupsPageTitle_${activeCustomPageId ?? 'default'}`;
    localStorage.setItem(key, pageTitle);
  };

  const goToMenu = () => {
    navigate('/menu');
  };

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} p-0`}>
      <div className="w-full mx-auto p-4 sm:p-6 md:p-8">
        {!embedded && (
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={goToMenu}
              className={`p-2 rounded-full ${t.card} shadow-md hover:shadow-lg hover:scale-105 transition-all`}
              title="Back to menu page"
            >
              <img
                src={leftArrow}
                style={{
                  filter: 'invert(24%) sepia(63%) saturate(320%) hue-rotate(5deg) brightness(92%) contrast(96%)',
                }}
              />
            </button>

            {!editingPageTitle ? (
              <h1
                className="text-2xl sm:text-3xl font-bold"
                onDoubleClick={() => setEditingPageTitle(true)}
              >
                {pageTitle}
              </h1>
            ) : (
              <input
                ref={pageTitleRef}
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                onBlur={() => {
                  setEditingPageTitle(false);
                  persistPageTitle();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingPageTitle(false);
                    persistPageTitle();
                  } else if (e.key === "Escape") {
                    setEditingPageTitle(false);
                  }
                }}
                className={`mt-0 px-2 py-1 rounded ${t.input} border focus:ring-2 focus:ring-themeaccent outline-none text-2xl`}
                className={`mt-0 px-2 py-1 rounded ${t.input} border focus:ring-2 focus:ring-themeaccent outline-none text-2xl`}
              />
            )}
          </div>
        )}

        {/* Add Group */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addGroup()}
            placeholder="New group name..."
            className={`flex-1 px-4 py-3 rounded-xl ${t.input} border focus:ring-2 focus:ring-themeaccent outline-none transition-all text-sm sm:text-base`}
            className={`flex-1 px-4 py-3 rounded-xl ${t.input} border focus:ring-2 focus:ring-themeaccent outline-none transition-all text-sm sm:text-base`}
          />
          <button
            onClick={addGroup}
            className={`px-4 sm:px-6 py-3 rounded-xl ${t.button} shadow hover:shadow-lg transition-all whitespace-nowrap`}
          >
            <span className="font-semibold">Add Group</span>
          </button>
        </div>

        {/* Groups Grid with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={groups.map((g) => `group-${g.id}`)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {groups.map((group) => {
                // objects for this group (sorted)
                const groupObjects = objects
                  .filter((o) => o.groupId === group.id)
                  .sort((a, b) => (a.order || 0) - (b.order || 0));

                return (
                  <SortableGroup
                    key={group.id}
                    group={group}
                    onClick={() => viewGroup(group)}
                    onDelete={() => deleteGroup(group.id)}
                    onRename={renameGroup}
                    theme={theme}
                    objectCount={groupObjects.length}
                    containerId={`group-container-${group.id}`}
                    hoveredGroupId={hoveredGroupId}
                    hoveredObjectId={hoveredObjectId}
                    setHoveredGroupId={setHoveredGroupId}
                  >
                    {/* Each group container gets its own SortableContext of object items */}
                    <SortableContext
                      items={groupObjects.map((o) => `object-${o.id}`)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {groupObjects.length === 0 ? (
                          <div
                            className={`${t.card} p-3 rounded-md text-xs ${t.textSecondary}`}
                          >
                            No items — drop here to add
                          </div>
                        ) : (
                          groupObjects.map((object) => (
                            <SortableObject
                              key={object.id}
                              object={object}
                              onClick={viewObject}
                              theme={theme}
                              onDelete={deleteObject}
                              hoveredObjectId={hoveredObjectId}
                              setHoveredObjectId={setHoveredObjectId}
                            />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </SortableGroup>
                );
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeGroup ? (
              <div
                className={`${t.group} p-6 rounded-2xl shadow-2xl scale-105`}
              >
                <h3 className="text-lg sm:text-xl font-bold">
                  {activeGroup.name}
                </h3>
              </div>
            ) : null}

            {activeObject ? (
              <div className={`p-3 rounded-lg border ${t.card} shadow-lg`}>
                <div className="text-sm font-medium">
                  {activeObject.name || `Object ${activeObject.id}`}
                </div>
                <div className="text-xs">{activeObject.summary || ""}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {groups.length === 0 && (
          <div
            className={`${t.card} p-8 rounded-xl text-center ${t.textSecondary}`}
          >
            <p>No groups yet. Create one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};