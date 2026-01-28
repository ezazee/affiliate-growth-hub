"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Loader2, Search, MapPin as MapPinIcon, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

import { Separator } from '@/components/ui/separator';

// Dynamic import for MapWrapper
const MapWrapper = dynamic(() => import('./MapWrapper').then(mod => mod.MapWrapper), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>,
});


interface AddressData {
  shippingAddress: string;
  city: string;
  province: string;
  postalCode: string;
}

interface CheckoutAddressInputProps {
  formData: AddressData;
  setFormData: React.Dispatch<React.SetStateAction<AddressData>>;
  disabled: boolean;
}

interface Suggestion {
  address: string;
  longitude: number;
  latitude: number;
}

const DEFAULT_VIEW_STATE = {
  longitude: 106.816666, // Jakarta Longitude
  latitude: -6.200000,  // Jakarta Latitude
  zoom: 10,
};

export function CheckoutAddressInput({ formData, setFormData, disabled }: CheckoutAddressInputProps) {
  const mapRef = useRef<any>(null); // Changed from MapRef
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);
  const [marker, setMarker] = useState({
    longitude: DEFAULT_VIEW_STATE.longitude,
    latitude: DEFAULT_VIEW_STATE.latitude,
  });

  const [inputValue, setInputValue] = useState(formData.shippingAddress || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isGeocodingInitial, setIsGeocodingInitial] = useState(true); // For initial address load

  const debouncedInputValue = useDebounce(inputValue, 500);

  // Effect to geocode initial address when formData changes
  useEffect(() => {
    if (!formData.shippingAddress || !isGeocodingInitial) return;

    const geocodeInitialAddress = async () => {
      try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.shippingAddress)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}&limit=1&country=ID`);
        const data = await response.json();

        if (response.ok && data.features && data.features.length > 0) {
          const [lon, lat] = data.features[0].center;
          setMarker({ longitude: lon, latitude: lat });
          setViewState(prev => ({ ...prev, longitude: lon, latitude: lat, zoom: 14 }));
        }
      } catch (error) {
        console.error('Error geocoding initial address:', error);
      } finally {
        setIsGeocodingInitial(false);
      }
    };
    geocodeInitialAddress();
  }, [formData.shippingAddress, isGeocodingInitial]);


  // Effect for autocomplete suggestions
  useEffect(() => {
    if (debouncedInputValue.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsFetchingSuggestions(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/autocomplete-address?text=${debouncedInputValue}`);
        const data = await response.json();
        if (response.ok) {
          // Mapbox Geocoding API returns center as [lon, lat] and place_name
          const mappedSuggestions = data.features.map((feature: any) => ({
            address: feature.place_name,
            longitude: feature.center[0],
            latitude: feature.center[1],
          }));
          setSuggestions(mappedSuggestions);
        } else {
          console.error(data.error || 'Gagal memuat saran alamat.');
        }
      } catch (error) {
        console.error('Gagal memuat saran alamat karena kesalahan jaringan.');
      } finally {
        setIsFetchingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedInputValue]);

  // Effect for reverse geocoding when marker changes
  const reverseGeocode = useCallback(async (lon: number, lat: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reverse-geocode?longitude=${lon}&latitude=${lat}`);
      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          shippingAddress: data.shippingAddress,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
        }));
        setInputValue(data.shippingAddress);

      } else {
        console.error(data.error || 'Gagal memperbarui alamat dari lokasi pin.');
      }
    } catch (error) {
      console.error('Gagal memperbarui alamat karena kesalahan jaringan.');
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [setFormData]);


  const handleMarkerDragEnd = useCallback(async (marker: { longitude: number; latitude: number }) => {
    const { longitude, latitude } = marker;
    setMarker({ longitude, latitude });
    setViewState(prev => ({ ...prev, longitude, latitude }));
    await reverseGeocode(longitude, latitude);
  }, [reverseGeocode]);


  const handleSelectSuggestion = useCallback(async (suggestion: Suggestion) => {
    setInputValue(suggestion.address);
    setMarker({ longitude: suggestion.longitude, latitude: suggestion.latitude });
    setViewState(prev => ({ ...prev, longitude: suggestion.longitude, latitude: suggestion.latitude, zoom: 14 }));
    setPopoverOpen(false);

    // Also trigger reverse geocoding to fill all form fields
    await reverseGeocode(suggestion.longitude, suggestion.latitude);
  }, [reverseGeocode]);

  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setFormData(prev => ({ ...prev, shippingAddress: e.target.value }));
    setIsGeocodingInitial(true); // Allow re-geocoding if user types
  };

  const geolocateControlRef = useRef<any>(null); // Use any type for GeolocateControl ref

  const handleGeolocate = useCallback((position: GeolocationPosition) => {
    const { longitude, latitude } = position.coords;
    setMarker({ longitude, latitude });
    setViewState(prev => ({ ...prev, longitude, latitude, zoom: 14 }));
    reverseGeocode(longitude, latitude);
  }, [reverseGeocode]);


  return (
    <div className="space-y-4">
      {/* Autocomplete Input */}
      <div className="space-y-2">
        <Label htmlFor="shippingAddress">Cari Alamat (Autocomplete)</Label>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="shippingAddress"
                value={inputValue}
                onChange={handleManualAddressChange}
                placeholder="Mulai ketik alamat pengiriman Anda..."
                className="pl-10"
                disabled={disabled}
                role="combobox"
                aria-expanded={popoverOpen}
              />
              {inputValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-muted-foreground"
                  onClick={() => {
                    setInputValue('');
                    setSuggestions([]);
                    setPopoverOpen(false);
                    setFormData(prev => ({ ...prev, shippingAddress: '', city: '', province: '', postalCode: '' }));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              {isFetchingSuggestions && (
                <div className="p-2 flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mencari...
                </div>
              )}
              {!isFetchingSuggestions && suggestions.length === 0 && debouncedInputValue.length >= 3 && (
                <CommandEmpty>Tidak ada saran alamat.</CommandEmpty>
              )}
              <CommandList>
                <CommandGroup>
                  {suggestions.map((item, index) => (
                    <CommandItem
                      key={`${item.address}-${index}`}
                      onSelect={() => handleSelectSuggestion(item)}
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
        {isReverseGeocoding && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Memperbarui alamat dari pin...
          </p>
        )}
      </div>

      <Separator />

      {/* Mapbox Map */}
      <div className="space-y-2">
        <Label>Atau pilih lokasi di peta</Label>
        <MapWrapper
          viewState={viewState}
          setViewState={setViewState}
          marker={marker}
          handleMarkerDragEnd={handleMarkerDragEnd}
          handleGeolocate={handleGeolocate}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY as string}
        />
      </div>

      <Separator />

      {/* Derived Address Fields (Read-only for visual confirmation) */}
      <div className="space-y-4">
        <Label>Detail Alamat (Dikonfirmasi)</Label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="confirmed-shippingAddress">Alamat Jalan</Label>
            <Input id="confirmed-shippingAddress" value={formData.shippingAddress} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmed-city">Kota</Label>
            <Input id="confirmed-city" value={formData.city} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmed-province">Provinsi</Label>
            <Input id="confirmed-province" value={formData.province} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmed-postalCode">Kode Pos</Label>
            <Input id="confirmed-postalCode" value={formData.postalCode} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}