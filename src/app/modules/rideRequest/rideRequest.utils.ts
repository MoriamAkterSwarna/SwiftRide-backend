export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const calculateFare = (
  distance: number,
  vehicleType: "Car" | "Bike",
): number => {
  const rates = {
    Car: { base: 50, perKm: 25 },
    Bike: { base: 30, perKm: 15 },
  };

  const rate = rates[vehicleType] || rates.Car;
  const fare = rate.base + distance * rate.perKm;
  return Math.round(fare);
};
