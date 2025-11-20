"use client"

import { useContext, useState, useEffect } from "react"
import { SystemContext } from "@/lib/system-context"
import { Save, X } from "lucide-react"

export function UserForm({ userId, onClose }: { userId?: string; onClose: () => void }) {
  const { metadata, updateMetadata } = useContext(SystemContext)
  const [formData, setFormData] = useState<any>({ groups: [] })

  useEffect(() => {
    if (userId) {
      const user = metadata.users.find((u) => u.id === userId)
      if (user) {
        setFormData(user)
      }
    } else {
      setFormData({ id: `user_new_${Date.now()}`, name: "Новый пользователь", groups: [] })
    }
  }, [userId, metadata.users])

  const handleSave = () => {
    const newUsers = [...metadata.users]
    const userIndex = newUsers.findIndex((u) => u.id === formData.id)
    if (userIndex > -1) {
      newUsers[userIndex] = formData
    } else {
      newUsers.push(formData)
    }
    updateMetadata({ ...metadata, users: newUsers })
    onClose()
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleGroupToggle = (groupId: string) => {
    const newGroups = formData.groups.includes(groupId)
      ? formData.groups.filter((g: string) => g !== groupId)
      : [...formData.groups, groupId]
    handleChange("groups", newGroups)
  }

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      <div className="bg-[#E0F2F1] border-b border-[#80CBC4] p-1 flex justify-between items-center">
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 border rounded text-xs font-medium bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white"
          >
            <Save className="w-3 h-3" />
            <span>Записать и закрыть</span>
          </button>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-red-100 hover:text-red-600 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-2 overflow-auto">
        <div className="w-full h-full bg-white border border-gray-300 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg text-[#00695C] mb-6 border-b border-gray-200 pb-2">
            {formData.name || "Новый пользователь"}
          </h2>
          <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-4 items-center">
            <label className="text-xs text-gray-600 text-right">Имя:</label>
            <input
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-gray-300 p-1 text-sm rounded focus:border-[#00695C] outline-none"
            />
            <label className="text-xs text-gray-600 text-right">Пароль:</label>
            <input
              type="password"
              value={formData.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full border border-gray-300 p-1 text-sm rounded focus:border-[#00695C] outline-none"
            />
            <label className="text-xs text-gray-600 text-right self-start pt-2">Группы:</label>
            <div className="overflow-auto border border-gray-200 rounded-md max-h-[200px]">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="border-b border-gray-300 p-2 text-left font-medium text-gray-600">Группа</th>
                    <th className="border-b border-gray-300 p-2 text-center font-medium text-gray-600 w-20">Включен</th>
                  </tr>
                </thead>
                <tbody>
                  {metadata.userGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-emerald-50/50">
                      <td className="border-b border-gray-200 p-2">{group.name}</td>
                      <td className="border-b border-gray-200 p-2 text-center">
                        <input
                          type="checkbox"
                          checked={formData.groups.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
