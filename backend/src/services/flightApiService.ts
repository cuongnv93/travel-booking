import axios from 'axios';

let amadeusToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtain OAuth2 Bearer Token from Amadeus Test / Production API
 */
async function getAmadeusToken(): Promise<string | null> {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (amadeusToken && amadeusToken.expiresAt > Date.now()) {
    return amadeusToken.token;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const res = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (res.data?.access_token) {
      amadeusToken = {
        token: res.data.access_token,
        expiresAt: Date.now() + (res.data.expires_in - 60) * 1000,
      };
      return amadeusToken.token;
    }
  } catch (error: any) {
    console.warn('Amadeus Auth Failed:', error.response?.data || error.message);
  }

  return null;
}

/**
 * Fetch real live flight offers from Amadeus Flight Offers Search API v2
 */
export async function fetchLiveAmadeusFlights(from: string, to: string, date?: string) {
  const token = await getAmadeusToken();
  if (!token) return null;

  try {
    const departureDate = date || new Date().toISOString().split('T')[0];
    const res = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        originLocationCode: from,
        destinationLocationCode: to,
        departureDate,
        adults: 1,
        max: 10,
        currencyCode: 'VND',
      }
    });

    const offers = res.data?.data;
    if (!Array.isArray(offers) || offers.length === 0) return null;

    const airlinesMap: Record<string, string> = {
      VU: 'Vietravel Airlines',
      VN: 'Vietnam Airlines',
      VJ: 'Vietjet Air',
      QH: 'Bamboo Airways',
    };

    return offers.map((offer: any, idx: number) => {
      const itinerary = offer.itineraries?.[0];
      const segment = itinerary?.segments?.[0];
      const carrierCode = segment?.carrierCode || 'VN';
      const priceVnd = Math.round(Number(offer.price?.total || 1200000));

      const depTime = segment?.departure?.at ? new Date(segment.departure.at).toTimeString().slice(0, 5) : '08:00';
      const arrTime = segment?.arrival?.at ? new Date(segment.arrival.at).toTimeString().slice(0, 5) : '10:15';

      return {
        _id: `live-amadeus-${offer.id || idx}`,
        airline: airlinesMap[carrierCode] || offer.validatingAirlineCodes?.[0] || 'Vietnam Airlines',
        logo: carrierCode,
        flightNumber: `${carrierCode}-${segment?.number || (100 + idx)}`,
        from: segment?.departure?.iataCode || from,
        to: segment?.arrival?.iataCode || to,
        departureTime: depTime,
        arrivalTime: arrTime,
        duration: itinerary?.duration?.replace('PT', '').toLowerCase() || '2h 15m',
        price: priceVnd,
        availableSeats: offer.numberOfBookableSeats || 15,
        isAvailable: true,
        isLive: true,
      };
    });
  } catch (error: any) {
    console.warn('Amadeus Flight Search Error:', error.response?.data || error.message);
    return null;
  }
}
