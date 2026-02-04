// Default fare configurations
export const DEFAULT_FARE_CONFIG = {
  Car: {
    baseFare: 50,
    perKmRate: 15,
    perMinuteRate: 2,
    minimumFare: 100,
    platformFeePercentage: 10,
    taxPercentage: 5,
  },
  Bike: {
    baseFare: 25,
    perKmRate: 8,
    perMinuteRate: 1,
    minimumFare: 50,
    platformFeePercentage: 10,
    taxPercentage: 5,
  },
};

// Surge pricing thresholds
export const SURGE_THRESHOLDS = {
  LOW_DEMAND: 1.0, // Normal pricing
  MODERATE_DEMAND: 1.25, // 25% increase
  HIGH_DEMAND: 1.5, // 50% increase
  PEAK_DEMAND: 2.0, // Double pricing
};

// Peak hours (24-hour format)
export const PEAK_HOURS = {
  morning: { start: 7, end: 10 },
  evening: { start: 17, end: 21 },
};

// Average speeds for time estimation (km/h)
export const AVERAGE_SPEEDS = {
  Car: {
    normal: 30,
    peakHours: 15,
  },
  Bike: {
    normal: 25,
    peakHours: 20,
  },
};

export const CURRENCY = "BDT"; // Bangladeshi Taka
