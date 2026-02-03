import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon } from 'lucide-react'
import ReservationsCalendar from '@/components/reservations-calendar'

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const params = await searchParams
    const now = new Date()
    const currentYear = params.year ? parseInt(params.year as string) : now.getFullYear()
    const currentMonth = params.month ? parseInt(params.month as string) : now.getMonth()

    // Valid range for queries (UTC)
    const startOfMonthISO = new Date(currentYear, currentMonth, 1).toISOString()
    const endOfMonthISO = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString()

    // Fetch bookings for the month
    const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .gte('start_time', startOfMonthISO)
        .lte('start_time', endOfMonthISO)
        .order('start_time', { ascending: true })

    // Verify role to show/hide "New Booking" button
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const canCreateBooking = profile && (profile.role === 'resident' || profile.role === 'admin')
    const userRole = profile?.role || null

    // Pass date object for the current view
    const currentDate = new Date(currentYear, currentMonth, 1)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Reservas</h2>
                {canCreateBooking && (
                    <a href="/reservations/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        Nueva Reserva
                    </a>
                )}
            </div>

            <ReservationsCalendar
                bookings={bookings || []}
                role={userRole}
                currentDate={currentDate}
            />
        </div>
    )
}
