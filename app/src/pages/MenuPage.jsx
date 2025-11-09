import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  FolderOpen,
  Plus,
  Trash2,
  X,
  ArrowLeft,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { themes } from "../utils/themes";
import { Avatar } from "../components/Avatar";
import { db } from "../db/database";
import { TodoPage } from "./TodoPage";
import { GroupsPage } from "./GroupsPage";
import leftArrow from "../components/arrow.gif";
import x from "../components/x.gif";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { StudyTimerPage } from "./StudyTimerPage";
export const MenuPage = () => {
  const {
    theme,
    avatarConfig,
    setShowAvatarCreator,
    showSplitView,
    setShowSplitView,
    splitViewFullscreen,
    currentPage,
    setCurrentPage,
    setCustomPageId,
  } = useAppStore();

  const navigate = useNavigate();
  const [customPages, setCustomPages] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [editingColorPage, setEditingColorPage] = useState(null);
  const [tempColor, setTempColor] = useState(null);
  const t = themes[theme];

  // Load pages from IndexedDB
  useEffect(() => {
    loadCustomPages();
  }, []);

  const loadCustomPages = async () => {
    const pages = await db.customPages.toArray();
    setCustomPages(pages.sort((a, b) => (a.order || 0) - (b.order || 0)));
  };

  // Add new custom page with default accent color
  const addCustomPage = async () => {
    const name = prompt("Custom page name:");
    if (name && name.trim()) {
      const order = customPages.length;
      await db.customPages.add({
        name: name.trim(),
        icon: "FolderOpen",
        order,
        color: null, // uses themeaccent until changed
      });
      loadCustomPages();
    }
  };

  // Delete custom page and its related data
  const deleteCustomPage = async (id, e) => {
    e.stopPropagation();
    if (confirm("Delete this custom page?")) {
      await db.customPages.delete(id);

      const groups = await db.groups.where("customPageId").equals(id).toArray();
      for (const group of groups) {
        await db.groups.delete(group.id);
        const objects = await db.objects
          .where("groupId")
          .equals(group.id)
          .toArray();
        for (const obj of objects) {
          await db.objects.delete(obj.id);
          await db.objectFields.where("objectId").equals(obj.id).delete();
          await db.files.where("objectId").equals(obj.id).delete();
        }
      }

      if (selectedMenuItem?.id === id) {
        setSelectedMenuItem(null);
        setShowSplitView(false);
      }
      loadCustomPages();
    }
  };

  // Save color only when user clicks "Save"
  const saveCustomPageColor = async (id) => {
    if (tempColor) {
      await db.customPages.update(id, { color: tempColor });
    }
    setEditingColorPage(null);
    setTempColor(null);
    loadCustomPages();
  };

  const handleMenuItemClick = (item) => {
    setSelectedMenuItem(item);
    setShowSplitView(true);
    if (item.type === "custom") {
      setCustomPageId(item.id);
      setCurrentPage("groups");
    } else {
      setCustomPageId(item.id);
    }
  };

  const closeSplitView = () => {
    setShowSplitView(false);
    setSelectedMenuItem(null);
    setCurrentPage("menu");
  };

  const goBackToMain = () => {
    navigate("main");
  };

  // Default colors for built-in items
  const menuItems = [
    {
      type: "todos",
      label: "To-Do List",
      icon: CheckSquare,
      colorClass: "bg-themesecondary",
    },
     {
    type: "studyTimer",
    label: "Study Timer",
    icon: Clock,
    colorClass: "bg-themeaccent",
   },
    {
      type: "groups",
      label: "Groups",
      icon: FolderOpen,
      colorClass: "bg-themeprimary",
    },
    ...customPages.map((page) => ({
      type: "custom",
      id: page.id,
      label: page.name,
      icon: FolderOpen,
      colorClass: page.color ? "" : "bg-themeaccent",
      color: page.color || null,
    })),
  ];

  const renderRightView = () => {
    if (!selectedMenuItem) return null;

    switch (selectedMenuItem.type) {
      case "todos":
        return <TodoPage embedded />;
      case "studyTimer":
      return <StudyTimerPage />;
      case "groups":
      case "custom":
        return <GroupsPage embedded />;
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen flex ${t.text}`}>
      {/* Left Panel */}
      <div
        className={`${
          showSplitView && !splitViewFullscreen ? "w-full md:w-1/3" : "w-full"
        } 
          ${splitViewFullscreen ? "hidden" : "block"}
          transition-all duration-300 ${t.panel} overflow-y-auto`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={goBackToMain}
                className={`p-2 rounded-full ${t.card} shadow-md hover:shadow-lg hover:scale-105 transition-all`}
                title="Back to main page"
              >
                <img
                  src={leftArrow}
                  style={{
                    filter:
                      "invert(24%) sepia(63%) saturate(320%) hue-rotate(5deg) brightness(92%) contrast(96%)",
                  }}
                ></img>
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold">Menu</h1>
            </div>
            <Avatar
              config={avatarConfig}
              size="md"
              onClick={() => setShowAvatarCreator(true)}
            />
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isEditing = editingColorPage === item.id;
              return (
                <div key={idx} className="relative group">
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className={`w-full ${
                      t.card
                    } border border-themeaccent p-6 sm:p-8 rounded-2xl hover:shadow-2xl 
                      transition-all duration-300 flex flex-col items-center gap-3 sm:gap-4
                      hover:scale-105 ${
                        selectedMenuItem?.label === item.label
                          ? "ring-4 ring-red-500"
                          : ""
                      }`}
                  >
                    <div
                      className={`p-3 sm:p-4 rounded-full flex items-center justify-center ${item.colorClass}`}
                      style={item.color ? { backgroundColor: item.color } : {}}
                    >
                      <Icon size={32} className="text-white sm:w-12 sm:h-12" />
                    </div>
                    <span className="font-semibold text-center text-sm sm:text-base">
                      {item.label}
                    </span>
                  </button>

                  {item.type === "custom" && (
                    <>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => deleteCustomPage(item.id, e)}
                        className="absolute top-2 right-2 bg-themeprimary text-white p-2 rounded-full 
                          opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-themesecondary"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Color Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingColorPage(item.id);
                          setTempColor(item.color || "#f59e0b");
                        }}
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-md bg-themeaccent"
                          title="Edit icon color"
                        ></div>
                      </button>

                      {/* Color Picker Popover */}
                      {isEditing && (
                        <div
                          className="absolute bottom-10 right-2 bg-white shadow-lg rounded-lg p-3 z-20 flex flex-col gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="color"
                            className="w-full h-10 cursor-pointer rounded"
                            value={tempColor}
                            onChange={(e) => setTempColor(e.target.value)}
                          />
                          <div className="flex justify-between gap-2">
                            <button
                              onClick={() => saveCustomPageColor(item.id)}
                              className="flex-1 bg-themeprimary text-white text-xs py-1 rounded hover:opacity-90"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingColorPage(null);
                                setTempColor(null);
                              }}
                              className="flex-1 bg-gray-300 text-black text-xs py-1 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Add Custom Page */}
            <button
              onClick={addCustomPage}
              className={`${t.card} p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl 
                transition-all duration-300 flex flex-col items-center gap-3 sm:gap-4
                border-2 border-dashed ${t.border} hover:scale-105`}
            >
              <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-themeprimary to-themesecondary">
                <Plus size={32} className="text-white sm:w-12 sm:h-12" />
              </div>
              <span className="font-semibold text-center text-sm sm:text-base">
                Add Custom
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      {showSplitView && (
        <div
          className={`${
            splitViewFullscreen ? "w-full" : "hidden md:block md:w-2/3"
          } 
            ${t.panel} border-l ${
            t.divider
          } relative transition-all duration-300
            animate-slide-in-right`}
        >
          <button
            onClick={closeSplitView}
            className={`absolute top-4 left-4 z-10 p-2 rounded-full ${t.card} shadow-lg hover:shadow-xl transition-all`}
          >
            <img
              src={x}
              style={{
                filter:
                  "invert(24%) sepia(63%) saturate(320%) hue-rotate(5deg) brightness(92%) contrast(96%)",
              }}
            ></img>
          </button>

          <div className="h-full overflow-y-auto pt-16">
            {renderRightView()}
          </div>
        </div>
      )}

      {/* Animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
