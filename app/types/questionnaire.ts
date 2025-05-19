import { FieldType } from '.prisma/client'

export interface QuestionConfig {
  id: string
  question: string
  description?: string
  type: FieldType
  variable: string
  isRequired: boolean
  default?: string
  placeholder?: string
  order: number
  options?: { label: string; value: string }[] // Pour Select et MultiSelect
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
}

export interface QuestionnaireActionConfig {
  title: string
  questions: QuestionConfig[]
}
