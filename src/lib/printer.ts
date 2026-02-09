import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { getSettings } from '@/actions/settings';

// Define Interface for Sale Data
interface SaleItem {
    name: string;
    quantity: number;
    price: number;
}

interface SaleTicketData {
    storeName?: string; // Optional, can be overridden or use settings
    address?: string;
    phone?: string;
    saleId: string;
    date: Date;
    items: SaleItem[];
    total: number;
    paymentMethod: string;
    customerName?: string;
    employeeName?: string;
}

export async function printTicket(data: SaleTicketData): Promise<{ success: boolean; type: 'PHYSICAL' | 'PDF'; pdfBuffer?: Buffer }> {
    // 0. Fetch Settings
    const settings = await getSettings();
    const storeName = settings.storeName || data.storeName || "eyeroniq PoS Lite";
    const storeAddress = settings.storeAddress || data.address;
    const storePhone = settings.storePhone || data.phone;
    const receiptFooter = settings.receiptFooter;

    // Resolve Logo Path
    let logoPath: string | null = null;
    if (settings.storeLogoUrl) {
        const relativePath = settings.storeLogoUrl.startsWith('/') ? settings.storeLogoUrl.slice(1) : settings.storeLogoUrl;
        const absolutePath = path.join(process.cwd(), 'public', relativePath);
        if (fs.existsSync(absolutePath)) {
            logoPath = absolutePath;
        }
    }

    // 1. Try Physical Print (if on Linux AND not PDF_ONLY)
    if (process.platform === 'linux' && settings.printerType !== 'PDF_ONLY') {
        try {
            const printer = new ThermalPrinter({
                type: PrinterTypes.EPSON,
                interface: 'printer',
                characterSet: CharacterSet.PC852_LATIN2,
                removeSpecialCharacters: false,
                lineCharacter: "=",
                breakLine: BreakLine.WORD,
                options: { timeout: 5000 }
            });

            // Format for Thermal Printer
            printer.alignCenter();

            // Logo
            if (logoPath) {
                try {
                    await printer.printImage(logoPath);
                } catch (e) {
                    console.error("Failed to print logo image on thermal printer", e);
                }
            }

            printer.bold(true);
            printer.setTextSize(1, 1);
            printer.println(storeName);
            printer.bold(false);
            printer.setTextSize(0, 0);

            if (storeAddress) printer.println(storeAddress);
            if (storePhone) printer.println(`Tel: ${storePhone}`);

            printer.drawLine();

            // --- DETAILS ---
            printer.alignLeft();
            printer.println(`Ticket: ${data.saleId}`);
            printer.println(`Fecha:  ${data.date.toLocaleString('es-MX')}`);
            printer.println(`Atendió: ${data.employeeName || 'Cajero'}`);
            if (data.customerName) printer.println(`Cliente: ${data.customerName}`);

            printer.drawLine();

            // --- ITEMS ---
            printer.tableCustom([
                { text: "Cant", align: "LEFT", width: 0.15 },
                { text: "Desc", align: "LEFT", width: 0.55 },
                { text: "Imp", align: "RIGHT", width: 0.30 }
            ]);

            data.items.forEach(item => {
                printer.tableCustom([
                    { text: `${item.quantity}`, align: "LEFT", width: 0.15 },
                    { text: item.name.substring(0, 18), align: "LEFT", width: 0.55 },
                    { text: `$${(item.price * item.quantity).toFixed(2)}`, align: "RIGHT", width: 0.30 }
                ]);
            });

            printer.drawLine();

            // --- TOTAL ---
            printer.alignRight();
            printer.bold(true);
            printer.println(`TOTAL: $${data.total.toFixed(2)}`);
            printer.bold(false);
            printer.println(`Pago: ${data.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}`);

            // Footer
            printer.alignCenter();
            printer.println("--------------------------------");
            if (receiptFooter) {
                printer.println(receiptFooter);
                printer.println("--------------------------------");
            }

            printer.cut();

            const buffer = printer.getBuffer();
            const printerPaths = ['/dev/usb/lp0', '/dev/usb/lp1', '/dev/lp0'];

            for (const pPath of printerPaths) {
                if (fs.existsSync(pPath)) {
                    fs.writeFileSync(pPath, buffer);
                    console.log(`Printed to ${pPath}`);
                    return { success: true, type: 'PHYSICAL' };
                }
            }
            console.warn("No physical printer found in linux. Falling back to PDF.");
        } catch (e) {
            console.error("Physical print failed", e);
        }
    }

    // 2. Fallback: Generate PDF (Dev mode or Printer failed)
    try {
        const pdfBuffer = await generatePDFTicket(data, {
            storeName,
            address: storeAddress,
            phone: storePhone,
            footer: receiptFooter,
            logoPath
        });
        return { success: true, type: 'PDF', pdfBuffer };
    } catch (e) {
        console.error("PDF generation failed", e);
        return { success: false, type: 'PDF' };
    }
}

interface PDFSettings {
    storeName: string;
    address?: string | null;
    phone?: string | null;
    footer?: string | null;
    logoPath?: string | null;
}

function generatePDFTicket(data: SaleTicketData, settings: PDFSettings): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: [226, 600], // ~80mm width thermal paper, varying height
            margin: 10
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Styles
        doc.font('Courier');

        let y = 10;

        // Logo
        if (settings.logoPath) {
            try {
                // Fit image to max width 150, center it
                doc.image(settings.logoPath, (226 - 100) / 2, y, { width: 100 });
                y += 120;
                doc.y = y;
            } catch (e) { console.error("PDF Logo fail", e) }
        }

        // Header
        doc.fontSize(14).text(settings.storeName, { align: 'center' });
        doc.fontSize(8);
        if (settings.address) doc.text(settings.address, { align: 'center' });
        if (settings.phone) doc.text(`Tel: ${settings.phone}`, { align: 'center' });
        doc.moveDown();

        // Details
        doc.text('--------------------------------');
        doc.text(`Ticket: ${data.saleId}`);
        doc.text(`Fecha:  ${data.date.toLocaleString('es-MX')}`);
        doc.text(`Atendió: ${data.employeeName || 'Cajero'}`);
        if (data.customerName) doc.text(`Cliente: ${data.customerName}`);
        doc.text('--------------------------------');
        doc.moveDown(0.5);

        // Items logic
        doc.text('Cant  Descripción       Importe');
        data.items.forEach(item => {
            const qty = item.quantity.toString().padEnd(5);
            const name = item.name.substring(0, 15).padEnd(16);
            const price = `$${(item.price * item.quantity).toFixed(2)}`;
            doc.text(`${qty} ${name} ${price}`, { align: 'left' });
        });

        doc.moveDown(0.5);
        doc.text('--------------------------------');

        // Total
        doc.fontSize(12).text(`TOTAL: $${data.total.toFixed(2)}`, { align: 'right' });
        doc.fontSize(8).text(`Pago: ${data.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}`, { align: 'right' });

        doc.moveDown();

        // Footer
        if (settings.footer) {
            doc.text(settings.footer, { align: 'center' });
        } else {
            doc.text("GRACIAS POR SU COMPRA", { align: 'center' });
        }

        doc.end();
    });
}
