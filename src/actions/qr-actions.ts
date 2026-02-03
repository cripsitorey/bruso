'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function generateAccessQR(visitorName: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    // Validate input
    if (!visitorName || visitorName.trim().length === 0) {
        return { error: 'El nombre del visitante es requerido' }
    }

    const { data, error } = await supabase
        .from('access_tokens')
        .insert({
            profile_id: user.id,
            valid_until: expiresAt,
            token_code: crypto.randomUUID(),
            visitor_name: visitorName
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating token:', error)
        return { error: 'Failed to generate QR code' }
    }

    return { token: data.token_code, expiresAt: data.valid_until }
}

export async function verifyAccessQR(token: string) {
    const supabase = await createClient()

    // 1. Fetch the token
    const { data: tokenData, error: fetchError } = await supabase
        .from('access_tokens')
        .select(`
            *,
            profiles (
                name:full_name,
                role,
                house_number
            )
        `)
        .eq('token_code', token)
        .single()

    if (fetchError || !tokenData) {
        return { success: false, message: 'Código inválido o no encontrado.' }
    }

    // 2. Check if already used
    if (tokenData.is_used) {
        return { success: false, message: 'Este código YA FUE UTILIZADO.' }
    }

    // 3. Check expiration
    if (new Date(tokenData.valid_until) < new Date()) {
        return { success: false, message: 'El código ha EXPIRADO.' }
    }

    // 4. Mark as used
    // NOTE: Guard needs UPDATE permission.
    const { error: updateError } = await supabase
        .from('access_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id)

    if (updateError) {
        console.error('Error consuming token:', updateError)
        return { success: false, message: 'Error al procesar el ingreso.' }
    }

    return { 
        success: true, 
        message: 'Acceso Permitido', 
        residentName: tokenData.profiles?.name || 'Residente',
        houseNumber: tokenData.profiles?.house_number || 'N/A',
        visitorName: tokenData.visitor_name || 'Visitante',
        role: tokenData.profiles?.role
    }
}
