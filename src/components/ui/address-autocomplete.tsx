"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (result: any) => void;
    disabled?: boolean;
}

export function AddressAutocomplete({
    value,
    onChange,
    onSelect,
    disabled
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync internal state with prop
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Handle outside click to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2 && isOpen) {
                setIsLoading(true);
                try {
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                            query
                        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&country=id&types=address,poi`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setResults(data.features);
                    }
                } catch (error) {
                    console.error("Error fetching address suggestions:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500); // Debounce 500ms

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onChange(e.target.value);
        setIsOpen(true);
    };

    const handleSelect = (feature: any) => {
        setQuery(feature.place_name);
        onChange(feature.place_name);
        setIsOpen(false);
        onSelect(feature);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <Input
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder="Cari alamat lengkap (Nama jalan, gedung, dll)..."
                disabled={disabled}
                className="w-full"
            />

            {isOpen && results.length > 0 && (
                <ul className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-auto">
                    {results.map((result) => (
                        <li
                            key={result.id}
                            className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm flex items-start gap-2"
                            onClick={() => handleSelect(result)}
                        >
                            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                            <span>{result.place_name}</span>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && isLoading && (
                <div className="absolute z-50 w-full mt-1 p-2 bg-popover border rounded-md shadow-md text-xs text-center text-muted-foreground">
                    Mencari...
                </div>
            )}
        </div>
    );
}
