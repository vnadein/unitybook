"use client"

import { useContext, useState } from "react"
import { SystemContext } from "@/lib/system-context"
import { Play, Settings } from "lucide-react"

export function ReportBuilder() {
  const { metadata, data } = useContext(SystemContext)
  const [selectedSource, setSelectedSource] = useState<string>("")
  const [reportResult, setReportResult] = useState<any[]>([])

  const generateReport = () => {
    if (!selectedSource || !data[selectedSource]) {
      setReportResult([])
      return
    }
    setReportResult(Object.values(data[selectedSource]))
  }

  const sourceMeta = [...metadata.catalogs, ...metadata.documents].find((m) => m.id === selectedSource)

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700">Источник данных:</label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="border border-gray-300 rounded p-1 text-xs min-w-[200px]"
          >
            <option value="">Выберите...</option>
            <optgroup label="Справочники">
              {metadata.catalogs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Документы">
              {metadata.documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <button
          onClick={generateReport}
          className="bg-emerald-500 hover:bg-emerald-600 border-emerald-700 px-4 py-1 rounded text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-3 h-3 fill-current" />
          Сформировать
        </button>
        <button className="bg-white border border-gray-300 px-3 py-1 rounded text-xs text-gray-700 flex items-center gap-2 hover:bg-gray-50 cursor-pointer">
          <Settings className="w-3 h-3" />
          Настройки...
        </button>
      </div>

      <div className="flex-1 p-4 overflow-auto bg-white">
        {reportResult.length > 0 && sourceMeta ? (
          <div className="border border-gray-300 inline-block min-w-full">
            <div className="bg-white p-4 text-center font-bold text-lg border-b border-gray-300">
              Отчет по: {sourceMeta.name}
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-yellow-50">
                  {sourceMeta.type === "catalog" && (
                    <>
                      <th className="border border-gray-400 p-2">Код</th>
                      <th className="border border-gray-400 p-2">Наименование</th>
                    </>
                  )}
                  {sourceMeta.fields.map((f) => (
                    <th key={f.id} className="border border-gray-400 p-2">
                      {f.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportResult.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50">
                    {sourceMeta.type === "catalog" && (
                      <>
                        <td className="border border-gray-300 p-1">{row._code}</td>
                        <td className="border border-gray-300 p-1">{row._name}</td>
                      </>
                    )}
                    {sourceMeta.fields.map((f) => (
                      <td key={f.id} className="border border-gray-300 p-1">
                        {typeof row[f.name] === "boolean" ? (row[f.name] ? "Да" : "Нет") : row[f.name]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-20">Сформируйте отчет для просмотра данных</div>
        )}
      </div>
    </div>
  )
}
