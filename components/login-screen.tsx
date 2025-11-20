"use client"

import { useContext, useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { SystemContext } from "@/lib/system-context"

export function LoginScreen({ onLogin }: { onLogin: (user: string, mode: "configurator" | "enterprise") => void }) {
  const { metadata } = useContext(SystemContext)
  const [user, setUser] = useState("Администратор")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    const rememberedUser = localStorage.getItem("rememberedUser")
    if (rememberedUser) {
      setUser(rememberedUser)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = (mode: "configurator" | "enterprise") => {
    const selectedUser = metadata.users.find((u) => u.name === user)

    if (!selectedUser) {
      setError("Пользователь не найден")
      return
    }

    if (selectedUser.password && selectedUser.password !== password) {
      setError("Неправильный пароль")
      return
    }

    if (mode === "configurator" && !selectedUser.groups.includes("admin")) {
      setError("У вас нет доступа к конфигуратору")
      return
    }

    if (rememberMe) {
      localStorage.setItem("rememberedUser", user)
    } else {
      localStorage.removeItem("rememberedUser")
    }
    onLogin(user, mode)
  }

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-xl shadow-lg w-96 border border-emerald-100">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md transform rotate-3">
            UB
          </div>
        </div>
        <h2 className="text-center text-2xl font-semibold mb-8 text-gray-800">UnityBook</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Пользователь</label>
            <select
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50"
            >
              {metadata.users.map((u) => (
                <option key={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all bg-gray-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-7 px-3 flex items-center text-gray-400 hover:text-emerald-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Запомнить меня
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="pt-6 flex gap-3">
            <button
              onClick={() => handleLogin("enterprise")}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow"
            >
              Предприятие
            </button>
            <button
              onClick={() => handleLogin("configurator")}
              className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-all hover:border-emerald-300"
            >
              Конфигуратор
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
