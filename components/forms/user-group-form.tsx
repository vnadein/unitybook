"use client"

import { useContext, useState, useEffect } from "react"
import { SystemContext } from "@/lib/system-context"
import { Save, X } from "lucide-react"

export function UserGroupForm({ groupId, onClose }: { groupId?: string; onClose: () => void }) {
  const { metadata, updateMetadata } = useContext(SystemContext)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (groupId) {
      const group = metadata.userGroups.find((g) => g.id === groupId)
      if (group) {
        setFormData(group)
      }
    } else {
      setFormData({ id: `group_new_${Date.now()}`, name: "Новая группа" })
    }
  }, [groupId, metadata.userGroups])

  const handleSave = () => {
    const newGroups = [...metadata.userGroups]
    const groupIndex = newGroups.findIndex((g) => g.id === formData.id)
    if (groupIndex > -1) {
      newGroups[groupIndex] = formData
    } else {
      newGroups.push(formData)
    }
    updateMetadata({ ...metadata, userGroups: newGroups })
    onClose()
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const handlePermissionChange = (objectId: string, permission: "read" | "write" | "delete", value: boolean) => {
    if (!formData.id) return
    const newPermissions = [...metadata.permissions]
    const permissionIndex = newPermissions.findIndex((p) => p.groupId === formData.id && p.objectId === objectId)

    if (permissionIndex > -1) {
      newPermissions[permissionIndex] = { ...newPermissions[permissionIndex], [permission]: value }
    } else {
      newPermissions.push({ groupId: formData.id, objectId, read: false, write: false, delete: false, [permission]: value })
    }

    updateMetadata({ ...metadata, permissions: newPermissions })
  }

  const getPermission = (objectId: string, permission: "read" | "write" | "delete") => {
    if (!formData.id) return false
    return (
      metadata.permissions.find((p) => p.groupId === formData.id && p.objectId === objectId)?.[permission] || false
    )
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
            {formData.name || "Новая группа"}
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-4 items-center">
              <label className="text-xs text-gray-600 text-right">Наименование:</label>
              <input
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border border-gray-300 p-1 text-sm rounded focus:border-[#00695C] outline-none"
              />
            </div>

            {/* Permissions Table */}
            {formData.id && (
              <div>
                <h3 className="text-md text-[#00695C] mb-4 border-b border-gray-200 pb-2">Права доступа</h3>
                <div className="overflow-auto border border-gray-200 rounded-md max-h-[400px]">
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="border-b border-gray-300 p-2 text-left font-medium text-gray-600">Объект</th>
                        <th className="border-b border-gray-300 p-2 text-center font-medium text-gray-600 w-20">Чтение</th>
                        <th className="border-b border-gray-300 p-2 text-center font-medium text-gray-600 w-20">Запись</th>
                        <th className="border-b border-gray-300 p-2 text-center font-medium text-gray-600 w-20">Удаление</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...metadata.catalogs, ...metadata.documents].map((obj) => (
                        <tr key={obj.id} className="hover:bg-emerald-50/50">
                          <td className="border-b border-gray-200 p-2">{obj.name}</td>
                          <td className="border-b border-gray-200 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={getPermission(obj.id, "read")}
                              onChange={(e) => handlePermissionChange(obj.id, "read", e.target.checked)}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="border-b border-gray-200 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={getPermission(obj.id, "write")}
                              onChange={(e) => handlePermissionChange(obj.id, "write", e.target.checked)}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="border-b border-gray-200 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={getPermission(obj.id, "delete")}
                              onChange={(e) => handlePermissionChange(obj.id, "delete", e.target.checked)}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
