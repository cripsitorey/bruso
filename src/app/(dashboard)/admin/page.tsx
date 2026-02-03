import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get admin profile to ensure security and potentially filter by urbanization
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        redirect('/')
    }

    // Fetch payments
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

    const totalCollected = payments
        ? payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0)
        : 0

    const totalPending = payments
        ? payments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + (curr.amount || 0), 0)
        : 0

    const paymentsThisMonth = payments
        ? payments.filter(p => {
            const date = new Date(p.created_at)
            const now = new Date()
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && p.status === 'paid'
        }).length
        : 0

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Panel Financiero</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-600">Total Recaudado</h3>
                    <p className="text-3xl font-bold text-green-600">${totalCollected.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-600">Pendiente</h3>
                    <p className="text-3xl font-bold text-red-500">${totalPending.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-600">Pagos del Mes</h3>
                    <p className="text-3xl font-bold text-blue-500">{paymentsThisMonth}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Pagos Recientes</h3>
                <ul className="divide-y divide-gray-200">
                    {payments?.slice(0, 10).map((payment) => (
                        <li key={payment.id} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium">Monto: ${payment.amount}</p>
                                <p className="text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-full ${payment.status === 'paid' ? 'text-green-800 bg-green-100' :
                                    payment.status === 'pending' ? 'text-yellow-800 bg-yellow-100' :
                                        'text-red-800 bg-red-100'
                                }`}>
                                {payment.status === 'paid' ? 'Pagado' :
                                    payment.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                            </span>
                        </li>
                    ))}
                    {(!payments || payments.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No hay pagos registrados.</p>
                    )}
                </ul>
            </div>
        </div>
    )
}
