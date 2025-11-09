import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FolderPlus, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/database';
import { themes } from '../utils/themes';

export const GroupsPage = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { customPageId } = useParams(); // Get customPageId from URL params
  const { theme, customPageId: storeCustomPageId } = useAppStore();
  const [groups, setGroups] = useState([]);
  const t = themes[theme];

  // Use URL param if available, otherwise use store value
  const activeCustomPageId = customPageId || storeCustomPageId;

  useEffect(() => {
    loadGroups();
  }, [activeCustomPageId]);

  const loadGroups = async () => {
    let groupList;
    if (activeCustomPageId) {
      groupList = await db.groups
        .where('customPageId')
        .equals(parseInt(activeCustomPageId))
        .toArray();
    } else {
      groupList = await db.groups
        .filter(g => !g.customPageId)
        .toArray();
    }
    setGroups(groupList.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };

  const addGroup = async () => {
    const name = prompt('Group name:');
    if (name && name.trim()) {
      const order = groups.length;
      const groupData = {
        name: name.trim(),
        order
      };
      
      if (activeCustomPageId) {
        groupData.customPageId = parseInt(activeCustomPageId);
      }
      
      await db.groups.add(groupData);
      loadGroups();
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} ${t.panel} p-4 sm:p-6 md:p-8`}>
      <div className="max-w-6xl mx-auto">
        {!embedded && (
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {activeCustomPageId ? 'Custom Groups' : 'Groups'}
            </h1>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleGroupClick(group.id)}
              className={`${t.card} p-6 rounded-2xl shadow-lg hover:shadow-2xl 
                transition-all duration-300 flex items-center justify-between
                hover:scale-105 group`}
            >
              <span className="font-semibold text-lg">{group.name}</span>
              <ChevronRight 
                size={24} 
                className="text-gray-400 group-hover:text-purple-500 transition-colors" 
              />
            </button>
          ))}

          {/* Add Group Button */}
          <button
            onClick={addGroup}
            className={`${t.card} p-6 rounded-2xl shadow-lg hover:shadow-2xl 
              transition-all duration-300 flex flex-col items-center justify-center gap-3
              border-2 border-dashed ${t.border} hover:scale-105`}
          >
            <FolderPlus size={32} className="text-gray-400" />
            <span className="font-semibold">Add Group</span>
          </button>
        </div>
      </div>
    </div>
  );
};