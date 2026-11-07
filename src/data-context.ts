import { getContext, setContext } from 'svelte'
import type { AppData } from './app-data'

export const KHOA_DATA = 'appData'
export const datData = (d: AppData) => setContext(KHOA_DATA, d)
export const layData = (): AppData => getContext<AppData>(KHOA_DATA)
