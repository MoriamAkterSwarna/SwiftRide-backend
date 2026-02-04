export interface IFareEstimation {
  pickupLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  vehicleType: "Car" | "Bike";
  distanceKm?: number;
  estimatedDurationMinutes?: number;
}

export interface IFareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgePricing: number;
  surgeMultiplier: number;
  platformFee: number;
  tax: number;
  totalFare: number;
  currency: string;
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  vehicleType: string;
}

export interface IFareConfig {
  vehicleType: "Car" | "Bike";
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  platformFeePercentage: number;
  taxPercentage: number;
}
