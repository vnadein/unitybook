"use client"

import { useContext, useState } from "react"
import { SystemContext, type FieldType } from "@/lib/system-context"
import { Plus, Trash2, Settings } from "lucide-react"

export function MetaEditor({ metaId, objectType }: { metaId: string; objectType: "catalog" | "document" }) {
  const { metadata, updateMetadata } = useContext(SystemContext)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  const object =
    objectType === "catalog"
      ? metadata.catalogs.find((o) => o.id === metaId)
      : metadata.documents.find((o) => o.id === metaId)

  const selectedField = object?.fields.find((f: any) => f.id === selectedFieldId)

  const updateObject = (key: string, value: any) => {
    if (!object) return

    const collection = objectType === "catalog" ? "catalogs" : "documents"
    const updatedList = (metadata as any)[collection].map((o: any) =>
      o.id === object.id ? { ...o, [key]: value } : o,
    )
    updateMetadata({ ...metadata, [collection]: updatedList })
  }

  const addField = () => {
    if (!object) return
    const newField = {
      id: `f_${Date.now()}`,
      name: "НовыйРеквизит",
      type: "string" as FieldType,
    }
    updateObject("fields", [...object.fields, newField])
  }

  const updateField = (fieldId: string, key: string, value: any) => {
    if (!object) return
    const updatedFields = object.fields.map((f: any) => (f.id === fieldId ? { ...f, [key]: value } : f))
    updateObject("fields", updatedFields)
  }

  const deleteField = (fieldId: string) => {
    if (!object) return
    updateObject(
      "fields",
      object.fields.filter((f: any) => f.id !== fieldId),
    )
    if (selectedFieldId === fieldId) setSelectedFieldId(null)
  }

  if (!object) {
    return <div>Объект не найден</div>
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden h-full flex flex-col">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
        <span className="text-lg">{object.name} (Объект)</span>
        <Settings className="w-5 h-5 text-gray-400" />
      </div>
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Basic Properties */}
        <div className="grid grid-cols-[150px_1fr] gap-6 items-center max-w-4xl">
          <label className="text-sm font-medium text-gray-600">Имя объекта:</label>
          <input
            value={object.name}
            onChange={(e) => updateObject("name", e.target.value)}
            className="border border-gray-300 p-2 text-sm rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
          />
        </div>

        {/* Fields Editor */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <span className="font-bold text-sm text-gray-700">Реквизиты</span>
            <button
              onClick={addField}
              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Добавить
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 border-b border-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 font-medium pl-4">Имя</th>
                  <th className="p-3 font-medium">Тип</th>
                  <th className="p-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {object.fields.map((field: any) => (
                  <tr
                    key={field.id}
                    className={`hover:bg-emerald-50 cursor-pointer transition-colors ${
                      selectedFieldId === field.id ? "bg-emerald-50" : ""
                    }`}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <td className="p-2 pl-4">
                      <input
                        value={field.name}
                        onChange={(e) => updateField(field.id, "name", e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded px-2 py-1 outline-none transition-all"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, "type", e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded px-2 py-1 outline-none transition-all"
                      >
                        <option value="string">Строка</option>
                        <option value="number">Число</option>
                        <option value="boolean">Булево</option>
                        <option value="date">Дата</option>
                        <option value="reference">Справочник Ссылка</option>
                      </select>
                    </td>
                    <td className="p-2 text-center pr-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteField(field.id)
                        }}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
