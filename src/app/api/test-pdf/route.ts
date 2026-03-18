import { NextResponse } from "next/server"
import { jsPDF } from "jspdf"

export async function GET() {
    try {
        if (typeof btoa === 'undefined') { global.btoa = (str) => Buffer.from(str, 'binary').toString('base64'); }
        if (typeof atob === 'undefined') { global.atob = (str) => Buffer.from(str, 'base64').toString('binary'); }

        const doc = new jsPDF()
        doc.text("PDF ENGINE TEST: ACTIVE", 20, 20)
        doc.text(`TIMESTAMP: ${new Date().toISOString()}`, 20, 30)
        
        const pdfBuffer = doc.output('arraybuffer')
        
        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf"
            }
        })
    } catch (error: any) {
        return NextResponse.json({ 
            error: "PDF Test Failed", 
            message: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
