'use client'

import { useState } from 'react'
import { verifyAccessQR } from '@/actions/qr-actions'
import { Scan, CheckCircle, XCircle, Camera, Keyboard } from 'lucide-react'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function QRVerifier() {
    const [inputToken, setInputToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [scanResult, setScanResult] = useState<{ success: boolean; message: string; residentName?: string; role?: string; visitorName?: string; houseNumber?: string } | null>(null)
    const [useCamera, setUseCamera] = useState(true)

    const verifyToken = async (token: string) => {
        setLoading(true)
        setScanResult(null)
        try {
            const result = await verifyAccessQR(token)
            // @ts-ignore
            setScanResult(result)
        } catch (error) {
            setScanResult({ success: false, message: 'Error de conexión' })
        }
        setLoading(false)
    }

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputToken.trim()) return
        verifyToken(inputToken.trim())
    }

    const handleScan = (result: any) => {
        if (result && result.length > 0) {
            const rawValue = result[0].rawValue
            // In case the QR contains a full URL, extract the UUID if needed, 
            // but for now we generated just the UUID string.
            // If the scanner picks up continuously, we might want to pause it, but this component unmounts on result or we can control it.
            verifyToken(rawValue)
            setUseCamera(false) // Stop camera after scan
        }
    }

    const reset = () => {
        setScanResult(null)
        setInputToken('')
        setUseCamera(true)
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <div className="text-center mb-6">
                <div className="bg-blue-50 p-4 rounded-full inline-block mb-3">
                    <Scan className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Scanner de Acceso</h2>
            </div>

            {!scanResult ? (
                <div className="space-y-6">
                    {/* Toggle Mode */}
                    <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setUseCamera(true)}
                            className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition ${useCamera ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                        >
                            <Camera className="w-4 h-4 mr-2" /> Cámara
                        </button>
                        <button
                            onClick={() => setUseCamera(false)}
                            className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition ${!useCamera ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                        >
                            <Keyboard className="w-4 h-4 mr-2" /> Manual
                        </button>
                    </div>

                    {useCamera ? (
                        <div className="rounded-lg overflow-hidden border border-gray-300 relative bg-black aspect-square">
                            <Scanner
                                onScan={handleScan}
                                formats={['qr_code']}
                                components={{ onOff: true }}
                            />
                            <p className="absolute bottom-2 left-0 right-0 text-center text-white text-xs bg-black/50 py-1">Apunte al código QR</p>
                        </div>
                    ) : (
                        <form onSubmit={handleVerifySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Token</label>
                                <input
                                    type="text"
                                    value={inputToken}
                                    onChange={(e) => setInputToken(e.target.value)}
                                    placeholder="Ingrese UUID..."
                                    className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-blue-500 focus:border-blue-500"
                                    autoComplete="off"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !inputToken}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {loading ? 'Verificando...' : 'Verificar Acceso'}
                            </button>
                        </form>
                    )}
                </div>
            ) : (
                <div className={`text-center space-y-4 animate-in fade-in zoom-in duration-300`}>
                    <div className={`mx-auto p-4 rounded-full inline-block ${scanResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        {scanResult.success ? (
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-600" />
                        )}
                    </div>

                    <div>
                        <h3 className={`text-2xl font-bold ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                            {scanResult.success ? 'ACCESO PERMITIDO' : 'ACCESO DENEGADO'}
                        </h3>
                        <p className="text-gray-600 mt-2 font-medium">{scanResult.message}</p>
                    </div>

                    {scanResult.success && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left space-y-3">
                            <div className="border-b border-gray-200 pb-2">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Visitante</p>
                                <p className="text-xl font-bold text-gray-900">{scanResult.visitorName}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Autoriza</p>
                                    <p className="font-medium text-gray-800">{scanResult.residentName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Casa</p>
                                    <p className="font-medium text-gray-800">{scanResult.houseNumber}</p>
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                    {scanResult.role === 'resident' ? 'Residente' : scanResult.role}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={reset}
                        className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition mt-4"
                    >
                        Escanear Nuevo
                    </button>
                </div>
            )}
        </div>
    )
}
