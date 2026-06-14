import { redirect } from 'react-router'
import { store } from '~/stores/store'
import { logoutAction } from '~/stores/account-actions'

export async function clientAction() {
	await store.dispatch(logoutAction())

	throw redirect('/login')
}

export function clientLoader() {
	throw redirect('/')
}
