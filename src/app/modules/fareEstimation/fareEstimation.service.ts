import httpStatus from "http-status-codes";
import AppError from "../../ErrorHelpers/appError";
import {
  AVERAGE_SPEEDS,
  CURRENCY,
  DEFAULT_FARE_CONFIG,
  PEAK_HOURS,
  SURGE_THRESHOLDS,
} from "./fareEstimation.constant";
import {
  IFareBreakdown,
  IFareConfig,
  IFareEstimation,
} from "./fareEstimation.interface";
import { FareConfig } from "./fareEstimation.model";
import { RideRequest } from "../rideRequest/rideRequest.model";
import { RideRequestStatus } from "../rideRequest/rideRequest.interface";

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Add 20% for road distance approximation (roads aren't straight)
  return Math.round(distance * 1.2 * 10) / 10;
};

// Check if current time is during peak hours
const isPeakHour = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();

  const isMorningPeak =
    currentHour >= PEAK_HOURS.morning.start &&
    currentHour < PEAK_HOURS.morning.end;
  const isEveningPeak =
    currentHour >= PEAK_HOURS.evening.start &&
    currentHour < PEAK_HOURS.evening.end;

  return isMorningPeak || isEveningPeak;
};

// Calculate surge multiplier based on demand
const calculateSurgeMultiplier = async (
  vehicleType: "Car" | "Bike",
): Promise<number> => {
  // Count active ride requests in the last 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const activeRequests = await RideRequest.countDocuments({
    vehicleType,
    status: { $in: [RideRequestStatus.REQUESTED, RideRequestStatus.ACCEPTED] },
    requestedAt: { $gte: thirtyMinutesAgo },
  });

  // Simple demand-based surge pricing
  let surgeMultiplier = SURGE_THRESHOLDS.LOW_DEMAND;

  if (activeRequests > 50) {
    surgeMultiplier = SURGE_THRESHOLDS.PEAK_DEMAND;
  } else if (activeRequests > 30) {
    surgeMultiplier = SURGE_THRESHOLDS.HIGH_DEMAND;
  } else if (activeRequests > 15) {
    surgeMultiplier = SURGE_THRESHOLDS.MODERATE_DEMAND;
  }

  // Add additional surge during peak hours
  if (isPeakHour()) {
    surgeMultiplier = Math.min(surgeMultiplier * 1.2, SURGE_THRESHOLDS.PEAK_DEMAND);
  }

  return Math.round(surgeMultiplier * 100) / 100;
};

// Estimate travel time in minutes
const estimateTravelTime = (
  distanceKm: number,
  vehicleType: "Car" | "Bike",
): number => {
  const speeds = AVERAGE_SPEEDS[vehicleType];
  const speed = isPeakHour() ? speeds.peakHours : speeds.normal;
  const timeHours = distanceKm / speed;
  return Math.round(timeHours * 60);
};

// Get fare configuration for vehicle type
const getFareConfig = async (
  vehicleType: "Car" | "Bike",
): Promise<IFareConfig> => {
  const config = await FareConfig.findOne({ vehicleType });

  if (config) {
    return config;
  }

  // Return default config if not found in DB
  return {
    vehicleType,
    ...DEFAULT_FARE_CONFIG[vehicleType],
  };
};

const estimateFare = async (
  payload: IFareEstimation,
): Promise<IFareBreakdown> => {
  const { pickupLocation, dropoffLocation, vehicleType } = payload;

  // Calculate distance
  const distanceKm = calculateDistance(
    pickupLocation.latitude,
    pickupLocation.longitude,
    dropoffLocation.latitude,
    dropoffLocation.longitude,
  );

  // Get fare configuration
  const fareConfig = await getFareConfig(vehicleType);

  // Estimate travel time
  const estimatedDurationMinutes = estimateTravelTime(distanceKm, vehicleType);

  // Calculate surge multiplier
  const surgeMultiplier = await calculateSurgeMultiplier(vehicleType);

  // Calculate fare components
  const baseFare = fareConfig.baseFare;
  const distanceFare = distanceKm * fareConfig.perKmRate;
  const timeFare = estimatedDurationMinutes * fareConfig.perMinuteRate;

  // Calculate subtotal
  const subtotal = baseFare + distanceFare + timeFare;

  // Apply surge pricing
  const surgePricing = subtotal * (surgeMultiplier - 1);
  const fareAfterSurge = subtotal + surgePricing;

  // Calculate platform fee and tax
  const platformFee = (fareAfterSurge * fareConfig.platformFeePercentage) / 100;
  const tax = ((fareAfterSurge + platformFee) * fareConfig.taxPercentage) / 100;

  // Calculate total fare
  let totalFare = fareAfterSurge + platformFee + tax;

  // Apply minimum fare
  totalFare = Math.max(totalFare, fareConfig.minimumFare);

  // Round to nearest integer
  totalFare = Math.round(totalFare);

  return {
    baseFare: Math.round(baseFare),
    distanceFare: Math.round(distanceFare),
    timeFare: Math.round(timeFare),
    surgePricing: Math.round(surgePricing),
    surgeMultiplier,
    platformFee: Math.round(platformFee),
    tax: Math.round(tax),
    totalFare,
    currency: CURRENCY,
    estimatedDistanceKm: distanceKm,
    estimatedDurationMinutes,
    vehicleType,
  };
};

const getAllFareConfigs = async () => {
  const configs = await FareConfig.find();

  // If no configs exist, return defaults
  if (configs.length === 0) {
    return [
      { vehicleType: "Car", ...DEFAULT_FARE_CONFIG.Car },
      { vehicleType: "Bike", ...DEFAULT_FARE_CONFIG.Bike },
    ];
  }

  return configs;
};

const updateFareConfig = async (
  vehicleType: "Car" | "Bike",
  payload: Partial<IFareConfig>,
) => {
  const config = await FareConfig.findOneAndUpdate({ vehicleType }, payload, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  return config;
};

const initializeFareConfigs = async () => {
  const existingConfigs = await FareConfig.countDocuments();

  if (existingConfigs === 0) {
    await FareConfig.create([
      { vehicleType: "Car", ...DEFAULT_FARE_CONFIG.Car },
      { vehicleType: "Bike", ...DEFAULT_FARE_CONFIG.Bike },
    ]);
  }
};

export const FareEstimationServices = {
  estimateFare,
  getAllFareConfigs,
  updateFareConfig,
  initializeFareConfigs,
  calculateDistance,
};
