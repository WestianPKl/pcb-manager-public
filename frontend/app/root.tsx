import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { Provider } from 'react-redux'
import type { ReactNode } from 'react'
import { store } from './stores/store'
import { initStore } from './stores/account-actions'
import type { Route } from './+types/root'
import './app.css'

export const links: Route.LinksFunction = () => [{ rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' }]

let initPromise: Promise<unknown> | null = null

export async function clientLoader() {
	initPromise ??= store.dispatch(initStore())
	await initPromise

	return null
}

clientLoader.hydrate = true as const

export function HydrateFallback() {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-5 bg-teal-50'>
			<div className='flex flex-col items-center gap-4'>
				<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-300'>
					<div className='h-6 w-6 animate-spin rounded-full border-[3px] border-white/40 border-t-white' />
				</div>
				<div className='text-center'>
					<p className='text-sm font-semibold text-teal-600'>PCB Manager</p>
					<p className='mt-0.5 text-xs text-gray-400'>Loading application...</p>
				</div>
			</div>
		</div>
	)
}

export function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body className='bg-gray-50 m-0'>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export default function App() {
	return (
		<Provider store={store}>
			<Outlet />
		</Provider>
	)
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!'
	let details = 'An unexpected error occurred.'
	let stack: string | undefined

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error'
		details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message
		stack = error.stack
	}

	return (
		<main className='flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-gray-50 p-6'>
			<div className='w-full max-w-lg rounded-2xl border border-teal-100 bg-white p-10 shadow-xl shadow-teal-100/40'>
				<div className='mb-8 flex items-center gap-2.5'>
					<div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow'>
						<svg width='18' height='18' viewBox='0 0 24 24' fill='white'>
							<path d='M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z' />
						</svg>
					</div>
					<span className='text-sm font-bold text-teal-600'>PCB Manager</span>
				</div>

				<span
					className={`mb-4 inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
						message === '404' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'
					}`}>
					{message}
				</span>

				<h1 className='mb-2 text-xl font-bold text-gray-900'>
					{message === '404' ? 'Page not found' : 'Something went wrong'}
				</h1>
				<p className='text-sm leading-relaxed text-gray-500'>{details}</p>

				<div className='mt-7'>
					<a
						href='/'
						className='inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700'>
						← Back to Dashboard
					</a>
				</div>

				{stack && (
					<pre className='mt-6 overflow-x-auto rounded-xl border border-teal-100 bg-teal-50/50 p-4 text-[11px] leading-relaxed text-gray-600'>
						<code>{stack}</code>
					</pre>
				)}
			</div>
		</main>
	)
}
