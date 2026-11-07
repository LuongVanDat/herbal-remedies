import { render } from '@testing-library/svelte'
import type { Component } from 'svelte'
import { buildAppData, type AppData } from '../src/app-data'
import { KHOA_DATA } from '../src/data-context'
import { taiFixtureHopLe } from './helpers'

export const appFixture = (): AppData => buildAppData(taiFixtureHopLe())

export function renderVoiData<P extends Record<string, any>>(C: Component<P>, props: P, data = appFixture()) {
  return render(C as any, { props, context: new Map([[KHOA_DATA, data]]) })
}
