"use client"

import { useContext, useState } from "react"
import { SystemContext } from "@/lib/system-context"
import { Plus, Search, MoreHorizontal, FileText, Check, Pencil, Trash2, AlertTriangle, Undo } from "lucide-react"

export function ListForm({
  metaId,
  parentValue,
  parentField,
  onEditItem,
  onNewItem,
  onSelect,
}: {
  metaId: string
  parentValue?: any
  parentField?: string
  onEditItem: (id: string) => void
  onNewItem: () => void
  onSelect?: (item: any) => void
}) {
  const { metadata, data, deleteData, saveData, currentUser } = useContext(SystemContext)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const meta = [...metadata.catalogs, ...metadata.documents].find((m) => m.id === metaId)
  const allItems = data[metaId] ? Object.values(data[metaId]) : []
  const selectedItem = allItems.find((i: any) => i.id === selectedId)

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

  const filteredByParent = parentField && parentValue
    ? allItems.filter((item: any) => item[parentField] === parentValue)
    : allItems

  const items = filteredByParent.filter((item: any) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    if (item._code?.toLowerCase().includes(searchLower)) return true
    if (item._name?.toLowerCase().includes(searchLower)) return true
    return meta?.fields.some((f) =>
      String(item[f.name] || "")
        .toLowerCase()
        .includes(searchLower),
    )
  })

  if (!meta) return <div>Ошибка метаданных</div>

  const handleRowDoubleClick = (item: any) => {
    if (onSelect) {
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

  return (
    <div className="flex flex-col h-full">
      {/* Command Bar */}
      <div className="bg-gray-100 border-b border-gray-300 p-1 flex gap-1 items-center rounded-t-sm">
        {onSelect && (
          <button
            onClick={() => selectedId && onSelect(items.find((i: any) => i.id === selectedId))}
            disabled={!selectedId || selectedItem?._markedForDeletion}
            className="flex items-center gap-1 px-2 py-1 bg-yellow-100 border border-yellow-300 rounded hover:bg-yellow-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="w-3 h-3 text-black" />
            <span>Выбрать</span>
          </button>
        )}
        <button
          onClick={onNewItem}
          disabled={!hasPermission("write")}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-yellow-100 text-xs disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-3 h-3 text-green-600" />
          <span>Создать</span>
        </button>

        <div className="w-[1px] bg-gray-300 mx-1 h-4" />

        <button
          onClick={handleEdit}
          disabled={!selectedId || !hasPermission("write")}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Pencil className="w-3 h-3 text-blue-600" />
          <span>Изменить</span>
        </button>

        {selectedItem?._markedForDeletion ? (
          <button
            onClick={handleRestore}
            disabled={!selectedId || !hasPermission("delete")}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Undo className="w-3 h-3 text-blue-600" />
            <span>Восстановить</span>
          </button>
        ) : (
          <button
            onClick={handleDelete}
            disabled={!selectedId || !hasPermission("delete")}
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
              {meta.fields.map((f) => (
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
                <td className="border border-gray-200 p-1 text-center">
                  {item._markedForDeletion ? (
                    <Trash2 className="w-3 h-3 text-red-400 inline" />
                  ) : (
                    <FileText className="w-3 h-3 text-emerald-400 inline" />
                  )}
                </td>
                {meta.type === "catalog" && (
                  <>
                    <td className={`border border-gray-200 p-1 ${item._markedForDeletion ? "line-through" : ""}`}>
                      {item._code}
                    </td>
                    <td className={`border border-gray-200 p-1 ${item._markedForDeletion ? "line-through" : ""}`}>
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
                {meta.fields.map((f) => (
                  <td
                    key={f.id}
                    className={`border border-gray-200 p-1 ${item._markedForDeletion ? "line-through" : ""}`}
                  >
                    {typeof item[f.name] === "boolean" ? (item[f.name] ? "Да" : "Нет") : item[f.name]}
                  </td>
                ))}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-400">
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
