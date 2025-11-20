"use client"

import { useContext, useState } from "react"
import { SystemContext, type FieldType } from "@/lib/system-context"
import { Plus, Trash2, Settings } from "lucide-react"

export function MetaEditor({ metaId, objectType }: { metaId: string; objectType: "catalog" | "document" }) {
  const { metadata, updateMetadata } = useContext(SystemContext)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

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

  const requestDeleteField = (fieldId: string) => {
    setFieldToDelete(fieldId)
  }

  const confirmDeleteField = () => {
    if (!fieldToDelete || !object) return
    updateObject(
      "fields",
      object.fields.filter((f: any) => f.id !== fieldToDelete),
    )
    if (selectedFieldId === fieldToDelete) setSelectedFieldId(null)
    setFieldToDelete(null)
  }

  const cancelDelete = () => {
    setFieldToDelete(null)
  }

  if (!object) {
    return <div>Объект не найден</div>
  }

  return (
    <>
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <h3 className="font-bold text-gray-900">Настройки объекта</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                <label className="text-sm font-medium text-gray-600">Автоматическое нумерование:</label>
                <input
                  type="checkbox"
                  checked={object.autoNumbering !== false}
                  onChange={(e) => updateObject("autoNumbering", e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                {objectType === "document" && (
                  <>
                    <label className="text-sm font-medium text-gray-600">Номер только для чтения:</label>
                    <input
                      type="checkbox"
                      checked={object.numberReadOnly ?? true}
                      onChange={(e) => updateObject("numberReadOnly", e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-600">Дата только для чтения:</label>
                    <input
                      type="checkbox"
                      checked={object.dateReadOnly ?? true}
                      onChange={(e) => updateObject("dateReadOnly", e.target.checked)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                  </>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden h-full flex flex-col">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <span className="text-lg text-[#00695C] font-semibold">{object.name} (Объект)</span>
          <button onClick={() => setIsSettingsModalOpen(true)} className="text-gray-400 hover:text-blue-500 p-1.5 rounded-md">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Basic Properties */}
            <div className="grid grid-cols-[150px_1fr] gap-6 items-center max-w-4xl">
              <label className="text-xs text-gray-600 text-right">Имя объекта:</label>
              <input
                value={object.name}
                onChange={(e) => updateObject("name", e.target.value)}
                className="border border-gray-300 p-1 text-sm rounded focus:border-emerald-500 outline-none"
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
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                {fieldToDelete && (
                  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">Удаление реквизита</h3>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Вы действительно хотите удалить этот реквизит?
                        </p>
                      </div>
                      <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                          onClick={cancelDelete}
                          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Отмена
                        </button>
                        <button
                          onClick={confirmDeleteField}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-lg shadow-red-200 transition-all"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-gray-500 border-b border-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 font-medium pl-4">Имя</th>
                      <th className="p-3 font-medium">Тип</th>
                      <th className="p-3 font-medium w-20 text-center">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {object.fields.map((field: any) => (
                      <tr
                        key={field.id}
                        className={`transition-colors ${
                          selectedFieldId === field.id ? "bg-emerald-50" : "hover:bg-emerald-50/50"
                        }`}
                      >
                        <td className="p-2 pl-4">
                          <input
                            value={field.name}
                            onChange={(e) => updateField(field.id, "name", e.target.value)}
                            className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded p-1 outline-none text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={field.type}
                            onChange={(e) => updateField(field.id, "type", e.target.value)}
                            className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-emerald-500 focus:bg-white rounded p-1 outline-none text-xs"
                          >
                            <option value="string">Строка</option>
                            <option value="number">Число</option>
                            <option value="boolean">Булево</option>
                            <option value="date">Дата</option>
                            <option value="reference">Справочник Ссылка</option>
                          </select>
                        </td>
                        <td className="p-2 text-center pr-4">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => setSelectedFieldId(field.id)}
                              className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                requestDeleteField(field.id)
                              }}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar for Field Properties */}
          {selectedField && (
            <aside className="w-96 bg-gray-50/50 border-l border-gray-200 overflow-y-auto">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <span className="font-bold text-sm text-gray-700">
                  Свойства реквизита: {selectedField.name}
                </span>
              </div>
              <div className="p-6 space-y-4">
                {/* Common Properties */}
                <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                  <label className="text-xs text-gray-600 text-right">Обязательный:</label>
                  <input
                    type="checkbox"
                    checked={selectedField.required || false}
                    onChange={(e) => updateField(selectedField.id, "required", e.target.checked)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>

                {selectedField.type === "string" && (
                  <>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Длина:</label>
                      <input
                        type="number"
                        value={selectedField.length || ""}
                        onChange={(e) =>
                          updateField(selectedField.id, "length", e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none w-24"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">По умолчанию:</label>
                      <input
                        type="text"
                        value={selectedField.defaultValue || ""}
                        onChange={(e) => updateField(selectedField.id, "defaultValue", e.target.value)}
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Описание:</label>
                      <input
                        type="text"
                        value={selectedField.description || ""}
                        onChange={(e) => updateField(selectedField.id, "description", e.target.value)}
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Многострочный:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.multiline || false}
                        onChange={(e) => updateField(selectedField.id, "multiline", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Только чтение:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.readOnly || false}
                        onChange={(e) => updateField(selectedField.id, "readOnly", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Уникальное:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.unique || false}
                        onChange={(e) => updateField(selectedField.id, "unique", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Пароль:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.password || false}
                        onChange={(e) => updateField(selectedField.id, "password", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Файл:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.isFile || false}
                        onChange={(e) => updateField(selectedField.id, "isFile", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Скрыть:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.hidden || false}
                        onChange={(e) => updateField(selectedField.id, "hidden", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}

                {selectedField.type === "number" && (
                  <>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Точность:</label>
                      <input
                        type="number"
                        value={selectedField.precision || ""}
                        onChange={(e) =>
                          updateField(
                            selectedField.id,
                            "precision",
                            e.target.value ? parseInt(e.target.value) : undefined,
                          )
                        }
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none w-24"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Мин. значение:</label>
                      <input
                        type="number"
                        value={selectedField.min || ""}
                        onChange={(e) =>
                          updateField(selectedField.id, "min", e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        className="border border-gray-200 p-1 text-xs rounded focus:border-emerald-500 outline-none w-24"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Макс. значение:</label>
                      <input
                        type="number"
                        value={selectedField.max || ""}
                        onChange={(e) =>
                          updateField(selectedField.id, "max", e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none w-24"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">По умолчанию:</label>
                      <input
                        type="number"
                        value={selectedField.defaultValue || ""}
                        onChange={(e) =>
                          updateField(
                            selectedField.id,
                            "defaultValue",
                            e.target.value ? parseInt(e.target.value) : undefined,
                          )
                        }
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none w-24"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Только чтение:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.readOnly || false}
                        onChange={(e) => updateField(selectedField.id, "readOnly", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Уникальное:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.unique || false}
                        onChange={(e) => updateField(selectedField.id, "unique", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Скрыть:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.hidden || false}
                        onChange={(e) => updateField(selectedField.id, "hidden", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}

                {selectedField.type === "date" && (
                  <>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Вариант:</label>
                      <select
                        value={selectedField.dateVariant || "date"}
                        onChange={(e) => updateField(selectedField.id, "dateVariant", e.target.value)}
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none"
                      >
                        <option value="date">Дата</option>
                        <option value="time">Время</option>
                        <option value="datetime-local">Дата и время</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">По умолчанию:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.defaultValue === "now"}
                        onChange={(e) =>
                          updateField(selectedField.id, "defaultValue", e.target.checked ? "now" : undefined)
                        }
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <span className="text-xs text-gray-500 -ml-2">Текущая дата</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Только чтение:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.readOnly || false}
                        onChange={(e) => updateField(selectedField.id, "readOnly", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Уникальное:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.unique || false}
                        onChange={(e) => updateField(selectedField.id, "unique", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Скрыть:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.hidden || false}
                        onChange={(e) => updateField(selectedField.id, "hidden", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}

                {selectedField.type === "boolean" && (
                  <>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">По умолчанию:</label>
                      <select
                        value={selectedField.defaultValue === undefined ? "" : String(selectedField.defaultValue)}
                        onChange={(e) =>
                          updateField(
                            selectedField.id,
                            "defaultValue",
                            e.target.value === "" ? undefined : e.target.value === "true",
                          )
                        }
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none"
                      >
                        <option value="">Не выбрано</option>
                        <option value="true">Включено</option>
                        <option value="false">Выключено</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Только чтение:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.readOnly || false}
                        onChange={(e) => updateField(selectedField.id, "readOnly", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Скрыть:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.hidden || false}
                        onChange={(e) => updateField(selectedField.id, "hidden", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}

                {selectedField.type === "reference" && (
                  <>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Ссылка на:</label>
                      <select
                        value={selectedField.referenceTo || ""}
                        onChange={(e) => updateField(selectedField.id, "referenceTo", e.target.value)}
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none"
                      >
                        <option value="">Не выбрано</option>
                        {metadata.catalogs.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Родитель:</label>
                      <select
                        value={selectedField.parentField || ""}
                        onChange={(e) => updateField(selectedField.id, "parentField", e.target.value)}
                        className="border border-gray-300 p-1 text-xs rounded focus:border-emerald-500 outline-none"
                      >
                        <option value="">Не выбрано</option>
                        {object.fields
                          .filter((f: any) => f.id !== selectedField.id) // Temporarily removed type check for debugging
                          .map((f: any) => (
                            <option key={f.id} value={f.name}>
                              {f.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Только чтение:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.readOnly || false}
                        onChange={(e) => updateField(selectedField.id, "readOnly", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                      <label className="text-xs text-gray-600 text-right">Скрыть:</label>
                      <input
                        type="checkbox"
                        checked={selectedField.hidden || false}
                        onChange={(e) => updateField(selectedField.id, "hidden", e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                    </div>
                  </>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  )}
