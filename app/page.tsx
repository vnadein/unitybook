"use client"

import { useState } from "react"
import { Configurator } from "@/components/configurator"
import { UserInterface } from "@/components/user-interface"
import { LoginScreen } from "@/components/login-screen"
import { SystemContext, initialMetadata, initialData } from "@/lib/system-context"

export default function OneCSystem() {
  const [mode, setMode] = useState<"login" | "configurator" | "enterprise">("login")
  const [metadata, setMetadata] = useState(initialMetadata)
  const [data, setData] = useState(initialData)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  // Функция для сохранения данных (симуляция БД)
  const saveData = (type: string, id: string, itemData: any) => {
    setData((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || {}),
        [id]: itemData,
      },
    }))
  }

  // Функция для удаления данных (симуляция БД)
  const deleteData = (type: string, id: string) => {
    setData((prev) => {
      const newData = { ...prev }
      if (newData[type]) {
        const newTypeData = { ...newData[type] }
        delete newTypeData[id]
        newData[type] = newTypeData
      }
      return newData
    })
  }

  // Функция обновления метаданных (из конфигуратора)
  const updateMetadata = (newMetadata: any) => {
    setMetadata(newMetadata)
  }

  const toggleMode = () => {
    if (currentUser === "Администратор") {
      setMode(mode === "configurator" ? "enterprise" : "configurator")
    }
  }

  if (mode === "login") {
    return (
      <LoginScreen
        onLogin={(user, selectedMode) => {
          setCurrentUser(user)
          setMode(selectedMode)
        }}
      />
    )
  }

  return (
    <SystemContext.Provider value={{ metadata, data, currentUser, saveData, deleteData, updateMetadata }}>
      {mode === "configurator" ? (
        <Configurator onExit={() => setMode("login")} toggleMode={toggleMode} />
      ) : (
        <UserInterface onExit={() => setMode("login")} user={currentUser} toggleMode={toggleMode} />
      )}
    </SystemContext.Provider>
  )
}
