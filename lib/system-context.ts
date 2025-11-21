import { createContext } from "react"

// Типы данных для системы
export type FieldType = "string" | "number" | "boolean" | "date" | "reference"

export interface FieldMeta {
  id: string
  name: string
  type: FieldType
  referenceTo?: string
  length?: number
  precision?: number
  multiline?: boolean
  required?: boolean
  min?: number
  max?: number
  showInJournal?: boolean
  defaultValue?: any
  description?: string
  readOnly?: boolean
  unique?: boolean
  password?: boolean
  isFile?: boolean
  hidden?: boolean
  dateVariant?: 'date' | 'time' | 'datetime-local'
  parentField?: string
}

export interface TabularSectionMeta {
  id: string
  name: string
  fields: FieldMeta[]
}

export interface ObjectMeta {
  id: string
  name: string
  type: "catalog" | "document"
  fields: FieldMeta[]
  tabularSections?: TabularSectionMeta[]
  autoNumbering?: boolean
  numberReadOnly?: boolean
  dateReadOnly?: boolean
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
        { id: "f1", name: "Полное наименование", type: "string", length: 100, required: true, showInJournal: true },
        { id: "f2", name: "ИНН", type: "number", length: 10, required: true, showInJournal: true },
        { id: "f3", name: "Активен", type: "boolean", required: true, showInJournal: false },
      ],
    },
    {
      id: "cat_items",
      name: "Номенклатура",
      type: "catalog",
      fields: [
        { id: "f1", name: "Артикул", type: "string", length: 50, required: true, showInJournal: true },
        { id: "f2", name: "Цена закупки", type: "number", precision: 2, required: true, showInJournal: true },
      ],
    },
  ],
  documents: [
    {
      id: "doc_invoice",
      name: "Приходная накладная",
      type: "document",
      fields: [
        { id: "f3", name: "Контрагент", type: "reference", referenceTo: "cat_contragents", required: true, showInJournal: true },
        { id: "f4", name: "Сумма", type: "number", precision: 2, required: true, readOnly: true, showInJournal: true },
      ],
      tabularSections: [
        {
          id: 'ts_products',
          name: 'Товары',
          fields: [
            { id: 'tsf1', name: 'Номенклатура', type: 'reference', referenceTo: 'cat_items', required: true },
            { id: 'tsf2', name: 'Количество', type: 'number', precision: 3, required: true },
            { id: 'tsf3', name: 'Цена', type: 'number', precision: 2, required: true },
            { id: 'tsf4', name: 'Сумма', type: 'number', precision: 2, required: true, readOnly: true },
          ]
        }
      ]
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
  cat_items: {
    "1": { id: "1", _code: "ITM001", _name: "Ноутбук", "Артикул": "LP-15", "Цена закупки": 80000},
    "2": { id: "2", _code: "ITM002", _name: "Монитор", "Артикул": "MN-24", "Цена закупки": 20000},
  },
  doc_invoice: {
    "1": {
      id: "1",
      Номер: 1,
      Дата: '2024-07-25',
      Контрагент: 'ООО Ромашка',
      Сумма: 100000,
      Товары: [
        {id: 'row1', Номенклатура: 'Ноутбук', Количество: 1, Цена: 80000, Сумма: 80000},
        {id: 'row2', Номенклатура: 'Монитор', Количество: 1, Цена: 20000, Сумма: 20000},
      ]
    }
  }
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
