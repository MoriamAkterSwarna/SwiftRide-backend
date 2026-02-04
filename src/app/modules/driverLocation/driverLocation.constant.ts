// Default search radius in kilometers
export const DEFAULT_SEARCH_RADIUS_KM = 5;

// Maximum search radius in kilometers
export const MAX_SEARCH_RADIUS_KM = 50;

// Average speeds for ETA calculation (km/h)
export const AVERAGE_SPEEDS = {
  Car: 25, // Average city speed
  Bike: 20,
};

// Maximum number of drivers to return
export const DEFAULT_DRIVER_LIMIT = 10;
export const MAX_DRIVER_LIMIT = 50;

// Location update threshold (in seconds) - consider driver offline if not updated
export const LOCATION_STALE_THRESHOLD_SECONDS = 300; // 5 minutes
