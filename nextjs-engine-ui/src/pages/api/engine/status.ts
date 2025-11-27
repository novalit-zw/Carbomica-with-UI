import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Logic to check the status of the engine's execution
        // This could involve checking a database, a cache, or the engine's internal state

        const status = {
            running: false, // Example status
            message: 'Engine is idle', // Example message
            // Add more status information as needed
        };

        res.status(200).json(status);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}