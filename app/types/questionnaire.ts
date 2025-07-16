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

export interface QuestionCondition {
  variable: string
  operator: string
  value: any
}

export interface Question {
  config: QuestionConfig
  conditions: QuestionCondition[]
}

export interface QuestionnaireActionConfig {
  title: string
  questions: Question[]
}
