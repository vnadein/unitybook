"use client"

import { useContext, useState } from "react"
import { SystemContext, generateAbbreviation } from "@/lib/system-context"
import { OneCLayout } from "./one-c-layout"
import { Folder, FileText, Plus, Users, User, Settings, Trash2, AlertTriangle } from "lucide-react"
import { ObjectForm } from "./forms/object-form"
import { UserForm } from "./forms/user-form"
import { UserGroupForm } from "./forms/user-group-form"
import { UserListForm } from "./forms/user-list-form"
import { UserGroupListForm } from "./forms/user-group-list-form"
import { MetaEditor } from "./forms/meta-editor"

type View =
  | { type: "default" }
  | { type: "edit-meta"; id: string; objectType: "catalog" | "document" }
  | { type: "preview-form"; id: string; objectType: "catalog" | "document" }
  | { type: "user-list" }
  | { type: "user-form"; id?: string }
  | { type: "group-list" }
  | { type: "group-form"; id?: string }

export function Configurator({ onExit, toggleMode }: { onExit: () => void; toggleMode: () => void }) {
  const { metadata, updateMetadata, data } = useContext(SystemContext)
  const [view, setView] = useState<View>({ type: "default" })
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null) // Keep for object tree selection highlight
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState<{ id: string; name: string; type: "catalog" | "document" } | null>(null);
  const [recordCount, setRecordCount] = useState(0);

  const addObject = (type: "catalog" | "document") => {
    const newId = type === "catalog" ? `cat_new_${Date.now()}` : `doc_new_${Date.now()}`
    const name = type === "catalog" ? "НовыйСправочник" : "НовыйДокумент";
    const newObj = {
      id: newId,
      name: name,
      abbreviation: generateAbbreviation(name),
      type,
      fields: [],
    }

    updateMetadata({
      ...metadata,
      [type === "catalog" ? "catalogs" : "documents"]: [...metadata[type === "catalog" ? "catalogs" : "documents"], newObj],
    })
    setSelectedObjId(newId)
    setView({ type: "edit-meta", id: newId, objectType: type })
  }

  const requestDeleteObject = () => {
    if (view.type !== "edit-meta") return
    const currentObject =
      view.objectType === "catalog"
        ? metadata.catalogs.find((o) => o.id === view.id)
        : metadata.documents.find((o) => o.id === view.id)

    if (currentObject) {
      const count = data[currentObject.id] ? Object.keys(data[currentObject.id]).length : 0
      setObjectToDelete({ id: currentObject.id, name: currentObject.name, type: currentObject.type })
      setRecordCount(count)
      setShowDeleteConfirm(true)
    }
  }

  const confirmDelete = () => {
    if (!objectToDelete) return

    const collection = objectToDelete.type === "catalog" ? "catalogs" : "documents"
    const updatedList = (metadata as any)[collection].filter((o: any) => o.id !== objectToDelete.id)
    updateMetadata({ ...metadata, [collection]: updatedList })

    // Optionally, also delete all associated data if necessary, though SystemContext might handle this
    // delete data[objectToDelete.id];

    setShowDeleteConfirm(false)
    setObjectToDelete(null)
    setRecordCount(0)
    setView({ type: "default" })
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setObjectToDelete(null)
    setRecordCount(0)
  }

  const renderContent = () => {
    switch (view.type) {
      case "user-list":
        return (
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl h-full w-full overflow-hidden flex flex-col">
            <UserListForm
              onNewItem={() => setView({ type: "user-form" })}
              onEditItem={(id) => setView({ type: "user-form", id })}
            />
          </div>
        )
      case "user-form":
        return (
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl h-full w-full overflow-hidden flex flex-col">
            <UserForm userId={view.id} onClose={() => setView({ type: "user-list" })} />
          </div>
        )
      case "group-list":
        return (
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl h-full w-full overflow-hidden flex flex-col">
            <UserGroupListForm
              onNewItem={() => setView({ type: "group-form" })}
              onEditItem={(id) => setView({ type: "group-form", id })}
            />
          </div>
        )
      case "group-form":
        return (
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl h-full w-full overflow-hidden flex flex-col">
            <UserGroupForm groupId={view.id} onClose={() => setView({ type: "group-list" })} />
          </div>
        )
      case "edit-meta":
        return <MetaEditor metaId={view.id} objectType={view.objectType} />
      case "preview-form":
        return (
          <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ObjectForm metaId={view.id} onClose={() => setView(view)} isPreview={true} />
          </div>
        )
      case "default":
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-300" />
            </div>
            <p>Выберите объект в дереве слева для редактирования</p>
          </div>
        )
    }
  }

  const isMetaView = view.type === "edit-meta" || view.type === "preview-form"

  return (
    <OneCLayout title="Конфигуратор" onExit={onExit} user="Администратор" toggleMode={toggleMode}>
      <div className="flex w-full h-full">
        {/* Configuration Tree */}
                    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                      <div className="flex-1 overflow-y-auto p-3">
                        {/* Configuration Node */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-gray-700 font-medium p-2 rounded-md">
                            <Settings className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                            <span>Конфигурация</span>
                          </div>
                          <div className="pl-4 border-l-2 border-gray-100 ml-2.5 mt-1 space-y-1">
                            {/* General Settings */}
                            <div
                              onClick={() => {
                                setSelectedObjId("general-settings")
                                setView({ type: "default" }) // Placeholder, can be changed later for a specific settings view
                              }}
                              className={`flex items-center gap-2 cursor-pointer p-2 rounded-md text-xs transition-colors ${
                                selectedObjId === "general-settings" ? "bg-emerald-100 text-emerald-900 font-medium" : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${selectedObjId === "general-settings" ? "bg-emerald-500" : "bg-gray-300"}`}
                              />
                              <span>Общие настройки</span>
                            </div>
                          </div>
                        </div>
        
                        {/* Catalogs Node */}            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer hover:bg-emerald-50 p-2 rounded-md transition-colors group">
                <Folder className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                <span>Справочники</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    addObject("catalog")
                  }}
                  className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-emerald-200 text-emerald-700 rounded p-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="pl-4 border-l-2 border-gray-100 ml-2.5 mt-1 space-y-1">
                {metadata.catalogs.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedObjId(cat.id)
                      setView({ type: "edit-meta", id: cat.id, objectType: "catalog" })
                    }}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-md text-xs transition-colors ${
                      selectedObjId === cat.id ? "bg-emerald-100 text-emerald-900 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${selectedObjId === cat.id ? "bg-emerald-500" : "bg-gray-300"}`}
                    />
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Node */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer hover:bg-emerald-50 p-2 rounded-md transition-colors group">
                <FileText className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                <span>Документы</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    addObject("document")
                  }}
                  className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-emerald-200 text-emerald-700 rounded p-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="pl-4 border-l-2 border-gray-100 ml-2.5 mt-1 space-y-1">
                {metadata.documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedObjId(doc.id)
                      setView({ type: "edit-meta", id: doc.id, objectType: "document" })
                    }}
                    className={`flex items-center gap-2 cursor-pointer p-2 rounded-md text-xs transition-colors ${
                      selectedObjId === doc.id ? "bg-emerald-100 text-emerald-900 font-medium" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${selectedObjId === doc.id ? "bg-emerald-500" : "bg-gray-300"}`}
                    />
                    {doc.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Users and Groups Node */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-700 font-medium p-2 rounded-md">
                <Users className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                <span>Пользователи и группы</span>
              </div>
              <div className="pl-4 border-l-2 border-gray-100 ml-2.5 mt-1 space-y-1">
                {/* Users */}
                <div
                  onClick={() => {
                    setSelectedObjId("users") // use a static string for highlight
                    setView({ type: "user-list" })
                  }}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded-md text-xs transition-colors ${
                    selectedObjId === "users" ? "bg-emerald-100 text-emerald-900 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${selectedObjId === "users" ? "bg-emerald-500" : "bg-gray-300"}`}
                  />
                  <span>Пользователи</span>
                </div>
                {/* User Groups */}
                <div
                  onClick={() => {
                    setSelectedObjId("groups") // use a static string for highlight
                    setView({ type: "group-list" })
                  }}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded-md text-xs transition-colors ${
                    selectedObjId === "groups" ? "bg-emerald-100 text-emerald-900 font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${selectedObjId === "groups" ? "bg-emerald-500" : "bg-gray-300"}`}
                  />
                  <span>Группы</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#F8F9FA] flex flex-col overflow-hidden">
          {isMetaView && view.type === "edit-meta" && (
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-4 shadow-sm">
              <button
                onClick={() => setView({ type: "edit-meta", id: view.id, objectType: view.objectType })}
                className="text-xs font-medium px-4 py-2 rounded-lg transition-all bg-emerald-500 text-white shadow-md shadow-emerald-200 cursor-pointer"
              >
                Редактирование
              </button>
              <button
                onClick={() => setView({ type: "preview-form", id: view.id, objectType: view.objectType })}
                className="text-xs font-medium px-4 py-2 rounded-lg transition-all bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                Просмотр формы
              </button>
              <button
                onClick={requestDeleteObject}
                className="ml-auto flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Удалить
              </button>
            </div>
          )}
          {isMetaView && view.type === "preview-form" && (
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-4 shadow-sm">
              <button
                onClick={() => setView({ type: "edit-meta", id: view.id, objectType: view.objectType })}
                className="text-xs font-medium px-4 py-2 rounded-lg transition-all bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
              >
                Редактирование
              </button>
              <button
                onClick={() => setView({ type: "preview-form", id: view.id, objectType: view.objectType })}
                className="text-xs font-medium px-4 py-2 rounded-lg transition-all bg-emerald-500 text-white shadow-md shadow-emerald-200 cursor-pointer"
              >
                Просмотр формы
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
        </div>
      </div>
      {showDeleteConfirm && objectToDelete && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Удаление объекта</h3>
                <p className="text-xs text-gray-500">Подтвердите действие</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                Вы действительно хотите удалить объект "{objectToDelete.name}" ({objectToDelete.type === "catalog" ? "Справочник" : "Документ"})?
              </p>
              {recordCount > 0 && (
                <p className="text-sm text-red-600 mt-2">
                  В нем содержится {recordCount} запис(ь/и/ей). Все они будут также удалены.
                </p>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-lg shadow-red-200 transition-all cursor-pointer"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </OneCLayout>
  )
}
