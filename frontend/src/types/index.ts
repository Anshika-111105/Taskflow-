export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface AuthToken {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export type AuthTokens = AuthToken

export type Priority = 'Low' | 'Medium' | 'High'
export type Status = 'Pending' | 'Completed' | 'Archived'
export type ActionType = 'created' | 'updated' | 'completed' | 'deleted'

export interface TaskFilters {
  priority?: Priority
  status?: Status
  page?: number
  page_size?: number
}

export interface Task {
  id: number
  user_id: number
  title: string
  description?: string
  priority: Priority
  status: Status
  due_date?: string
  created_at: string
  updated_at: string
}

export interface TaskHistory {
  id: number
  task_id: number
  action_type: ActionType
  previous_state?: Record<string, unknown>
  timestamp: string
}

export interface TasksResponse {
  tasks: Task[]
  total: number
  page: number
  page_size: number
}

export interface Analytics {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  archived_tasks: number
  completion_percentage: number
  completed_today: number
  completed_this_week: number
  completed_this_month: number
  most_productive_day: string | null
  most_productive_day_count: number
  average_completion_hours: number
  priority_distribution: { Low: number; Medium: number; High: number }
  productivity_score: number
  daily_chart_data: { date: string; completed: number }[]
}

export interface Feedback {
  id: number
  user_id: number
  task_id?: number
  comment: string
  rating: number
  created_at: string
}