import type { NextApiRequest, NextApiResponse } from 'next';
import { runEngine } from '../../../src/lib/engineAdapter';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { variables, scenarios } = req.body;

            // Validate input
            if (!variables || !scenarios) {
                return res.status(400).json({ error: 'Variables and scenarios are required.' });
            }

            // Run the engine with the provided variables and scenarios
            const results = await runEngine(variables, scenarios);

            return res.status(200).json(results);
        } catch (error) {
            console.error('Error running engine:', error);
            return res.status(500).json({ error: 'Failed to run the engine.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}