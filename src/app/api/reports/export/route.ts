import { NextResponse } from 'next/server'
import { getSalesAnalytics } from '@/actions/sale'
import { getExpenses } from '@/actions/expense'
import PDFDocument from 'pdfkit'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const formatType = searchParams.get('format')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    const userId = searchParams.get('userId') || 'all'

    // Fetch Data
    const { sales, totalSales } = await getSalesAnalytics(month, year, userId)
    const expenses = await getExpenses(month, year)
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
    const netProfit = totalSales - totalExpenses

    // --- CALCULATIONS ---

    // 1. Employee Performance
    const employeeStats: Record<string, number> = {}
    sales.forEach(s => {
        if (s.status === 'COMPLETED') {
            const name = s.user?.name || 'Desconocido'
            employeeStats[name] = (employeeStats[name] || 0) + s.total
        }
    })
    const employeeRanking = Object.entries(employeeStats)
        .sort(([, a], [, b]) => b - a)
        .map(([name, total]) => ({ name, total }))

    // 2. Top Products
    const productStats: Record<string, number> = {}
    sales.forEach(s => {
        if (s.status === 'COMPLETED') {
            s.items.forEach((item: any) => {
                const name = item.product?.name || 'Item Eliminado'
                productStats[name] = (productStats[name] || 0) + item.quantity
            })
        }
    })
    const topProducts = Object.entries(productStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, qty]) => ({ name, qty }))

    const reportTitle = `Reporte ${month}/${year}`

    // --- CSV GENERATION ---
    if (formatType === 'csv') {
        const csvSections = []

        // Summary Section
        csvSections.push(['RESUMEN FINANCIERO'])
        csvSections.push(['Ingresos Totales', totalSales.toFixed(2)])
        csvSections.push(['Gastos Totales', totalExpenses.toFixed(2)])
        csvSections.push(['Utilidad Neta', netProfit.toFixed(2)])
        csvSections.push([]) // Spacer

        // Employee Section
        csvSections.push(['RENDIMIENTO DE EMPLEADOS'])
        csvSections.push(['Empleado', 'Ventas Totales'])
        employeeRanking.forEach(e => csvSections.push([e.name, e.total.toFixed(2)]))
        csvSections.push([])

        // Top Products Section
        csvSections.push(['TOP 4 PRODUCTOS'])
        csvSections.push(['Producto', 'Cantidad Vendida'])
        topProducts.forEach(p => csvSections.push([p.name, p.qty.toString()]))
        csvSections.push([])

        // Details Section
        csvSections.push(['DETALLE DE VENTAS'])
        csvSections.push(['ID', 'Fecha', 'Estado', 'Metodo', 'Items', 'Usuario', 'Total'])
        sales.forEach(s => {
            csvSections.push([
                s.id.toString(),
                format(s.createdAt, 'yyyy-MM-dd HH:mm'),
                s.status,
                s.paymentMethod,
                s.items.map((i: any) => `${i.quantity}x ${i.product.name}`).join(' | '),
                s.user?.name || '-',
                s.total.toFixed(2)
            ])
        })

        const csvString = csvSections.map(row => row.join(',')).join('\n')

        return new NextResponse(csvString, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="report-${year}-${month}.csv"`
            }
        })
    }

    // --- PDF GENERATION ---
    if (formatType === 'pdf') {
        const doc = new PDFDocument({ margin: 30, size: 'A4' })
        const buffers: Buffer[] = []
        doc.on('data', buffers.push.bind(buffers))

        return new Promise<NextResponse>((resolve) => {
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers)
                resolve(new NextResponse(pdfData as any, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="report-${year}-${month}.pdf"`
                    }
                }))
            })

            // Header
            doc.font('Helvetica-Bold').fontSize(18).text(reportTitle, { align: 'center' })
            doc.moveDown()

            // Financial Summary
            doc.fontSize(14).text('Resumen Financiero', { underline: true })
            doc.fontSize(12).font('Helvetica')
            doc.text(`Ventas Totales: $${totalSales.toFixed(2)}`)
            doc.text(`Gastos Totales: $${totalExpenses.toFixed(2)}`)
            doc.fillColor(netProfit >= 0 ? 'green' : 'red').text(`Utilidad Neta: $${netProfit.toFixed(2)}`)
            doc.fillColor('black')
            doc.moveDown()

            // Two Columns: Employees & Products
            const startY = doc.y

            // Col 1: Employees
            doc.font('Helvetica-Bold').fontSize(12).text('Rendimiento Empleados', 30, startY, { width: 200 })
            doc.fontSize(10).font('Helvetica')
            let y = startY + 20
            employeeRanking.forEach((e, i) => {
                doc.text(`${i + 1}. ${e.name}: $${e.total.toFixed(2)}`, 30, y)
                y += 15
            })

            // Col 2: Top Products
            doc.font('Helvetica-Bold').fontSize(12).text('Top 4 Productos', 300, startY, { width: 200 })
            doc.fontSize(10).font('Helvetica')
            y = startY + 20
            topProducts.forEach((p, i) => {
                doc.text(`${i + 1}. ${p.name} (${p.qty})`, 300, y)
                y += 15
            })

            doc.moveDown(4)
            y = Math.max(y, startY + 100)
            doc.y = y

            // Detailed Table Header
            doc.font('Helvetica-Bold').fontSize(12).text('Detalle de Ventas', 30, y)
            y += 20

            doc.fontSize(9).fillColor('#666')
            doc.text('ID', 30, y)
            doc.text('Fecha', 80, y)
            doc.text('Usuario', 200, y)
            doc.text('Total', 300, y)
            doc.text('Estado', 400, y)
            doc.fillColor('black')
            y += 15

            doc.fontSize(9).font('Helvetica')

            // Rows
            sales.forEach(s => {
                if (y > 750) {
                    doc.addPage()
                    y = 30
                }

                doc.text(`#${s.id}`, 30, y)
                doc.text(format(s.createdAt, 'dd/MM HH:mm'), 80, y)
                doc.text(s.user?.name || '-', 200, y)
                doc.text(`$${s.total.toFixed(2)}`, 300, y)
                doc.text(s.status, 400, y)

                heading_y = y
                y += 15
            })

            doc.end()
        })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
}

let heading_y = 0
