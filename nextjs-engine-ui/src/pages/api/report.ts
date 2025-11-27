import { NextApiRequest, NextApiResponse } from 'next';
import { generatePDFReport } from '../../src/services/pdfGenerator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const reportData = req.body; // Assuming the report data is sent in the request body
            const pdfBuffer = await generatePDFReport(reportData);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
            res.status(200).send(pdfBuffer);
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate report' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}