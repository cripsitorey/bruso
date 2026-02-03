
'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X } from 'lucide-react'

export default function QrScanner({ onScan }: { onScan: (data: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState<string>('')

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setIsStreaming(true)
                setError('')
            }
        } catch (err) {
            setError('No se pudo acceder a la cámara. Asegúrate de dar permisos.')
            console.error(err)
        }
    }

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            videoRef.current.srcObject = null
            setIsStreaming(false)
        }
    }

    const simulateScan = () => {
        // Simulate a successful scan with a mock UUID
        onScan('550e8400-e29b-41d4-a716-446655440000')
    }

    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    return (
        <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden flex items-center justify-center">
                {!isStreaming && (
                    <div className="text-white text-center p-4">
                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Cámara apagada</p>
                    </div>
                )}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
                />
                {isStreaming && (
                    <div className="absolute inset-0 border-2 border-white/50 m-12 rounded-lg pointer-events-none"></div>
                )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex space-x-4">
                {!isStreaming ? (
                    <button
                        onClick={startCamera}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <Camera className="w-4 h-4 mr-2" />
                        Abrir Cámara
                    </button>
                ) : (
                    <button
                        onClick={stopCamera}
                        className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cerrar
                    </button>
                )}

                {isStreaming && (
                    <button
                        onClick={simulateScan}
                        className="bg-green-600 text-white px-4 py-2 rounded-md"
                    >
                        Simular Escaneo
                    </button>
                )}
            </div>
        </div>
    )
}
