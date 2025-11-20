import { createContext } from "react"

// Типы данных для системы
export type FieldType = "string" | "number" | "boolean" | "date" | "reference"

export interface FieldMeta {
  id: string
  name: string
  type: FieldType
  referenceTo?: string // ID справочника, если type === reference
  length?: number // Длина строки или общая длина числа
  precision?: number // Точность числа (знаков после запятой)
  multiline?: boolean // Многострочный режим для строк
  required?: boolean // Обязательное поле
  min?: number // Минимальное значение
  max?: number // Максимальное значение
}

export interface ObjectMeta {
  id: string
  name: string
  type: "catalog" | "document"
  fields: FieldMeta[]
}

export interface User {
  id: string
  name: string
  password?: string
  groups: string[]
}

export interface UserGroup {
  id: string
  name: string
}

export interface Permission {
  groupId: string
  objectId: string
  read: boolean
  write: boolean
  delete: boolean
}

export interface Metadata {
  catalogs: ObjectMeta[]
  documents: ObjectMeta[]
  users: User[]
  userGroups: UserGroup[]
  permissions: Permission[]
}

// Начальная конфигурация (Демо база)
export const initialMetadata: Metadata = {
  catalogs: [
    {
      id: "cat_contragents",
      name: "Контрагенты",
      type: "catalog",
      fields: [
        { id: "f1", name: "Полное наименование", type: "string", length: 100, required: true },
        { id: "f2", name: "ИНН", type: "number", length: 10, required: true },
        { id: "f3", name: "Активен", type: "boolean", required: true },
      ],
    },
    {
      id: "cat_items",
      name: "Номенклатура",
      type: "catalog",
      fields: [
        { id: "f1", name: "Артикул", type: "string", length: 50, required: true },
        { id: "f2", name: "Цена закупки", type: "number", precision: 2, required: true },
      ],
    },
  ],
  documents: [
    {
      id: "doc_invoice",
      name: "Приходная накладная",
      type: "document",
      fields: [
        { id: "f1", name: "Номер", type: "string", length: 20, required: true },
        { id: "f2", name: "Дата", type: "date", required: true },
        { id: "f3", name: "Контрагент", type: "reference", referenceTo: "cat_contragents", required: true },
        { id: "f4", name: "Сумма", type: "number", precision: 2, required: true },
      ],
    },
  ],
  users: [
    { id: "user_admin", name: "Администратор", groups: ["admin"] },
    { id: "user_manager", name: "Менеджер", groups: ["manager"] },
    { id: "user_accountant", name: "Бухгалтер", groups: ["accountant"] },
  ],
  userGroups: [
    { id: "admin", name: "Администраторы" },
    { id: "manager", name: "Менеджеры" },
    { id: "accountant", name: "Бухгалтеры" },
  ],
  permissions: [],
}

// Начальные данные
export const initialData: Record<string, Record<string, any>> = {
  cat_contragents: {
    "1": {
      id: "1",
      _code: "00001",
      _name: "ООО Ромашка",
      "Полное наименование": "Общество с ограниченной ответственностью Ромашка",
      ИНН: 7700000000,
      Активен: true,
    },
    "2": {
      id: "2",
      _code: "00002",
      _name: "ЗАО Вектор",
      "Полное наименование": "Закрытое акционерное общество Вектор",
      ИНН: 5000000000,
      Активен: true,
    },
  },
}

export const SystemContext = createContext<{
  metadata: Metadata
  data: any
  currentUser: string | null // Added currentUser to context
  saveData: (type: string, id: string, data: any) => void
  deleteData: (type: string, id: string) => void
  updateMetadata: (meta: Metadata) => void
}>({
  metadata: initialMetadata,
  data: initialData,
  currentUser: null, // Default value
  saveData: () => {},
  deleteData: () => {},
  updateMetadata: () => {},
})
