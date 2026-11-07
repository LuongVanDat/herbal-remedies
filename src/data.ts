import type { AppData } from './app-data'
import json from './generated/data.json'

export const appData = json as unknown as AppData
