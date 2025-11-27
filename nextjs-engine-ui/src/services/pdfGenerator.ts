import { PDFDocument, rgb } from 'pdf-lib';

export const generatePDFReport = async (data: any) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();

    // Title
    page.drawText('Report', {
        x: 50,
        y: height - 50,
        size: 30,
        color: rgb(0, 0, 0),
    });

    // Add data to the PDF
    let yPosition = height - 100;
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            page.drawText(`${key}: ${data[key]}`, {
                x: 50,
                y: yPosition,
                size: 12,
                color: rgb(0, 0, 0),
            });
            yPosition -= 20;
        }
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};