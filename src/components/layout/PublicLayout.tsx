import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { PublicHeader } from './PublicHeader'

export function PublicLayout() {
  return <div className="flex min-h-screen flex-col"><PublicHeader /><main className="flex-1"><Outlet /></main><Footer /></div>
}
