import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, Clock } from 'lucide-react'
import ResidentQRGenerator from '@/components/resident-qr-generator'

export default async function ResidentPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Access Tokens
    const { data: accessTokens } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    // Fetch Payments
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Bienvenido, Residente</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResidentQRGenerator />

                <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center space-y-4 hover:bg-gray-50 cursor-pointer transition">
                    <div className="p-4 bg-green-100 rounded-full">
                        <CreditCard className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold">Mis Pagos</h3>
                    <p className="text-gray-500 text-center">Revisa tus alícuotas y sube comprobantes</p>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Ver Pagos</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Historial de Accesos</h3>
                    <ul className="divide-y divide-gray-200">
                        {accessTokens?.map((token) => (
                            <li key={token.id} className="py-3 flex justify-between items-center">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        Valido hasta: {new Date(token.valid_until).toLocaleDateString()}
                                    </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${token.is_used ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                                    {token.is_used ? 'Usado' : 'Activo'}
                                </span>
                            </li>
                        ))}
                        {(!accessTokens || accessTokens.length === 0) && (
                            <p className="text-gray-500 text-sm">No hay accesos recientes.</p>
                        )}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Historial de Pagos</h3>
                    <ul className="divide-y divide-gray-200">
                        {payments?.map((payment) => (
                            <li key={payment.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">${payment.amount}</p>
                                    <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-600' :
                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {payment.status}
                                </span>
                            </li>
                        ))}
                        {(!payments || payments.length === 0) && (
                            <p className="text-gray-500 text-sm">No hay pagos registrados.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )
}
