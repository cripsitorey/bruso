'use client'

import QRVerifier from '@/components/qr-verifier'

export default function GuardScanPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center">Control de Acceso</h1>
            <QRVerifier />
            <div className="max-w-md mx-auto text-center text-sm text-gray-500">
                <p>Use el scanner para validar los códigos QR de los visitantes.</p>
            </div>
        </div>
    )
}
