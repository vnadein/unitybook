"use client"

import { useContext, useState } from "react"
import { SystemContext, type ObjectMeta } from "@/lib/system-context"
import { OneCLayout } from "./one-c-layout"
import { ListForm } from "./forms/list-form"
import { ObjectForm } from "./forms/object-form"
import { ReportBuilder } from "./forms/report-builder"
import { RecycleBin } from "./forms/recycle-bin"
import { Folder, FileText, PieChart, Trash2 } from "lucide-react"

interface Tab {
  id: string
  type: "list" | "object" | "report" | "recycle-bin"
  title: string
  metaId?: string
  objectId?: string // For editing specific item
  active: boolean
}

export function UserInterface({ onExit, user, toggleMode }: { onExit: () => void; user: string | null; toggleMode: () => void }) {
  const { metadata, currentUser, data } = useContext(SystemContext)
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "start", type: "report", title: "Начальная страница", active: true }, // Using report as dashboard placeholder
  ])

  const activeTab = tabs.find((t) => t.active)

  const hasPermission = (objectId: string, permission: "read" | "write" | "delete") => {
    const user = metadata.users.find((u) => u.name === currentUser)
    if (!user) return false
    if (user.groups.includes("admin")) return true

    for (const groupId of user.groups) {
      const p = metadata.permissions.find(
        (p) => p.groupId === groupId && p.objectId === objectId
      )
      if (p && p[permission]) return true
    }
    return false
  }

  const generateTabTitle = (meta: ObjectMeta, item: any): string => {
    const abbreviation = meta.abbreviation || '';

    if (meta.type === "catalog") {
      const code = item._code || '';
      return `${abbreviation} ${code}`.trim();
    } else { // document
      const number = item.Номер || '';
      return `${abbreviation} ${number}`.trim();
    }
  };

  const openList = (meta: ObjectMeta) => {
    if (!hasPermission(meta.id, "read")) return
    const existingTab = tabs.find((t) => t.type === "list" && t.metaId === meta.id)
    if (existingTab) {
      activateTab(existingTab.id)
    } else {
      const newTab: Tab = {
        id: `list_${meta.id}`,
        type: "list",
        title: meta.name,
        metaId: meta.id,
        active: true,
      }
      setTabs((prev) => prev.map((t) => ({ ...t, active: false })).concat(newTab))
    }
  }

  const openObject = (metaId: string, objectId?: string) => {
    if (!hasPermission(metaId, objectId ? "write" : "read")) return
    const meta = [...metadata.catalogs, ...metadata.documents].find((m) => m.id === metaId)
    if (!meta) return

    const targetTabId = `obj_${metaId}_${objectId || "new"}`
    const existingTab = tabs.find((t) => t.id === targetTabId)

    if (existingTab) {
      activateTab(existingTab.id)
      return
    }

    let tabTitle = ""
    if (objectId) {
      const item = data[metaId]?.[objectId]
      if (item) {
        tabTitle = generateTabTitle(meta, item);
      } else {
        tabTitle = `${meta.name} (ред.)` // Fallback if item not found
      }
    } else {
      tabTitle = `${meta.name} (созд.)`
    }

    const newTab: Tab = {
      id: targetTabId,
      type: "object",
      title: tabTitle,
      metaId: metaId,
      objectId: objectId,
      active: true,
    }
    setTabs((prev) => prev.map((t) => ({ ...t, active: false })).concat(newTab))
  }

  const openReport = () => {
    const existingTab = tabs.find((t) => t.id === 'report-builder')
    if (existingTab) {
      activateTab(existingTab.id)
    } else {
      const newTab: Tab = {
        id: "report-builder",
        type: "report",
        title: "Конструктор отчетов",
        active: true,
      }
      setTabs((prev) => prev.map((t) => ({ ...t, active: false })).concat(newTab))
    }
  }

  const openRecycleBin = () => {
    const existingTab = tabs.find((t) => t.type === "recycle-bin")
    if (existingTab) {
      activateTab(existingTab.id)
    } else {
      const newTab: Tab = {
        id: "recycle-bin",
        type: "recycle-bin",
        title: "Корзина",
        active: true,
      }
      setTabs((prev) => prev.map((t) => ({ ...t, active: false })).concat(newTab))
    }
  }

  const activateTab = (id: string) => {
    setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === id })))
  }

  const closeTab = (id: string) => {
    const newTabs = tabs.filter((t) => t.id !== id)
    if (newTabs.length > 0 && tabs.find((t) => t.id === id)?.active) {
      newTabs[newTabs.length - 1].active = true
    }
    setTabs(newTabs)
  }

  const updateTabAfterSave = (newId: string, savedItem: any) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.active && tab.type === "object" && !tab.objectId) {
          const meta = [...metadata.catalogs, ...metadata.documents].find((m) => m.id === tab.metaId)
          let newTitle = ""

          if (meta && savedItem) {
            newTitle = generateTabTitle(meta, savedItem);
          } else {
            newTitle = tab.title.replace("(созд.)", "(ред.)") // Fallback
          }

          return {
            ...tab,
            objectId: newId,
            id: `obj_${tab.metaId}_${newId}`, // Update tab ID to be unique
            title: newTitle,
          }
        }
        return tab
      }),
    )
  }

  return (
    <OneCLayout
      title="UnityBook: Предприятие"
      onExit={onExit}
      user={user}
      tabs={tabs}
      onTabClick={activateTab}
      onTabClose={closeTab}
      toggleMode={toggleMode}
    >
      {/* Sidebar (Section Panel) */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-3 space-y-1">
          <div className="text-xs font-bold text-gray-400 uppercase px-3 py-2 tracking-wider">Справочники</div>
          {metadata.catalogs.filter(cat => hasPermission(cat.id, 'read')).map((cat) => (
            <button
              key={cat.id}
              onClick={() => openList(cat)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all group cursor-pointer ${
                activeTab?.metaId === cat.id
                  ? "bg-emerald-100 text-emerald-900 font-medium"
                  : "hover:bg-emerald-50 hover:text-emerald-700 text-gray-600"
              }`}
            >
              <Folder
                className={`w-4 h-4 transition-colors ${
                  activeTab?.metaId === cat.id
                    ? "text-emerald-600 fill-emerald-200"
                    : "text-emerald-500 group-hover:fill-emerald-100"
                }`}
              />
              <span className="text-sm">{cat.name}</span>
            </button>
          ))}

          <div className="text-xs font-bold text-gray-400 uppercase px-3 py-2 mt-6 tracking-wider">Документы</div>
          {metadata.documents.filter(doc => hasPermission(doc.id, 'read')).map((doc) => (
            <button
              key={doc.id}
              onClick={() => openList(doc)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all group cursor-pointer ${
                activeTab?.metaId === doc.id
                  ? "bg-emerald-100 text-emerald-900 font-medium"
                  : "hover:bg-emerald-50 hover:text-emerald-700 text-gray-600"
              }`}
            >
              <FileText
                className={`w-4 h-4 transition-colors ${
                  activeTab?.metaId === doc.id
                    ? "text-emerald-600 fill-emerald-200"
                    : "text-emerald-500 group-hover:fill-emerald-100"
                }`}
              />
              <span className="text-sm">{doc.name}</span>
            </button>
          ))}

          <div className="text-xs font-bold text-gray-400 uppercase px-3 py-2 mt-6 tracking-wider">Отчеты</div>
          <button
            onClick={openReport}
            className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-lg transition-all group cursor-pointer"
          >
            <PieChart className="w-4 h-4 text-emerald-500 group-hover:fill-emerald-100 transition-colors" />
            <span className="text-sm font-medium">Универсальный отчет</span>
          </button>

          {currentUser === "Администратор" && (
            <>
              <div className="text-xs font-bold text-gray-400 uppercase px-3 py-2 mt-6 tracking-wider">Администрирование</div>
              <button
                onClick={openRecycleBin}
                className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 rounded-lg transition-all group cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-emerald-500 group-hover:fill-emerald-100 transition-colors" />
                <span className="text-sm font-medium">Корзина</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 bg-[#F8F9FA] p-4 overflow-auto relative">
        {activeTab && (
          <div className="bg-white border border-gray-200 shadow-sm rounded-sm h-full w-full overflow-hidden flex flex-col">
            {activeTab.type === "list" && activeTab.metaId && (
              <ListForm
                metaId={activeTab.metaId}
                onEditItem={(id) => openObject(activeTab.metaId!, id)}
                onNewItem={() => openObject(activeTab.metaId!)}
              />
            )}
            {activeTab.type === "object" && activeTab.metaId && (
              <ObjectForm
                metaId={activeTab.metaId}
                objectId={activeTab.objectId}
                onClose={() => closeTab(activeTab.id)}
                onSaveNew={updateTabAfterSave}
              />
            )}
            {activeTab.type === "report" && <ReportBuilder />}
            {activeTab.type === "recycle-bin" && <RecycleBin />}
          </div>
        )}
      </div>
    </OneCLayout>
  )
}
