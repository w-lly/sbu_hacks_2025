import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Link2,
  FileText,
  Image,
  Edit2,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { themes } from "../utils/themes";
import { db } from "../db/database";
import leftArrow from "../components/arrow.gif";

const FeatureCard = ({
  field,
  objects,
  onUpdate,
  onDelete,
  onNavigate,
  theme,
}) => {
  const t = themes[theme];
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value);

  const handleSave = () => {
    onUpdate(field, editValue);
    setIsEditing(false);
  };

  const getIcon = () => {
    switch (field.type) {
      case "link":
        return <Link2 size={20} className="text-blue-500" />;
      case "file":
        return field.value?.startsWith("data:image") ? (
          <Image size={20} className="text-green-500" />
        ) : (
          <FileText size={20} className="text-purple-500" />
        );
      default:
        return <FileText size={20} className="text-gray-500" />;
    }
  };

  return (
    <div
      className={`${t.card} p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="font-semibold text-sm sm:text-base">{field.label}</h3>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {field.type === "text" && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Edit2 size={16} className="text-gray-600" />
            </button>
          )}
          <button
            onClick={() => onDelete(field.id)}
            className="p-1 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      <div className="mt-2">
        {field.type === "link" ? (
          <button
            onClick={() => onNavigate(field.value)}
            className="text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 text-sm sm:text-base"
          >
            <span>
              {objects.find((o) => o.id === parseInt(field.value))?.name ||
                "Unknown"}
            </span>
            <ChevronRight size={16} />
          </button>
        ) : field.type === "file" ? (
          <a
            href={field.value}
            download={field.label}
            className="text-purple-500 hover:text-purple-700 hover:underline text-sm sm:text-base"
          >
            Download file
          </a>
        ) : isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg ${t.input} border focus:ring-2 focus:ring-purple-400 outline-none transition-all text-sm sm:text-base`}
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded-lg ${t.button} text-sm`}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditValue(field.value);
                  setIsEditing(false);
                }}
                className={`px-4 py-2 rounded-lg ${t.buttonSecondary} text-sm`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`${t.textSecondary} text-sm sm:text-base whitespace-pre-wrap`}
          >
            {field.value || "No content"}
          </p>
        )}
      </div>
    </div>
  );
};

export const ObjectDetailPage = () => {
  const {
    theme,
    selectedObject,
    setCurrentPage,
    breadcrumbs,
    setBreadcrumbs,
    setSelectedObject,
  } = useAppStore();

  const [fields, setFields] = useState([]);
  const [files, setFiles] = useState([]);
  const [objects, setObjects] = useState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const t = themes[theme];

  useEffect(() => {
    if (selectedObject) {
      loadObjectData();
    }
  }, [selectedObject]);

  const loadObjectData = async () => {
    const allFields = await db.objectFields.toArray();
    const f = allFields.filter((field) => field.objectId === selectedObject.id);
    setFields(f);

    const allFiles = await db.files.toArray();
    const fl = allFiles.filter((file) => file.objectId === selectedObject.id);
    setFiles(fl);

    const o = await db.objects.toArray();
    setObjects(o);
  };

  const addField = async (type) => {
    const label = prompt("Field label:");
    if (!label || !label.trim()) return;

    let value = "";
    if (type === "link") {
      const linkedObjName = prompt("Link to object (enter name):");
      const linkedObj = objects.find((o) => o.name === linkedObjName);
      if (linkedObj) {
        value = linkedObj.id.toString();
      } else {
        alert("Object not found");
        return;
      }
    } else if (type === "text") {
      value = prompt("Field value:") || "";
    }

    await db.objectFields.add({
      objectId: selectedObject.id,
      type,
      label: label.trim(),
      value,
    });
    loadObjectData();
    setShowAddMenu(false);
  };

  const addFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      await db.objectFields.add({
        objectId: selectedObject.id,
        type: "file",
        label: file.name,
        value: e.target.result,
      });
      loadObjectData();
    };
    reader.readAsDataURL(file);
    setShowAddMenu(false);
  };

  const deleteField = async (id) => {
    if (confirm("Delete this field?")) {
      await db.objectFields.delete(id);
      loadObjectData();
    }
  };

  const updateField = async (field, value) => {
    await db.objectFields.update(field.id, { value });
    loadObjectData();
  };

  const navigateToLinkedObject = async (fieldValue) => {
    const linkedObj = objects.find((o) => o.id === parseInt(fieldValue));
    if (linkedObj) {
      setSelectedObject(linkedObj);
      setBreadcrumbs([...breadcrumbs, { name: linkedObj.name }]);
    }
  };

  const goBack = () => {
    setBreadcrumbs(breadcrumbs.slice(0, -1));
    setCurrentPage("group-detail");
  };

  if (!selectedObject) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
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
          <div className="flex-1">
            <div
              className={`text-xs sm:text-sm ${t.textSecondary} flex items-center gap-1 flex-wrap`}
            >
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span>{crumb.name}</span>
                  {idx < breadcrumbs.length - 1 && <ChevronRight size={12} />}
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">
              {selectedObject.name}
            </h1>
          </div>
        </div>

        {/* Add Feature Button */}
        <div className="mb-6 relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl ${t.button} shadow hover:shadow-lg transition-all flex items-center justify-center gap-2`}
          >
            <Plus size={20} />
            <span>Add Feature</span>
          </button>

          {showAddMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAddMenu(false)}
              />
              <div
                className={`absolute top-full left-0 mt-2 ${t.card} rounded-xl shadow-xl z-20 overflow-hidden min-w-48`}
              >
                <button
                  onClick={() => addField("text")}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FileText size={18} />
                  <span>Text Field</span>
                </button>
                <button
                  onClick={() => addField("link")}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Link2 size={18} />
                  <span>Link to Object</span>
                </button>
                <label className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer">
                  <Image size={18} />
                  <span>Upload File</span>
                  <input type="file" onChange={addFile} className="hidden" />
                </label>
              </div>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {fields.map((field) => (
            <FeatureCard
              key={field.id}
              field={field}
              objects={objects}
              onUpdate={updateField}
              onDelete={deleteField}
              onNavigate={navigateToLinkedObject}
              theme={theme}
            />
          ))}
        </div>

        {fields.length === 0 && (
          <div
            className={`${t.card} p-8 rounded-xl text-center ${t.textSecondary}`}
          >
            <p>No features yet. Add one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
