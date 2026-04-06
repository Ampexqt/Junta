import { useState, useEffect } from 'react';

export function useEvents() {
    const [events] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch events logic
        setLoading(false);
    }, []);

    return { events, loading };
}
