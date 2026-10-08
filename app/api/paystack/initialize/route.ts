import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

interface PaystackInitPayload {
    bookingId: string;
    email: string;
    name?: string;
    amount: number;
    currency?: string;
    package?: string;
    callbackUrl?: string;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as PaystackInitPayload;
        const { bookingId, email, name, amount, currency, package: packageName, callbackUrl } = body;

        if (!email || !amount) {
            return NextResponse.json({ error: 'Email and amount are required' }, { status: 400 });
        }

        const settings = db.getSettings();
        const secretKey = settings.gateway.paystackSecretKey || process.env.PAYSTACK_SECRET_KEY || '';
        const payCurrency = (currency || settings.gateway.currency || 'GBP').toUpperCase();

        const reference = `tthept_${bookingId || 'direct'}_${Date.now()}`;
        const reqOrigin = request.headers.get('origin') || 'http://localhost:3000';
        const finalCallbackUrl = callbackUrl || `${reqOrigin}/checkout/${bookingId || 'new'}?reference=${reference}&paystack=verify`;

        // If a real secret key is configured (starts with sk_test_ or sk_live_ and not placeholder)
        const isRealKey = secretKey && (secretKey.startsWith('sk_test_') || secretKey.startsWith('sk_live_')) && !secretKey.includes('sample') && !secretKey.includes('placeholder');

        if (isRealKey) {
            try {
                const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        amount: Math.round(Number(amount) * 100), // In subunits (kobo / cents)
                        currency: payCurrency,
                        reference,
                        callback_url: finalCallbackUrl,
                        metadata: {
                            bookingId,
                            clientName: name || email.split('@')[0],
                            package: packageName || 'Personal Training Protocol'
                        }
                    })
                });

                const paystackData = await paystackRes.json();

                if (paystackData.status && paystackData.data?.authorization_url) {
                    return NextResponse.json({
                        success: true,
                        authorizationUrl: paystackData.data.authorization_url,
                        accessCode: paystackData.data.access_code,
                        reference: paystackData.data.reference,
                        publicKey: settings.gateway.paystackPublicKey || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''
                    });
                } else {
                    console.error('Paystack initialization response:', paystackData);
                    return NextResponse.json({
                        error: paystackData.message || 'Paystack rejected transaction initialization',
                        details: paystackData
                    }, { status: 400 });
                }
            } catch (paystackErr) {
                console.error('Failed to communicate with Paystack API:', paystackErr);
                return NextResponse.json({
                    error: 'Failed to contact Paystack checkout server',
                    details: String(paystackErr)
                }, { status: 502 });
            }
        }

        // Demo / Sandbox Fallback when keys are still in setup mode
        return NextResponse.json({
            success: true,
            simulated: true,
            reference,
            message: 'Paystack is in Sandbox/Setup Mode. To charge live cards, insert your live Secret Key in the Admin Portal under Gateways or .env.local.',
            authorizationUrl: `${reqOrigin}/checkout/${bookingId || 'new'}?reference=${reference}&paystack=verify&simulated=true`
        });

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Server initialization error', details: errMsg }, { status: 500 });
    }
}
