"use client"

import { useContext, useState } from "react"
import { SystemContext } from "@/lib/system-context"
import { Trash2, Undo, AlertTriangle } from "lucide-react"

export function RecycleBin() {
  const { data, deleteData, saveData, currentUser } = useContext(SystemContext)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const getMarkedForDeletion = () => {
    const marked: any[] = []
    for (const type in data) {
      for (const id in data[type]) {
        if (data[type][id]._markedForDeletion) {
          marked.push({ ...data[type][id], _type: type })
        }
      }
    }
    return marked
  }

  const countUsage = (item: any) => {
    let count = 0
    for (const type in data) {
      for (const id in data[type]) {
        const currentItem = data[type][id]
        // Don't count self-references or items that are also marked for deletion
        if (id === item.id || currentItem._markedForDeletion) continue

        for (const field in currentItem) {
          if (currentItem[field] === item._name) {
            count++
          }
        }
      }
    }
    return count
  }

  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleRestore = () => {
    selectedItems.forEach((id) => {
      const item = getMarkedForDeletion().find((i) => i.id === id)
      if (item) {
        const { _type, ...rest } = item
        saveData(_type, id, { ...rest, _markedForDeletion: false })
      }
    })
    setSelectedItems([])
  }

  const handleDelete = () => {
    selectedItems.forEach((id) => {
      const item = getMarkedForDeletion().find((i) => i.id === id)
      if (item) {
        deleteData(item._type, id)
      }
    })
    setSelectedItems([])
  }

  const markedItems = getMarkedForDeletion()

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 border-b border-gray-300 p-1 flex gap-1 items-center">
        <button
          onClick={handleRestore}
          disabled={selectedItems.length === 0}
          className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-yellow-100 text-xs disabled:opacity-50 cursor-pointer"
        >
          <Undo className="w-3 h-3 text-blue-600" />
          <span>Восстановить</span>
        </button>
        {currentUser === "Администратор" && (
          <button
            onClick={handleDelete}
            disabled={selectedItems.length === 0}
            className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-300 rounded hover:bg-red-100 text-xs disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3 h-3 text-red-600" />
            <span>Удалить навсегда</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="border border-gray-300 p-1 w-8"></th>
              <th className="border border-gray-300 p-1 text-left font-medium text-gray-600">Наименование</th>
              <th className="border border-gray-300 p-1 text-left font-medium text-gray-600">Тип</th>
              <th className="border border-gray-300 p-1 text-left font-medium text-gray-600">Используется в</th>
            </tr>
          </thead>
          <tbody>
            {markedItems.map((item: any) => (
              <tr
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`cursor-pointer transition-colors ${
                  selectedItems.includes(item.id) ? "bg-emerald-100" : "hover:bg-emerald-50"
                }`}
              >
                <td className="border border-gray-200 p-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleItem(item.id)}
                  />
                </td>
                <td className="border border-gray-200 p-1">{item._name || item.Номер}</td>
                <td className="border border-gray-200 p-1">{item._type}</td>
                <td className="border border-gray-200 p-1">{countUsage(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
