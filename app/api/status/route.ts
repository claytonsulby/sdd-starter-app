import { NextRequest, NextResponse } from 'next/server'

const FALLBACK_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'http://localhost:3000'

const baseCorsHeaders = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Private-Network': 'true',
    'Vary': 'Origin',
}

function buildCorsHeaders(request: NextRequest) {
    const requestOrigin = request.headers.get('origin')
    return {
        ...baseCorsHeaders,
        'Access-Control-Allow-Origin': requestOrigin ?? FALLBACK_ORIGIN,
    }
}

export function GET(request: NextRequest) {
    const corsHeaders = buildCorsHeaders(request)
    return NextResponse.json(
        {
            device: 'Mock MCU',
            status: 'ok',
            timestamp: new Date().toISOString(),
        },
        {
            headers: {
                ...corsHeaders,
                'Cache-Control': 'no-store',
            },
        },
    )
}

export function OPTIONS(request: NextRequest) {
    const corsHeaders = buildCorsHeaders(request)
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
