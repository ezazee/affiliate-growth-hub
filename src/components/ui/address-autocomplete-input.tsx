"use client";

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Home } from 'lucide-react';

interface Suggestion {
  address: string;
}

interface AddressAutocompleteInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function AddressAutocompleteInput({ value, onValueChange, placeholder }: AddressAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(value, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/autocomplete-address?text=${debouncedSearchTerm}`);
        const data = await response.json();
        if (response.ok) {
          setSuggestions(data || []);
        } else {
          console.error(data.error);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleSelect = (suggestion: Suggestion) => {
    onValueChange(suggestion.address);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10"
            role="combobox"
            aria-expanded={open}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Cari alamat..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Mencari...' : 'Tidak ada hasil.'}
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((item, index) => (
                <CommandItem
                  key={`${item.address}-${index}`}
                  onSelect={() => handleSelect(item)}
                  value={item.address}
                >
                  {item.address}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
