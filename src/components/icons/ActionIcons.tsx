import { SquarePen, Trash2 } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

// Decent, theme-aligned action colors
const EDIT_COLOR = '#4f46e5' // indigo-600 (matches table accent)
const DELETE_COLOR = '#e11d48' // rose-600

// Exported under the FaEdit / FaTrash names so existing page imports keep working.
// Any `color` passed inline by a page is intentionally overridden for consistency,
// while `size` and other props pass through.
export function FaEdit(props: LucideProps) {
  return <SquarePen strokeWidth={2.1} {...props} color={EDIT_COLOR} />
}

export function FaTrash(props: LucideProps) {
  return <Trash2 strokeWidth={2.1} {...props} color={DELETE_COLOR} />
}
