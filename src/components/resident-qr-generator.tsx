'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, X } from 'lucide-react'
import { generateAccessQR } from '@/actions/qr-actions'

export default function ResidentQRGenerator() {
    const [visitorName, setVisitorName] = useState('')
    const [qrData, setQrData] = useState<{ token: string, expiresAt: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGenerate = async () => {
        if (!visitorName.trim()) {
            setError('Por favor ingresa el nombre del visitante')
            return
        }

        setLoading(true)
        setError(null)
        try {
            const result = await generateAccessQR(visitorName)
            if (result.error) {
                setError(result.error)
            } else if (result.token && result.expiresAt) {
                setQrData({ token: result.token, expiresAt: result.expiresAt })
            }
        } catch (e) {
            setError('Error al conectar con el servidor')
        }
        setLoading(false)
    }

    const closeQR = () => {
        setQrData(null)
        setVisitorName('')
    }

    return (
        <>
            <div
                className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center space-y-4 hover:bg-gray-50 cursor-pointer transition"
                onClick={(e) => {
                    // Prevent triggering if clicking input usually, but here main div click is broad.
                    // Let's remove the click handler on the div to avoid confusion with input
                }}
            >
                <div className="p-4 bg-blue-100 rounded-full">
                    <QrCode className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Generar Acceso</h3>
                <p className="text-gray-500 text-center text-sm">Crea un código QR para tus visitas</p>

                <div className="w-full space-y-2" onClick={e => e.stopPropagation()}>
                    <input
                        type="text"
                        placeholder="Nombre del Visitante (Ej. Juan Perez)"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                    disabled={loading || !visitorName.trim()}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
                >
                    {loading ? 'Generando...' : 'Generar QR'}
                </button>
            </div>

            {/* Modal for QR Display */}
            {qrData && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 rounded-lg">
                    <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col items-center">
                        <button
                            onClick={closeQR}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Pase de Acceso</h3>
                        <p className="text-sm text-gray-500 mb-6 font-medium">Visitante: {visitorName}</p>

                        <div className="p-4 bg-white border-4 border-gray-800 rounded-lg">
                            <QRCodeSVG value={qrData.token} size={200} />
                        </div>

                        <div className="mt-6 text-center space-y-1">
                            <p className="text-xs text-gray-400 font-mono break-all">{qrData.token}</p>
                            <p className="text-sm text-red-500 font-medium">Expira: {new Date(qrData.expiresAt).toLocaleTimeString()}</p>
                        </div>

                        <button
                            onClick={closeQR}
                            className="mt-6 w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
