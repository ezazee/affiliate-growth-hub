import { useState, useEffect } from 'react';

export interface Area {
    id: string;
    name: string;
}

export const useIndonesiaArea = () => {
    const [provinces, setProvinces] = useState<Area[]>([]);
    const [cities, setCities] = useState<Area[]>([]);
    const [districts, setDistricts] = useState<Area[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    // Base URL for the static API (using emsifa/api-wilayah-indonesia)
    const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    const fetchProvinces = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/provinces.json`);
            if (response.ok) {
                const data = await response.json();
                setProvinces(data);
            }
        } catch (error) {
            console.error('Failed to fetch provinces:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCities = async (provinceId: string) => {
        if (!provinceId) {
            setCities([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
            if (response.ok) {
                const data = await response.json();
                setCities(data);
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDistricts = async (cityId: string) => {
        if (!cityId) {
            setDistricts([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/districts/${cityId}.json`);
            if (response.ok) {
                const data = await response.json();
                setDistricts(data);
            }
        } catch (error) {
            console.error('Failed to fetch districts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProvinces();
    }, []);

    return {
        provinces,
        cities,
        districts,
        fetchCities,
        fetchDistricts,
        isLoading,
    };
};
