const pad = (n: number) => String(n).padStart(2, '0')

export function formatLocalDateTime(value: string | Date | undefined | null, time = true): string {
	if (!value) return '—'
	const d = new Date(value)
	if (isNaN(d.getTime())) return '—'
	const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
	if (!time) return date
	return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
