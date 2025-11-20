"use client"

import { useContext, useState, useEffect } from "react"
import { SystemContext } from "@/lib/system-context"
import { Save, X, ChevronDown, AppWindow } from "lucide-react"
import { ListForm } from "./list-form"

export function ObjectForm({
  metaId,
  objectId,
  onClose,
  isPreview = false,
}: { metaId: string; objectId?: string; onClose: () => void; isPreview?: boolean }) {
  const { metadata, data, saveData } = useContext(SystemContext)
  const meta = [...metadata.catalogs, ...metadata.documents].find((m) => m.id === metaId)

  const [formData, setFormData] = useState<any>({})
  const [selectionModal, setSelectionModal] = useState<{ open: boolean; fieldName: string; metaId: string } | null>(
    null,
  )

  useEffect(() => {
    if (objectId && data[metaId]?.[objectId]) {
      setFormData(data[metaId][objectId])
    } else {
      // Init defaults
      const defaults: any = { id: Date.now().toString() }
      if (meta?.type === "catalog") {
        defaults._code = "AUTO"
        defaults._name = ""
      }
      setFormData(defaults)
    }
  }, [objectId, metaId, data, meta?.type])

  if (!meta) return null

  const handleSave = () => {
    if (isPreview) return // Disable save in preview
    saveData(metaId, formData.id, formData)
    onClose()
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleSelect = (item: any) => {
    if (selectionModal) {
      // Use _name or id as the value
      const value = item._name || item.id
      handleChange(selectionModal.fieldName, value)
      setSelectionModal(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      {selectionModal && (
        <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center p-10">
          <div className="bg-white w-full h-full max-w-4xl max-h-[600px] shadow-2xl border border-gray-400 flex flex-col rounded-sm">
            <div className="bg-[#E0F2F1] p-1 border-b border-[#80CBC4] flex justify-between items-center">
              <span className="text-sm font-medium px-2">Выбор: {selectionModal.fieldName}</span>
              <button onClick={() => setSelectionModal(null)} className="p-1 hover:bg-red-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ListForm
                metaId={selectionModal.metaId}
                onEditItem={() => {}} // Disable editing in selection mode for now
                onNewItem={() => {}} // Disable creating in selection mode for now
                onSelect={handleSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Header */}
      <div className="bg-[#E0F2F1] border-b border-[#80CBC4] p-1 flex justify-between items-center">
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            disabled={isPreview}
            className={`flex items-center gap-1 px-3 py-1 border rounded text-xs font-medium transition-colors
              ${
                isPreview
                  ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white"
              }`}
          >
            <Save className="w-3 h-3" />
            <span>Записать и закрыть</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isPreview}
            className={`p-1 rounded ${isPreview ? "text-gray-300" : "hover:bg-[#B2DFDB] text-gray-600"}`}
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-red-100 hover:text-red-600 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-2 overflow-auto">
        <div className="w-full h-full bg-white border border-gray-300 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg text-[#00695C] mb-6 border-b border-gray-200 pb-2">
            {meta.type === "catalog" ? formData._name || "Новый элемент" : `Документ № ${formData.Номер || "..."}`}
            {isPreview && (
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Предпросмотр</span>
            )}
          </h2>

          <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-4 items-center">
            {meta.type === "catalog" && (
              <>
                <label className="text-xs text-gray-600 text-right">Код:</label>
                <input
                  value={formData._code || ""}
                  onChange={(e) => handleChange("_code", e.target.value)}
                  className="w-32 border border-gray-300 p-1 text-sm rounded focus:border-[#00695C] outline-none"
                />

                <label className="text-xs text-gray-600 text-right border-b border-dotted border-gray-400 w-fit ml-auto">
                  Наименование:
                </label>
                <input
                  value={formData._name || ""}
                  onChange={(e) => handleChange("_name", e.target.value)}
                  className="w-full border border-gray-300 p-1 text-sm rounded focus:border-[#00695C] outline-none"
                />
              </>
            )}

            {meta.fields.map((field) => (
              <div key={field.id} className="contents">
                <label className="text-xs text-gray-600 text-right">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}:
                </label>
                <div className="w-full">
                  {field.type === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={formData[field.name] || false}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="w-4 h-4 text-[#00695C] focus:ring-[#00695C] border-gray-300 rounded"
                    />
                  ) : field.type === "reference" ? (
                    <div className="relative flex items-center group">
                      <select
                        value={formData[field.name] || ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`w-full border p-1 text-sm rounded-l focus:border-[#00695C] outline-none appearance-none bg-white pr-16 ${field.required && !formData[field.name] ? "border-red-300" : "border-gray-300"}`}
                        required={field.required}
                      >
                        <option value="">Выберите значение...</option>
                        {field.referenceTo &&
                          data[field.referenceTo] &&
                          Object.values(data[field.referenceTo])
                            .filter((item: any) => !item._markedForDeletion)
                            .slice(0, 5)
                            .map((refItem: any) => (
                              <option key={refItem.id} value={refItem._name || refItem.id}>
                                {refItem._name || refItem.id}
                              </option>
                            ))}
                      </select>

                      {/* Custom controls overlay */}
                      <div className="absolute right-0 top-0 bottom-0 flex border-l border-gray-300 bg-gray-50 rounded-r overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            field.referenceTo &&
                            setSelectionModal({ open: true, fieldName: field.name, metaId: field.referenceTo })
                          }
                          className="px-2 hover:bg-[#B2DFDB] border-r border-gray-300 flex items-center justify-center"
                          title="Показать все (Открыть список)"
                        >
                          <AppWindow className="w-3 h-3 text-[#00695C]" />
                        </button>
                        <div className="px-1 flex items-center justify-center pointer-events-none">
                          <ChevronDown className="w-3 h-3 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  ) : field.type === "string" && field.multiline ? (
                    <textarea
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      maxLength={field.length && field.length > 0 ? field.length : undefined}
                      required={field.required}
                      rows={3}
                      className={`w-full border p-1 text-sm rounded focus:border-[#00695C] outline-none resize-y ${field.required && !formData[field.name] ? "border-red-300" : "border-gray-300"}`}
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      maxLength={field.type === "string" && field.length && field.length > 0 ? field.length : undefined}
                      min={field.type === "number" ? field.min : undefined}
                      max={field.type === "number" ? field.max : undefined}
                      step={field.type === "number" && field.precision ? Math.pow(0.1, field.precision) : "any"}
                      required={field.required}
                      className={`w-full border p-1 text-sm rounded focus:border-[#00695C] outline-none ${field.required && !formData[field.name] ? "border-red-300" : "border-gray-300"}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
