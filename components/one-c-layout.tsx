"use client"

import type { ReactNode } from "react"
import { Search, User, X, Settings, Briefcase } from "lucide-react"
import { useContext } from "react"
import { SystemContext } from "@/lib/system-context"

interface LayoutProps {
  children: ReactNode
  title: string
  onExit: () => void
  user?: string | null
  tabs?: { id: string; title: string; active: boolean }[]
  onTabClick?: (id: string) => void
  onTabClose?: (id: string) => void
  toggleMode?: () => void
}

export function OneCLayout({ children, title, onExit, user, tabs = [], onTabClick, onTabClose, toggleMode }: LayoutProps) {
  const { currentUser } = useContext(SystemContext)

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans text-sm">
      {/* Header - Light Green Theme (pc2b.ru style) */}
      <div className="h-12 bg-white flex items-center justify-between px-4 border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm">
            UB
          </div>
          <span className="font-semibold text-gray-700 text-lg">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          {currentUser === "Администратор" && (
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 text-gray-600 cursor-pointer hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors"
            >
              {title === "Конфигуратор" ? <Briefcase className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              <span className="text-sm font-medium">{title === "Конфигуратор" ? "Предприятие" : "Конфигуратор"}</span>
            </button>
          )}

          <div
            className="flex items-center gap-2 text-gray-600 cursor-pointer hover:bg-emerald-50 px-3 py-1.5 rounded-md transition-colors"
            onClick={onExit}
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{user || "Администратор"}</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      {tabs.length > 0 && (
        <div className="h-9 bg-[#F8F9FA] border-b border-gray-200 flex items-end px-2 gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onTabClick?.(tab.id)}
              className={`
                group flex items-center gap-2 px-4 py-2 border-t border-l border-r rounded-t-md cursor-pointer min-w-[140px] max-w-[240px] justify-between transition-all
                ${
                  tab.active
                    ? "bg-white border-gray-200 border-b-white text-emerald-700 font-medium shadow-[0_-2px_4px_rgba(0,0,0,0.02)] relative top-[1px]"
                    : "bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }
              `}
            >
              <span className="truncate text-xs">{tab.title}</span>
              <X
                className={`w-3.5 h-3.5 rounded p-0.5 transition-colors cursor-pointer ${
                  tab.active ? "text-gray-400 hover:bg-red-100 hover:text-red-600" : "opacity-0 group-hover:opacity-100"
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  onTabClose?.(tab.id)
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-white">{children}</div>

      {/* Status Bar */}
      <div className="h-7 bg-[#F8F9FA] border-t border-gray-200 flex items-center px-4 text-xs text-gray-500 justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Готово
        </span>
        <span>UnityBook Enterprise 0.1</span>
      </div>
    </div>
  )
}
