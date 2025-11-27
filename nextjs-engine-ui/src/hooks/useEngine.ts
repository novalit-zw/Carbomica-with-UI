'use client'

import { useState, useEffect } from 'react';
import { runEngine, getEngineStatus } from '../lib/apiClient';

const useEngine = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const executeScenario = async (scenarioData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await runEngine(scenarioData);
            setResults(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async () => {
        try {
            const response = await getEngineStatus();
            return response.data;
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            checkStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return { results, loading, error, executeScenario };
};

export default useEngine;
export { useEngine };