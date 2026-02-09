import { NextResponse } from 'next/server';
import { printTicket } from '@/lib/printer';
import prisma from '@/lib/prisma'; // Adjust import based on your project structure

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { saleId } = body;

        if (!saleId) {
            return NextResponse.json({ error: 'Missing saleId' }, { status: 400 });
        }

        // Fetch sale details
        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                client: true,
                user: true
            }
        });

        if (!sale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        // Format data for printer
        const result = await printTicket({
            // storeName is handled internally by printer service via getSettings()
            saleId: sale.id.toString(),
            date: sale.createdAt,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            customerName: sale.client?.name || "Cliente Ocasional",
            employeeName: sale.user?.name || "Cajero",
            items: sale.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price
            }))
        });

        if (result.type === 'PDF' && result.pdfBuffer) {
            // Return request with PDF headers
            return new NextResponse(result.pdfBuffer as any, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="ticket-${saleId}.pdf"`
                }
            });
        }

        return NextResponse.json({ success: true, message: 'Ticket printed' });

    } catch (error) {
        console.error('Print API Error:', error);
        return NextResponse.json({ error: 'Failed to print' }, { status: 500 });
    }
}
