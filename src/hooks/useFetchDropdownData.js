import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * A custom hook to fetch and cache dropdown data.
 * @param {string} endpoint The API endpoint to fetch data from (e.g., '/api/countries').
 * @returns {{data: Array, loading: boolean, error: Error|null}}
 */
const useFetchDropdownData = (endpoint) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!endpoint) {
                setData([]);
                setLoading(false);
                return;
            }

            const cacheKey = `dropdown_cache_${endpoint}`;

            try {
                // Check session storage first
                const cachedData = sessionStorage.getItem(cacheKey);
                if (cachedData) {
                    setData(JSON.parse(cachedData));
                    setLoading(false);
                    return;
                }

                // If not in cache, fetch from API
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}${endpoint}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();

                if (result) {
                    // Store in cache and set data
                    sessionStorage.setItem(cacheKey, JSON.stringify(result));
                    setData(result);
                } else {
                    setData([]);
                }

            } catch (e) {
                setError(e);
                console.error(`Failed to fetch dropdown data from ${endpoint}:`, e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [endpoint]); // Rerun effect if endpoint changes

    return { data, loading, error };
};

export default useFetchDropdownData;
