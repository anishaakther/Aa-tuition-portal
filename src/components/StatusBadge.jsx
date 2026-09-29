export function statusFor(student) {
  const diff = Number(student.progress || 0) - Number(student.expected_progress || 0)
  if (diff >= 5) return { label: 'Ahead', tone: 'green' }
  if (diff >= -5) return { label: 'On track', tone: 'amber' }
  return { label: 'Behind', tone: 'red' }
}

export default function StatusBadge({ student }) {
  const s = statusFor(student)
  return <span className={`badge ${s.tone}`}>{s.label}</span>
}
