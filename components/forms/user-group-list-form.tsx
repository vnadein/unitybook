"use client"

import { useContext, useState } from "react"
import { SystemContext } from "@/lib/system-context"
import { Plus, Search, MoreHorizontal, Users, Pencil, Trash2 } from "lucide-react"

export function UserGroupListForm({
  onEditItem,
  onNewItem,
}: {
  onEditItem: (id: string) => void
  onNewItem: () => void
}) {
  const { metadata, updateMetadata } = useContext(SystemContext)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const userGroups = metadata.userGroups.filter((group) => {
    if (!searchQuery) return true
    return group.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleDelete = () => {
    if (selectedId) {
      const newGroups = metadata.userGroups.filter((group) => group.id !== selectedId)
      updateMetadata({ ...metadata, userGroups: newGroups })
      setSelectedId(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 border-b border-gray-300 p-1 flex gap-1 items-center">
        <button
          onClick={onNewItem}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-yellow-100 text-xs"
        >
          <Plus className="w-3 h-3 text-green-600" />
          <span>Создать</span>
        </button>
        <div className="w-[1px] bg-gray-300 mx-1 h-4" />
        <button
          onClick={() => selectedId && onEditItem(selectedId)}
          disabled={!selectedId}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50"
        >
          <Pencil className="w-3 h-3 text-blue-600" />
          <span>Изменить</span>
        </button>
        <button
          onClick={handleDelete}
          disabled={!selectedId}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50"
        >
          <Trash2 className="w-3 h-3 text-red-600" />
          <span>Удалить</span>
        </button>
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
        <button className="px-2 py-1 hover:bg-gray-200 rounded">
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="border border-gray-300 p-1 w-8"></th>
              <th className="border border-gray-300 p-1 text-left font-medium text-gray-600">Наименование</th>
            </tr>
          </thead>
          <tbody>
            {userGroups.map((group) => (
              <tr
                key={group.id}
                onClick={() => setSelectedId(group.id)}
                onDoubleClick={() => onEditItem(group.id)}
                className={`cursor-pointer transition-colors ${
                  selectedId === group.id ? "bg-emerald-100 text-emerald-900" : "hover:bg-emerald-50 even:bg-gray-50/50"
                }`}
              >
                <td className="border border-gray-200 p-1 text-center">
                  <Users className="w-3 h-3 text-emerald-400 inline" />
                </td>
                <td className="border border-gray-200 p-1">{group.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
