import { useContext, useState, useEffect, useRef } from "react"
import { SystemContext, FieldMeta } from "@/lib/system-context"
import { Save, X, AppWindow, Plus, Trash2 } from "lucide-react"
import { ListForm } from "./list-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// A Helper to render appropriate input for a field
function renderFieldInput(
  field: FieldMeta,
  value: any,
  onChange: (value: any) => void,
  onOpenSelect: () => void,
) {
  switch (field.type) {
    case "boolean":
      return (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          disabled={field.readOnly}
          className="w-4 h-4 text-[#00695C] focus:ring-[#00695C] border-gray-300 rounded"
        />
      );
    case "reference":
      // Simplified for table view - just shows value, assumes selection happens elsewhere for now
      return (
         <div className="relative flex items-center group">
            <input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={field.readOnly}
              className={`w-full border p-1 text-sm rounded-l focus:border-[#00695C] outline-none bg-white pr-8 ${field.required && !value ? "border-red-300" : "border-gray-300"}`}
              required={field.required}
            />
            {!field.readOnly && (
                <div className="absolute right-0 top-0 bottom-0 flex border-l border-gray-300 bg-white overflow-hidden">
                    <button
                    type="button"
                    onClick={onOpenSelect}
                    className="px-2 hover:bg-[#B2DFDB] flex items-center justify-center rounded-r"
                    title="Выбрать из списка"
                    >
                    <AppWindow className="w-3 h-3 text-[#00695C]" />
                    </button>
                </div>
            )}
        </div>
      );
    case "string":
       if (field.multiline) {
         return <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={field.readOnly}
            className="w-full border p-1 text-sm rounded focus:border-[#00695C] outline-none"
            rows={1}
          />
       }
       // Fallthrough for single-line string
    default:
      return (
        <input
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
              ? field.dateVariant || "date"
              : "text"
          }
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readOnly}
          className={`w-full border p-1 text-sm rounded focus:border-[#00695C] outline-none ${field.required && !value ? "border-red-300" : "border-gray-300"}`}
        />
      );
  }
}


