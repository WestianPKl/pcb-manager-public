import type { Route } from './+types/home'
import MainPage from '~/components/main-page'

export function meta({}: Route.MetaArgs) {
	return [{ title: 'PCB Manager' }, { name: 'description', content: 'PCB Manager description' }]
}

export default function Home() {
	return <MainPage />
}
