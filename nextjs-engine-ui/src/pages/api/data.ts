import type { NextApiRequest, NextApiResponse } from 'next';
import { getDataFromEngine } from '../../src/lib/apiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const data = await getDataFromEngine();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving data', error });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}