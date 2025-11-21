"use client"

import { useContext, useState } from "react"
import { SystemContext } from "@/lib/system-context"
import { Plus, Search, MoreHorizontal, FileText, Check, Pencil, Trash2, AlertTriangle, Undo, Folder, FolderUp, ArrowUp } from "lucide-react"

export function ListForm({
  metaId,
  parentValue,
  parentField,
  currentFolder,
  setCurrentFolder,
  onEditItem,
  onNewItem,
  onSelect,
}: {
  metaId: string
  parentValue?: any
  parentField?: string
  currentFolder?: string | null
  setCurrentFolder: (folderId: string | null) => void
  onEditItem: (id: string) => void
  onNewItem: (parent: string | null) => void
  onSelect?: (item: any) => void
}) {
  const { metadata, data, deleteData, saveData, currentUser } = useContext(SystemContext)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState("")

  const meta = [...metadata.catalogs, ...metadata.documents].find((m) => m.id === metaId)
  
  if (!meta) return <div>Ошибка метаданных</div>
  
  const allItems = data[metaId] ? Object.values(data[metaId]) : []
  const selectedItem = allItems.find((i: any) => i.id === selectedId)

  const totalColumnCount = 1 + // Icon column
    (meta.type === "catalog" ? 2 : meta.type === "document" ? 2 : 0) + // Code/Name or Number/Date
    meta.fields.filter(f => f.showInJournal !== false).length; // Dynamic fields

  const hasPermission = (permission: "read" | "write" | "delete") => {
    const user = metadata.users.find((u) => u.name === currentUser)
    if (!user) return false
    if (user.groups.includes("admin")) return true

    for (const groupId of user.groups) {
      const p = metadata.permissions.find(
        (p) => p.groupId === groupId && p.objectId === metaId
      )
      if (p && p[permission]) return true
    }
    return false
  }

  const itemsInCurrentFolder = allItems.filter((item: any) => {
    if (currentFolder) {
      return item.parent === currentFolder
    }
    return !item.parent // Root items
  })

  const filteredByParent = parentField && parentValue
    ? itemsInCurrentFolder.filter((item: any) => item[parentField] === parentValue)
    : itemsInCurrentFolder

  let items = filteredByParent.filter((item: any) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    if (item._code?.toLowerCase().includes(searchLower)) return true
    if (item._name?.toLowerCase().includes(searchLower)) return true
    return meta.fields.some((f) =>
      String(item[f.name] || "")
        .toLowerCase()
        .includes(searchLower),
    )
  })

  // Add "Up one level" item if in a folder
  if (currentFolder) {
    items = [{ id: "_up_level", _name: "...", _isUpLevel: true }, ...items];
  }

  const handleRowDoubleClick = (item: any) => {
    if (item._isUpLevel) {
      const currentFolderObject = allItems.find((i: any) => i.id === currentFolder);
      setCurrentFolder(currentFolderObject?.parent || null);
    } else if (item._isFolder) {
      setCurrentFolder(item.id)
    } else if (onSelect) {
      if (item._markedForDeletion) return
      onSelect(item)
    } else {
      if (hasPermission("write")) {
        onEditItem(item.id)
      }
    }
  }

  const handleDelete = () => {
    if (selectedId) {
      setShowDeleteConfirm(true)
    }
  }

  const handleRestore = () => {
    if (selectedItem && hasPermission("delete")) {
      saveData(metaId, selectedId!, { ...selectedItem, _markedForDeletion: false })
    }
  }

  const confirmDelete = () => {
    if (!selectedId) return

    const item = allItems.find((i: any) => i.id === selectedId)
    if (item && hasPermission("delete")) {
      saveData(metaId, selectedId, { ...item, _markedForDeletion: true })
    }

    setShowDeleteConfirm(false)
    setSelectedId(null)
  }

  const handleEdit = () => {
    if (selectedId && hasPermission("write")) {
      onEditItem(selectedId)
    }
  }
  
  const handleCreateFolder = () => {
    if (!folderName.trim() || !hasPermission("write")) return;
    
    const newFolder = {
      id: `folder_${Date.now()}`,
      _name: folderName.trim(),
      _isFolder: true,
      parent: currentFolder,
    };
    
    saveData(metaId, newFolder.id, newFolder);
    
    setShowFolderDialog(false);
    setFolderName("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Command Bar */}
      <div className="bg-gray-100 border-b border-gray-300 p-1 flex gap-1 items-center rounded-t-sm">
        {onSelect && (
          <button
            onClick={() => selectedId && onSelect(items.find((i: any) => i.id === selectedId))}
            disabled={!selectedId || selectedItem?._markedForDeletion || selectedItem?._isFolder || selectedItem?._isUpLevel}
            className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded hover:bg-yellow-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="w-3 h-3 text-black" />
            <span>Выбрать</span>
          </button>
        )}
        <button
          onClick={() => onNewItem(currentFolder)}
          disabled={!hasPermission("write")}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-yellow-100 text-xs disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-3 h-3 text-green-600" />
          <span>Создать</span>
        </button>

        {meta.type === "catalog" && (
          <button
            onClick={() => setShowFolderDialog(true)}
            disabled={!hasPermission("write") || !!currentFolder}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-yellow-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Folder className="w-3 h-3 text-blue-600" />
            <span>Папка</span>
          </button>
        )}

        {showFolderDialog && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Folder className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Создать папку</h3>
                  <p className="text-xs text-gray-500">Введите имя для новой папки</p>
                </div>
              </div>
              <div className="p-6">
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Имя папки"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowFolderDialog(false);
                    setFolderName("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg shadow-blue-200 transition-all cursor-pointer"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-[1px] bg-gray-300 mx-1 h-4" />

        <button
          onClick={handleEdit}
          disabled={!selectedId || !hasPermission("write") || selectedItem?._isFolder || selectedItem?._isUpLevel}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Pencil className="w-3 h-3 text-blue-600" />
          <span>Изменить</span>
        </button>

        {selectedItem?._markedForDeletion ? (
          <button
            onClick={handleRestore}
            disabled={!selectedId || !hasPermission("delete") || selectedItem?._isUpLevel}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Undo className="w-3 h-3 text-blue-600" />
            <span>Восстановить</span>
          </button>
        ) : (
          <button
            onClick={handleDelete}
            disabled={!selectedId || !hasPermission("delete") || selectedItem?._isUpLevel}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 className="w-3 h-3 text-red-600" />
            <span>Удалить</span>
          </button>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Пометка на удаление</h3>
                  <p className="text-xs text-gray-500">Подтвердите действие</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Вы действительно хотите пометить этот элемент на удаление?
                </p>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-lg shadow-red-200 transition-all cursor-pointer"
                >
                  Пометить на удаление
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-[1px] bg-gray-300 mx-1 h-4" />

        <div className="flex items-center bg-white border border-gray-300 rounded px-2 py-0.5 w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск..."
            className="text-xs outline-none w-full"
          />
          <Search className="w-3 h-3 text-gray-400" />
        </div>

        <div className="flex-1" />
        <button className="px-2 py-1 hover:bg-gray-200 rounded cursor-pointer">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="border border-gray-300 p-1 w-8"></th>
              {meta.type === "catalog" && (
                <>
                  <th className="border border-gray-300 p-1 text-left font-medium text-gray-600">Код</th>
                  <th className="border border-gray-300 p-1 text-left font-medium text-gray-600">Наименование</th>
                </>
              )}
              {meta.type === "document" && (
                <>
                  <th className="border border-gray-300 p-1 text-left font-medium text-gray-600">Номер</th>
                  <th className="border border-gray-300 p-1 text-left font-medium text-gray-600">Дата</th>
                </>
              )}
              {meta.fields
                .filter(f => f.showInJournal !== false) // Only show if true or undefined
                .map((f) => (
                  <th key={f.id} className="border border-gray-300 p-1 text-left font-medium text-gray-600">
                    {f.name}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                onDoubleClick={() => handleRowDoubleClick(item)}
                className={`cursor-pointer transition-colors ${
                  selectedId === item.id
                    ? "bg-emerald-100 text-emerald-900"
                    : item._markedForDeletion
                      ? "bg-gray-50 text-gray-400" // Style for marked items
                      : "hover:bg-emerald-50 even:bg-gray-50/50"
                }`}
              >
                {item._isUpLevel ? (
                  <td colSpan={totalColumnCount} className="border border-gray-200 p-1 font-bold">
                    <ArrowUp className="w-3 h-3 text-gray-500 inline mr-2" />
                    {item._name}
                  </td>
                ) : (
                  <>
                    <td className="border border-gray-200 p-1 text-center">
                      {item._isFolder ? (
                        <Folder className="w-3 h-3 text-blue-400 inline" />
                      ) : item._markedForDeletion ? (
                        <Trash2 className="w-3 h-3 text-red-400 inline" />
                      ) : (
                        <FileText className="w-3 h-3 text-emerald-400 inline" />
                      )}
                    </td>
                    {meta.type === "catalog" && (
                      <>
                        <td className={`border border-gray-200 p-1 ${item._markedForDeletion ? "line-through" : ""}`}>
                          {item._isFolder ? '' : item._code}
                        </td>
                        <td className={`border border-gray-200 p-1 ${item._markedForDeletion ? "line-through" : ""} ${item._isFolder ? 'font-bold' : ''}`}>
                          {item._name}
                        </td>
                      </>
                    )}
                    {meta.type === "document" && (
                      <>
                        <td className={`border border-gray-200 p-1 ${item._markedForDeletion ? "line-through" : ""}`}>
                          {item.Номер}
                        </td>
                        <td className={`border border-gray-200 p-1 ${item._markedForDeletion ? "line-through" : ""}`}>
                          {item.Дата}
                        </td>
                      </>
                    )}
                    {meta.fields
                      .filter(f => f.showInJournal !== false) // Only show if true or undefined
                      .map((f) => (
                        <td
                          key={f.id}
                          className={`border border-gray-200 p-1 ${item._markedForDeletion ? "line-through" : ""}`}
                        >
                          {item._isFolder ? '' : (typeof item[f.name] === "boolean" ? (item[f.name] ? "Да" : "Нет") : item[f.name])}
                        </td>
                      ))}
                  </>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={totalColumnCount} className="p-4 text-center text-gray-400">
                  {searchQuery ? "Ничего не найдено" : "Нет данных"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}