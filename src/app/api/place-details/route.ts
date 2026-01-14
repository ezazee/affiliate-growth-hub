import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export async function GET(req: NextRequest) {
  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json({ error: 'Google Maps API key is not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId');

  if (!placeId) {
    return NextResponse.json({ error: 'Missing placeId' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    if (response.ok && data.status === 'OK') {
      const result = data.result;
      const addressComponents: { [key: string]: string } = {
        shippingAddress: result.formatted_address || '',
        city: '',
        province: '',
        postalCode: '',
      };

      // Extract city, province, postal code from address components
      result.address_components.forEach((component: any) => {
        if (component.types.includes('locality')) {
          addressComponents.city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          addressComponents.province = component.long_name;
        }
        if (component.types.includes('postal_code')) {
          addressComponents.postalCode = component.long_name;
        }
      });

      return NextResponse.json({
        shippingAddress: addressComponents.shippingAddress,
        city: addressComponents.city,
        province: addressComponents.province,
        postalCode: addressComponents.postalCode,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      });
    } else {
      return NextResponse.json({ error: data.error_message || 'Failed to fetch place details' }, { status: response.status });
    }
  } catch (error) {
    console.error('Place details API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
