export type EmploymentType = 'full' | 'part' | 'project' | 'volunteer' | 'probation'
export type Experience = 'noExperience' | 'between1And3' | 'between3And6' | 'moreThan6'
export type Schedule = 'fullDay' | 'shift' | 'flexible' | 'remote' | 'flyInFlyOut'
export type ResumeStatus = 'pending' | 'parsing' | 'parse_failed' | 'parsed' | 'under_review' | 'interview_scheduled' | 'interviewed' | 'rejected' | 'accepted'

export interface VacancyRead {
  id: number
  title: string
  description: string
  key_skills?: string
  employment_type: EmploymentType
  experience: Experience
  schedule: Schedule
  salary_from?: number
  salary_to?: number
  salary_currency?: string
  gross_salary?: boolean
  company_name?: string
  company_description?: string
  area_name?: string
  metro_stations?: string
  address?: string
  professional_roles?: string
  contacts_name?: string
  contacts_email?: string
  contacts_phone?: string
  is_archived: boolean
  premium: boolean
  published_at?: string
  url?: string
  created_at: string
  updated_at: string
}

export interface VacancyCreate {
  title: string
  description: string
  key_skills?: string
  employment_type: EmploymentType
  experience: Experience
  schedule: Schedule
  salary_from?: number
  salary_to?: number
  salary_currency?: string
  gross_salary?: boolean
  company_name?: string
  company_description?: string
  area_name?: string
  metro_stations?: string
  address?: string
  professional_roles?: string
  contacts_name?: string
  contacts_email?: string
  contacts_phone?: string
  is_archived?: boolean
  premium?: boolean
  published_at?: string
  url?: string
}

export interface ResumeRead {
  id: number
  vacancy_id: number
  session_id: number
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  resume_file_url: string
  cover_letter?: string
  status: ResumeStatus
  interview_report_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ResumeCreate {
  vacancy_id: number
  applicant_name: string
  applicant_email: string
  applicant_phone?: string
  cover_letter?: string
  resume_file: File
}

export interface SessionRead {
  id: number
  session_id: string
  user_agent?: string
  ip_address?: string
  is_active: boolean
  expires_at: string
  last_activity: string
  created_at: string
  updated_at: string
}

export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface HTTPValidationError {
  detail?: ValidationError[]
}

export interface GetVacanciesParams {
  skip?: number
  limit?: number
  active_only?: boolean
  title?: string
  company_name?: string
  area_name?: string
}

export interface GetResumesParams {
  skip?: number
  limit?: number
  vacancy_id?: number
  status?: ResumeStatus
}