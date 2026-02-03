'use client'

import { X } from 'lucide-react'

type Booking = {
    id: string
    area_name: string
    start_time: string
    end_time: string
    status: string
    // In a real app, join with profiles to get name. For now we use ID or mock.
    profile_id: string
}

type Props = {
    booking: Booking
    role: string | null
    onClose: () => void
}

export default function BookingModal({ booking, role, onClose }: Props) {
    const startDate = new Date(booking.start_time)
    const endDate = new Date(booking.end_time)

    const dateStr = startDate.toLocaleDateString('es-ES', { dateStyle: 'full' })
    const timeStr = `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`

    const canViewDetails = role === 'admin' || role === 'guard'

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{booking.area_name}</h3>

                <div className="space-y-3">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Fecha</p>
                        <p className="text-gray-800 capitalize">{dateStr}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Horario</p>
                        <p className="text-gray-800">{timeStr}</p>
                    </div>

                    {canViewDetails && (
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-500 mb-1">Información Reservada (Admin/Guardia)</p>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm"><span className="font-semibold">Usuario ID:</span> <span className="font-mono text-xs">{booking.profile_id.substring(0, 8)}...</span></p>
                                <p className="text-sm"><span className="font-semibold">Estado:</span> {booking.status}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
