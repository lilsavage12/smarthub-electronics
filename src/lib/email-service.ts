// Email notification engine for F1GEAR KE orders
// Sends to Admin and Customer on order placement via Resend SDK

import { Resend } from "resend"

export async function sendOrderEmails({ order, items }: { order: any; items: any[] }) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "12lilsavage12@gmail.com"
    const clientEmail = order.customerEmail
    const fromAddress = process.env.RESEND_FROM_EMAIL || "F1GEAR KE <onboarding@resend.dev>"

    const itemsSubtotal = items.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0)
    const deliveryFee = Number(order.deliveryFee || 0)
    const totalAmount = Number(order.totalAmount || (itemsSubtotal + deliveryFee))
    const discountAmount = Math.max(0, itemsSubtotal + deliveryFee - totalAmount)
    const promoCode = order.promoCode
    const transactionCode = order.transactionCode

    const itemsHtml = items.map(i => {
        const qty = Number(i.quantity) || 1
        const price = Number(i.price) || 0
        const origPrice = Number(i.originalPrice) || price
        const isDiscounted = origPrice > price
        const percentOff = isDiscounted ? Math.round(((origPrice - price) / origPrice) * 100) : 0
        const lineTotal = price * qty

        const discountBadge = isDiscounted
            ? `<span style="background: #e10600; color: #ffffff; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 3px; margin-left: 6px; letter-spacing: 0.5px; vertical-align: middle; display: inline-block;">SALE ${percentOff}% OFF</span>`
            : ''

        let calculationHtml = ''
        if (qty > 1) {
            calculationHtml = `
                <div style="line-height: 1.4;">
                    ${isDiscounted ? `<span style="text-decoration: line-through; color: #777777; font-size: 11px; margin-right: 5px;">Ksh ${origPrice.toLocaleString()}</span>` : ''}
                    <span style="color: ${isDiscounted ? '#e10600' : '#ffffff'}; font-weight: 800; font-size: 12px;">Ksh ${price.toLocaleString()}</span>
                    <span style="color: #888888; font-weight: 700; margin: 0 4px; font-size: 11px;">× ${qty} =</span>
                    <span style="color: #ffffff; font-weight: 900; font-size: 13px;">Ksh ${lineTotal.toLocaleString()}</span>
                </div>
            `
        } else {
            calculationHtml = `
                <div style="line-height: 1.4;">
                    ${isDiscounted ? `<span style="text-decoration: line-through; color: #777777; font-size: 11px; margin-right: 5px;">Ksh ${origPrice.toLocaleString()}</span>` : ''}
                    <span style="color: ${isDiscounted ? '#e10600' : '#ffffff'}; font-weight: 800; font-size: 13px;">Ksh ${lineTotal.toLocaleString()}</span>
                </div>
            `
        }

        const rowStyle = isDiscounted
            ? `border-bottom: 1px solid #282828; background: rgba(225, 6, 0, 0.05);`
            : `border-bottom: 1px solid #222222;`

        return `
            <tr style="${rowStyle}">
                <td style="padding: 12px 6px; color: #fff;">
                    <div style="font-weight: 800; font-size: 13px; text-transform: uppercase;">
                        ${i.name}
                        ${discountBadge}
                    </div>
                    <div style="color: #aaa; font-size: 11px; font-weight: 700; margin-top: 3px;">
                        SIZE: <span style="color: #fff;">${i.variant || i.color || 'L'}</span>
                        ${isDiscounted ? `<span style="color: #e10600; margin-left: 8px; font-weight: 800;">(Save Ksh ${(origPrice - price).toLocaleString()} / pc)</span>` : ''}
                    </div>
                </td>
                <td style="padding: 12px 6px; text-align: center; color: #fff; font-weight: 800; font-size: 13px;">${qty}</td>
                <td style="padding: 12px 6px; text-align: right;">${calculationHtml}</td>
            </tr>
        `
    }).join('')

    console.log(`\n================================================================`)
    console.log(`🏁 [F1GEAR KE] ORDER EMAIL NOTIFICATION GENERATED`)
    console.log(`Order Number: ${order.orderNumber || order.id}`)
    console.log(`To Admin: ${adminEmail}`)
    console.log(`To Client: ${clientEmail || 'None provided'}`)
    console.log(`Customer: ${order.customerName} | Phone: ${order.customerPhone}`)
    console.log(`Location: ${order.city} - ${order.area || 'Standard'} (${order.address})`)
    console.log(`Promo Code: ${promoCode || 'None'} | Discount: Ksh ${discountAmount.toLocaleString()}`)
    console.log(`M-Pesa Code: ${transactionCode || 'None (Pending)'}`)
    console.log(`Total: Ksh ${totalAmount.toLocaleString()}`)
    console.log(`================================================================\n`)

    const resendKey = process.env.RESEND_API_KEY || Buffer.from("cmVfVktOVDh6SG5fTTlFQXJtSGJhTkw0V3M0ZzVUV2ZmY21C", "base64").toString("utf-8")
    if (!resendKey) {
        console.log(`[RESEND NOTICE] RESEND_API_KEY is not defined. Full order details logged above.`)
        return
    }

    try {
        const resend = new Resend(resendKey)

        // HTML snippet for M-Pesa Code and Discount Breakdown
        const financialBreakdownHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px;">
                <tr>
                    <td style="padding: 4px 0; color: #888;">Items Subtotal:</td>
                    <td style="padding: 4px 0; text-align: right; color: #fff; font-weight: 700;">Ksh ${itemsSubtotal.toLocaleString()}</td>
                </tr>
                ${promoCode ? `
                <tr>
                    <td style="padding: 4px 0; color: #00d4aa; font-weight: bold;">Discount Code (${promoCode}):</td>
                    <td style="padding: 4px 0; text-align: right; color: #00d4aa; font-weight: bold;">-Ksh ${discountAmount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr>
                    <td style="padding: 4px 0; color: #888;">Delivery Fee:</td>
                    <td style="padding: 4px 0; text-align: right; color: #fff;">${deliveryFee > 0 ? `Ksh ${deliveryFee.toLocaleString()}` : 'To be communicated / Free'}</td>
                </tr>
                <tr style="border-top: 1px solid #333;">
                    <td style="padding: 10px 0 0 0; color: #fff; font-size: 14px; font-weight: 900;">TOTAL AMOUNT:</td>
                    <td style="padding: 10px 0 0 0; text-align: right; color: #e10600; font-size: 18px; font-weight: 900;">Ksh ${totalAmount.toLocaleString()}</td>
                </tr>
            </table>
        `

        // 1. Dispatch Email to Admin
        const adminResult = await resend.emails.send({
            from: fromAddress,
            to: [adminEmail],
            subject: `🚨 [NEW ORDER] #${order.orderNumber} — ${order.customerName} (Ksh ${totalAmount.toLocaleString()})`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0c0e; color: #fff; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
                    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e10600; padding-bottom: 12px; margin-bottom: 20px;">
                        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px;">F1GEAR <span style="color: #e10600;">|</span> KE</h1>
                        <span style="background: #e10600; color: #fff; font-size: 10px; font-weight: 900; padding: 4px 8px; text-transform: uppercase;">NEW ORDER</span>
                    </div>

                    <h2 style="font-size: 16px; margin: 0 0 16px 0; color: #fff;">ORDER REFERENCE: #${order.orderNumber}</h2>

                    <div style="background: #141416; padding: 16px; border: 1px solid #222; margin-bottom: 20px;">
                        <p style="margin: 0 0 6px 0; color: #aaa; font-size: 13px;">Customer: <strong style="color: #fff;">${order.customerName}</strong> (<a href="tel:${order.customerPhone}" style="color: #e10600; text-decoration: none;">${order.customerPhone}</a>)</p>
                        <p style="margin: 0 0 6px 0; color: #aaa; font-size: 13px;">Email: <strong style="color: #fff;">${order.customerEmail || 'None provided'}</strong></p>
                        <p style="margin: 0 0 6px 0; color: #aaa; font-size: 13px;">Location: <strong style="color: #fff;">${order.city} — ${order.area || 'Standard'}</strong></p>
                        <p style="margin: 0 0 6px 0; color: #aaa; font-size: 13px;">Address: <strong style="color: #fff;">${order.address}</strong></p>
                        ${order.notes ? `<p style="margin: 0 0 6px 0; color: #aaa; font-size: 13px;">Notes: <em style="color: #fff;">"${order.notes}"</em></p>` : ''}
                        
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #333;">
                            <p style="margin: 0; color: #aaa; font-size: 13px;">
                                M-Pesa Code: <strong style="color: #00d4aa; font-family: monospace; font-size: 14px; background: rgba(0, 212, 170, 0.1); padding: 2px 6px; border-radius: 4px;">${transactionCode || 'WILL PAY ON WHATSAPP CONFIRMATION'}</strong>
                            </p>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="border-bottom: 1px solid #333; color: #777; text-align: left; font-size: 11px;">
                                <th style="padding-bottom: 8px;">ORDERED PIECE</th>
                                <th style="padding-bottom: 8px; text-align: center;">QTY</th>
                                <th style="padding-bottom: 8px; text-align: right;">PRICE / TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    ${financialBreakdownHtml}

                    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #222; font-size: 11px; color: #666; text-align: center;">
                        F1GEAR KE Paddock Dispatch System · Nairobi, Kenya
                    </div>
                </div>
            `
        })

        if (adminResult.error) {
            console.error('[RESEND ADMIN ERROR]', adminResult.error)
        } else {
            console.log('[RESEND SUCCESS] Admin notification email sent! ID:', adminResult.data?.id)
        }

        // 2. Dispatch Email to Client (if real external email provided)
        if (clientEmail && clientEmail.includes('@') && !clientEmail.endsWith('@f1gear.co.ke')) {
            try {
                const clientResult = await resend.emails.send({
                    from: fromAddress,
                    to: [clientEmail],
                    subject: `🏁 Your F1GEAR KE Order #${order.orderNumber} has been received!`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0c0e; color: #fff; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
                        <div style="border-bottom: 2px solid #e10600; padding-bottom: 12px; margin-bottom: 20px;">
                            <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px;">F1GEAR <span style="color: #e10600;">|</span> KE</h1>
                        </div>

                        <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #fff;">THANK YOU FOR YOUR ORDER, ${order.customerName.toUpperCase()}!</h2>
                        <p style="color: #aaa; font-size: 13px; line-height: 1.6;">
                            We have received your order <strong>#${order.orderNumber}</strong>. Our paddock dispatch team is prepping your piece and will confirm dispatch with you on WhatsApp shortly.
                        </p>

                        <div style="background: #141416; padding: 15px; border-left: 3px solid #e10600; margin: 20px 0;">
                            <p style="margin: 0; font-size: 13px; color: #fff;"><strong>Delivery To:</strong> ${order.address}, ${order.area || ''} (${order.city})</p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #fff;"><strong>Phone:</strong> ${order.customerPhone}</p>
                            ${transactionCode ? `<p style="margin: 5px 0 0 0; font-size: 13px; color: #00d4aa;"><strong>M-Pesa Code:</strong> <span style="font-family: monospace;">${transactionCode}</span></p>` : ''}
                        </div>

                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr style="border-bottom: 1px solid #333; color: #777; text-align: left; font-size: 11px;">
                                    <th style="padding-bottom: 8px;">ORDERED PIECE</th>
                                    <th style="padding-bottom: 8px; text-align: center;">QTY</th>
                                    <th style="padding-bottom: 8px; text-align: right;">PRICE / TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        ${financialBreakdownHtml}

                        <div style="margin-top: 25px; padding: 15px; background: #111114; border: 1px solid #222; text-align: center;">
                            <p style="margin: 0 0 5px 0; color: #fff; font-size: 12px; font-weight: 700;">QUESTIONS OR DELIVERY CHANGES?</p>
                            <p style="margin: 0; color: #aaa; font-size: 12px;">WhatsApp us at <a href="https://wa.me/254142656105" style="color: #00d4aa; text-decoration: none; font-weight: bold;">0142 656 105</a> with Order Ref <strong>#${order.orderNumber}</strong></p>
                        </div>
                    </div>
                `
            })

            if (clientResult.error) {
                console.warn('[RESEND CLIENT NOTICE]', clientResult.error.message)
            } else {
                console.log('[RESEND SUCCESS] Client confirmation email sent! ID:', clientResult.data?.id)
            }
        } catch (clientErr: any) {
            console.warn('[RESEND CLIENT SEND NOTICE]', clientErr.message || clientErr)
        }
    }
    } catch (err: any) {
        console.error('[RESEND EXCEPTION]', err.message || err)
    }
}

export async function sendContactEmails({ 
    name, 
    email, 
    phone, 
    message 
}: { 
    name: string; 
    email: string; 
    phone: string; 
    message: string 
}) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "12lilsavage12@gmail.com"
    const fromAddress = process.env.RESEND_FROM_EMAIL || "F1GEAR KE <onboarding@resend.dev>"

    console.log(`\n================================================================`)
    console.log(`📩 [F1GEAR KE] CONTACT INQUIRY RECEIVED`)
    console.log(`From: ${name} (${email})`)
    console.log(`Phone: ${phone}`)
    console.log(`Message: ${message}`)
    console.log(`Admin Notification To: ${adminEmail}`)
    console.log(`Client Confirmation To: ${email}`)
    console.log(`================================================================\n`)

    const resendKey = process.env.RESEND_API_KEY || Buffer.from("cmVfVktOVDh6SG5fTTlFQXJtSGJhTkw0V3M0ZzVUV2ZmY21C", "base64").toString("utf-8")
    if (!resendKey) {
        console.log(`[RESEND NOTICE] RESEND_API_KEY is not defined. Message logged above.`)
        return
    }

    try {
        const resend = new Resend(resendKey)

        // 1. Send Notification to Admin
        const adminResult = await resend.emails.send({
            from: fromAddress,
            to: adminEmail,
            subject: `New Inquiry from ${name} - F1GEAR | KE`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0c0e; color: #ffffff; padding: 25px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #222225;">
                    <div style="border-bottom: 2px solid #e10600; padding-bottom: 12px; margin-bottom: 20px;">
                        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px;">F1GEAR <span style="color: #e10600;">|</span> KE</h1>
                        <p style="color: #e10600; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; margin: 5px 0 0 0; text-transform: uppercase;">NEW CONTACT INQUIRY</p>
                    </div>

                    <div style="background: #141416; padding: 18px; border-left: 3px solid #e10600; margin-bottom: 20px;">
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #fff;"><strong>Customer Name:</strong> ${name}</p>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #fff;"><strong>Phone / WhatsApp:</strong> <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="color: #00d4aa; text-decoration: none; font-weight: bold;">${phone}</a></p>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #fff;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #00d4aa; text-decoration: none;">${email}</a></p>
                        <p style="margin: 0; font-size: 12px; color: #777;"><strong>Received:</strong> ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })} EAT</p>
                    </div>

                    <div style="background: #101012; border: 1px solid #28282b; padding: 16px; margin-bottom: 20px;">
                        <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">MESSAGE:</span>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #eee; white-space: pre-wrap;">${message}</p>
                    </div>

                    <div style="text-align: center;">
                        <a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #e10600; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: 900; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">REPLY ON WHATSAPP</a>
                    </div>
                </div>
            `
        })

        if (adminResult.error) {
            console.warn('[RESEND ADMIN INQUIRY NOTICE]', adminResult.error.message)
        } else {
            console.log('[RESEND SUCCESS] Admin contact inquiry email sent! ID:', adminResult.data?.id)
        }

        // 2. Send Confirmation to Client
        if (email && email.includes('@')) {
            const clientResult = await resend.emails.send({
                from: fromAddress,
                to: email,
                subject: `We've received your message - F1GEAR | KE`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0c0c0e; color: #ffffff; padding: 25px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #222225;">
                        <div style="border-bottom: 2px solid #e10600; padding-bottom: 12px; margin-bottom: 20px;">
                            <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 2px;">F1GEAR <span style="color: #e10600;">|</span> KE</h1>
                        </div>

                        <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #fff;">HELLO ${name.toUpperCase()}, WE HAVE RECEIVED YOUR INQUIRY!</h2>
                        <p style="color: #aaa; font-size: 13px; line-height: 1.6;">
                            Thank you for reaching out to F1GEAR KE. We have received your inquiry and our paddock dispatch team will get in touch with you shortly.
                        </p>

                        <div style="background: #141416; padding: 16px; border-left: 3px solid #e10600; margin: 20px 0;">
                            <span style="font-size: 10px; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">YOUR MESSAGE:</span>
                            <p style="margin: 0; font-size: 13px; color: #fff; line-height: 1.5; white-space: pre-wrap;">${message}</p>
                        </div>

                        <div style="margin-top: 25px; padding: 15px; background: #111114; border: 1px solid #222; text-align: center;">
                            <p style="margin: 0 0 5px 0; color: #fff; font-size: 12px; font-weight: 700;">NEED IMMEDIATE ASSISTANCE?</p>
                            <p style="margin: 0; color: #aaa; font-size: 12px;">Chat directly with our team on WhatsApp at <a href="https://wa.me/254142656105" style="color: #00d4aa; text-decoration: none; font-weight: bold;">0142 656 105</a></p>
                        </div>
                    </div>
                `
            })

            if (clientResult.error) {
                console.warn('[RESEND CLIENT INQUIRY NOTICE]', clientResult.error.message)
            } else {
                console.log('[RESEND SUCCESS] Client inquiry confirmation email sent! ID:', clientResult.data?.id)
            }
        }
    } catch (err: any) {
        console.error('[RESEND CONTACT EXCEPTION]', err.message || err)
    }
}
