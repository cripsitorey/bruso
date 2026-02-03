'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Shield, DollarSign, Calendar, Menu, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    useEffect(() => {
        const getRole = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                setRole(profile?.role || null)
            }
            setLoading(false)
        }
        getRole()
    }, [])

    if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-black/30 z-20 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">brusO</h1>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="mt-6">
                    {role === 'admin' && (
                        <Link href="/admin" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
                            <DollarSign className="w-5 h-5 mr-3" />
                            Administrador
                        </Link>
                    )}
                    {(role === 'resident' || role === 'admin') && (
                        <Link href="/resident" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
                            <Home className="w-5 h-5 mr-3" />
                            Residente
                        </Link>
                    )}
                    {(role === 'guard' || role === 'admin') && (
                        <Link href="/guard/scan" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
                            <Shield className="w-5 h-5 mr-3" />
                            Guardia
                        </Link>
                    )}
                    {/* Everyone can see reservations, but actions differ */}
                    <Link href="/reservations" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
                        <Calendar className="w-5 h-5 mr-3" />
                        Reservas
                    </Link>

                    <button
                        onClick={async () => {
                            const { createClient } = await import('@/utils/supabase/client')
                            const supabase = createClient()
                            await supabase.auth.signOut()
                            window.location.href = '/login'
                        }}
                        className="flex w-full items-center px-6 py-3 text-red-600 hover:bg-red-50 text-left"
                    >
                        <Shield className="w-5 h-5 mr-3 opacity-0" /> {/* Spacer */}
                        Cerrar Sesión
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white shadow-sm md:hidden">
                    <span className="font-bold">brusO</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-600 focus:outline-none"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
