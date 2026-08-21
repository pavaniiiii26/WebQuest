const TRIP_KEY = 'voyalette-trip-places';

export function placeId(place, destination = '') {
  return `${destination}::${place?.name || ''}`.toLowerCase();
}

export function loadTripPlaces() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TRIP_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTripPlaces(places) {
  localStorage.setItem(TRIP_KEY, JSON.stringify(places));
}

export function isPlaceOnTrip(places, place, destination) {
  const id = placeId(place, destination);
  return places.some((item) => placeId(item, item.destination) === id);
}

export function toggleTripPlace(places, place, destination) {
  const id = placeId(place, destination);
  const exists = places.some((item) => placeId(item, item.destination) === id);
  const next = exists
    ? places.filter((item) => placeId(item, item.destination) !== id)
    : [...places, { ...place, destination }];
  saveTripPlaces(next);
  return next;
}
