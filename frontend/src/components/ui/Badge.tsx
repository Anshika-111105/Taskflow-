import type { Priority, Status } from '../../types'

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cls = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' }
  return <span className={cls[priority]}>{priority}</span>
}

export function StatusBadge({ status }: { status: Status }) {
  const cls = { Pending: 'badge-pending', Completed: 'badge-completed', Archived: 'badge-archived' }
  return <span className={cls[status]}>{status}</span>
}