export function ObjectForm({
  metaId,
  objectId,
  initialParent,
  onClose,
  onSaveNew,
  isPreview = false,
}: {
  metaId: string
  objectId?: string
  initialParent?: string | null
  onClose: () => void
  onSaveNew?: (newId: string, savedData: any) => void
  isPreview?: boolean
}) {
  const { metadata, data, saveData } = useContext(SystemContext)
  const meta = [...metadata.catalogs, ...metadata.documents].find((m) => m.id === metaId)

  const [formData, setFormData] = useState<any>({})
  const [selectionModal, setSelectionModal] = useState<{
    open: boolean
    fieldName: string
    metaId: string
    isTabular?: boolean
    rowIndex?: number
  } | null>(null)
  
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
    const [tableHeight, setTableHeight] = useState<number | string>('auto');
  
    const folders = data[metaId] ? Object.values(data[metaId]).filter((item: any) => item._isFolder) : [];

    useEffect(() => {
      const calculateHeight = () => {
        if (panelRef.current && headerRef.current) {
          const panelHeight = panelRef.current.clientHeight;
          const headerHeight = headerRef.current.offsetHeight;
          // Buffer for padding, margins, tab list, and add button
          const buffer = 150; 
          setTableHeight(panelHeight - headerHeight - buffer);
        }
      };
  
      calculateHeight();
  
      const resizeObserver = new ResizeObserver(calculateHeight);
      if (panelRef.current) {
        resizeObserver.observe(panelRef.current);
      }
      
      return () => resizeObserver.disconnect();
    }, [meta]); // Recalculate if metadata changes (e.g., tabs appear/disappear)
  
  
    useEffect(() => {
      if (objectId && data[metaId]?.[objectId]) {
        setFormData(data[metaId][objectId])
      } else {
        // Init defaults
        const defaults: any = { id: Date.now().toString() }
        if (meta?.type === "catalog") {
        defaults._code = "AUTO"
        defaults._name = ""
        defaults.parent = initialParent || null
      } else if (meta?.type === "document") {
        defaults.Дата = new Date().toISOString().slice(0, 10)
        if (meta.autoNumbering !== false) {
          const allDocs = data[metaId] ? Object.values(data[metaId]) : []
          const lastNumber = allDocs.reduce((max, doc: any) => (doc.Номер > max ? doc.Номер : max), 0)
          defaults.Номер = lastNumber + 1
        }
      }
      // Apply default values from metadata for new items
      meta?.fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
            if (field.type === "date" && field.defaultValue === "now") {
                 const now = new Date()
                 now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
                 if (field.dateVariant === "datetime-local") {
                    defaults[field.name] = now.toISOString().slice(0, 16)
                 } else {
                    defaults[field.name] = now.toISOString().slice(0, 10)
                 }
            } else {
                defaults[field.name] = field.defaultValue
            }
        }
      })
      // Init tabular sections
      meta?.tabularSections?.forEach(ts => {
          defaults[ts.name] = [];
      });

      setFormData(defaults)
    }
  }, [objectId, metaId, data, meta])

  if (!meta) return null

  const handleSaveOnly = () => {
    if (isPreview) return
    const isNew = !objectId
    saveData(metaId, formData.id, formData)
    if (isNew && onSaveNew) {
      onSaveNew(formData.id, formData)
    }
  }

  const handleSaveAndClose = () => {
    if (isPreview) return // Disable save in preview
    saveData(metaId, formData.id, formData)
    onClose()
  }

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleSelect = (item: any) => {
    if (!selectionModal) return;
    
    const value = item._name || item.id;

    if (selectionModal.isTabular && selectionModal.rowIndex !== undefined) {
        const tsName = meta.tabularSections?.find(ts => ts.fields.some(f => f.name === selectionModal.fieldName))?.name;
        if (tsName) {
            handleRowChange(tsName, selectionModal.rowIndex, selectionModal.fieldName, value);
        }
    } else {
        handleChange(selectionModal.fieldName, value);
    }

    setSelectionModal(null);
  }

  // --- Tabular Section Functions ---
  const handleRowChange = (tsName: string, rowIndex: number, fieldName: string, value: any) => {
    const updatedRows = [...(formData[tsName] || [])];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [fieldName]: value };
    handleChange(tsName, updatedRows);
  };

  const addRow = (tsName: string) => {
    const newRow: any = { id: `row_${Date.now()}` };
    meta.tabularSections?.find(ts => ts.name === tsName)?.fields.forEach(field => {
        // You can set default values for new rows here if needed
        newRow[field.name] = undefined;
    });
    const updatedRows = [...(formData[tsName] || []), newRow];
    handleChange(tsName, updatedRows);
  };

  const deleteRow = (tsName: string, rowIndex: number) => {
    const updatedRows = [...(formData[tsName] || [])];
    updatedRows.splice(rowIndex, 1);
    handleChange(tsName, updatedRows);
  };
  // --------------------------------

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      {selectionModal && selectionModal.metaId && (
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
                onSelect={handleSelect}
                onEditItem={()=>{}}
                onNewItem={()=>{}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Header */}
      <div className="bg-[#E0F2F1] border-b border-[#80CBC4] p-1 flex justify-between items-center flex-shrink-0">
        <div className="flex gap-1">
          <button
            onClick={handleSaveAndClose}
            disabled={isPreview}
            className={`flex items-center gap-1 px-3 py-1 border rounded text-xs font-medium transition-colors
              ${
                isPreview
                  ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 border-emerald-700 text-white cursor-pointer"
              }`}
          >
            <Save className="w-3 h-3" />
            <span>Записать и закрыть</span>
          </button>
          <button
            onClick={handleSaveOnly}
            disabled={isPreview}
            className={`p-1 rounded cursor-pointer ${isPreview ? "text-gray-300" : "hover:bg-[#B2DFDB] text-gray-600"}`}
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-red-100 hover:text-red-600 rounded cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-2 overflow-auto">
        <div ref={panelRef} className="w-full h-full bg-white border border-gray-300 shadow-sm p-6 flex flex-col">
          <div ref={headerRef}>
            <h2 className="text-lg text-[#00695C] mb-6 border-b border-gray-200 pb-2">
              {meta.type === "catalog" ? formData._name || "Новый элемент" : `Документ № ${formData.Номер || "..."}`}
              {isPreview && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Предпросмотр</span>
              )}
            </h2>

            <div className="grid grid-cols-[150px_1fr] gap-y-4 gap-x-4 items-center mb-6">
              {/* Main Fields */}
              {meta.type === "catalog" && (
              <>
                {folders.length > 0 && (
                  <>
                    <label className="text-xs text-gray-600 text-right">Родитель:</label>
                    <select
                      value={formData.parent || ""}
                      onChange={(e) => handleChange("parent", e.target.value || null)}
                      className="w-full border border-gray-300 p-1 text-sm rounded focus:border-[#00695C] outline-none"
                    >
                      <option value="">Корень</option>
                      {folders.map((folder: any) => (
                        <option key={folder.id} value={folder.id}>{folder._name}</option>
                      ))}
                    </select>
                  </>
                )}

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

            {meta.type === "document" && (
              <>
                <label className="text-xs text-gray-600 text-right">Номер, дата:</label>
                <div className="flex items-center gap-2">
                  <input
                    value={formData.Номер || ""}
                    onChange={(e) => handleChange("Номер", e.target.value)}
                    readOnly={meta.autoNumbering !== false || (meta.numberReadOnly ?? true)}
                    className="w-32 border border-gray-300 p-1 text-sm rounded focus:border-[#00695C] outline-none"
                  />
                  <span className="text-sm text-gray-600">от:</span>
                  <input
                    type="date"
                    value={formData.Дата || ""}
                    onChange={(e) => handleChange("Дата", e.target.value)}
                    readOnly={meta.dateReadOnly ?? true}
                    className="w-32 border border-gray-300 p-1 text-sm rounded focus:border-[#00695C] outline-none"
                  />
                </div>
              </>
            )}
              {meta.fields.map((field) => (
                <div key={field.id} className={field.hidden ? "hidden" : "contents"}>
                  <label className="text-xs text-gray-600 text-right">
                    {field.name}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}:
                  </label>
                  {renderFieldInput(field, formData[field.name], (value) => handleChange(field.name, value), () => {
                       if (!field.referenceTo) return;
                       setSelectionModal({
                          open: true,
                          fieldName: field.name,
                          metaId: field.referenceTo,
                       })
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {meta.tabularSections && meta.tabularSections.length > 0 && (
            <div className="mt-4 flex-1 flex flex-col">
                <Tabs defaultValue={meta.tabularSections[0].name}>
                    <TabsList>
                        {meta.tabularSections.map(ts => (
                            <TabsTrigger key={ts.id} value={ts.name}>{ts.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {meta.tabularSections.map(ts => (
                        <TabsContent key={ts.id} value={ts.name}>
                            <div className="border border-gray-200 rounded-b-md p-2 bg-gray-50/50">
                                <div className="overflow-auto" style={{maxHeight: tableHeight}}>
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gray-100 z-10">
                                            <tr>
                                                {ts.fields.map(field => (
                                                    <th key={field.id} className="p-2 font-semibold text-xs text-gray-600 border-b border-gray-300">{field.name}</th>
                                                ))}
                                                <th className="p-2 w-12 border-b border-gray-300"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(formData[ts.name] || []).map((row: any, rowIndex: number) => (
                                                <tr key={row.id} className="hover:bg-gray-100">
                                                    {ts.fields.map(field => (
                                                        <td key={field.id} className="p-1 border-b border-gray-200">
                                                            {renderFieldInput(
                                                                field,
                                                                row[field.name],
                                                                (value) => handleRowChange(ts.name, rowIndex, field.name, value),
                                                                () => {
                                                                    if (!field.referenceTo) return;
                                                                    setSelectionModal({
                                                                        open: true,
                                                                        fieldName: field.name,
                                                                        metaId: field.referenceTo,
                                                                        isTabular: true,
                                                                        rowIndex: rowIndex,
                                                                    })
                                                                }
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td className="p-1 border-b border-gray-200 text-center">
                                                        {!isPreview && <button onClick={() => deleteRow(ts.name, rowIndex)} className="text-gray-400 hover:text-red-500 p-1.5 rounded"><Trash2 className="w-4 h-4" /></button>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {!isPreview && <button onClick={() => addRow(ts.name)} className="mt-2 flex items-center gap-1 text-xs bg-emerald-500 text-white px-3 py-1.5 rounded self-start hover:bg-emerald-600">
                                    <Plus className="w-3 h-3" />
                                    Добавить
                                </button>}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
