'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BookingModal from './booking-modal'

type Booking = {
    id: string
    area_name: string
    start_time: string
    end_time: string
    status: string
    profile_id: string,
    urbanizacion_id: string,
    created_at: string
}

type Props = {
    bookings: Booking[]
    role: string | null
    currentDate: Date
}

export default function ReservationsCalendar({ bookings, role, currentDate }: Props) {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Calculate dates
    const firstDayOfMonth = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startingDayIndex = firstDayOfMonth.getDay() // 0 is Sunday

    const monthName = firstDayOfMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // Navigation Links
    const prevMonthDate = new Date(year, month - 1, 1)
    const nextMonthDate = new Date(year, month + 1, 1)
    const prevLink = `/reservations?year=${prevMonthDate.getFullYear()}&month=${prevMonthDate.getMonth()}`
    const nextLink = `/reservations?year=${nextMonthDate.getFullYear()}&month=${nextMonthDate.getMonth()}`

    const getBookingForDay = (day: number) => {
        return bookings.find(b => {
            const date = new Date(b.start_time)
            return date.getDate() === day
        })
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
                <Link href={prevLink} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    &larr; Anterior
                </Link>
                <h3 className="text-xl font-bold capitalize text-gray-800">{monthName}</h3>
                <Link href={nextLink} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    Siguiente &rarr;
                </Link>
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(day => (
                    <div key={day} className="text-center font-bold text-gray-500 py-2 text-xs md:text-base">{day}</div>
                ))}

                {Array.from({ length: startingDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-16 md:h-24"></div>
                ))}

                {days.map(day => {
                    const booking = getBookingForDay(day)
                    return (
                        <div
                            key={day}
                            onClick={() => booking && setSelectedBooking(booking)}
                            className={`
                                border p-1 md:p-4 h-16 md:h-24 rounded-lg relative flex flex-col items-center md:items-start justify-start transition-colors
                                ${booking
                                    ? 'bg-red-50 border-red-200 cursor-pointer hover:bg-red-100'
                                    : 'hover:bg-gray-50'
                                }
                            `}
                        >
                            <span className="font-semibold text-gray-700 text-xs md:text-base">{day}</span>
                            {booking && (
                                <>
                                    {/* Desktop: Show name */}
                                    <div className="hidden md:block text-xs bg-red-200 text-red-800 p-1 rounded mt-1 w-full truncate">
                                        {booking.area_name}
                                    </div>
                                    {/* Mobile: Show simple dot indicator */}
                                    <div className="md:hidden mt-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            {selectedBooking && (
                <BookingModal
                    booking={selectedBooking}
                    role={role}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    )
}
