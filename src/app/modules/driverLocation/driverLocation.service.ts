import httpStatus from "http-status-codes";
import AppError from "../../ErrorHelpers/appError";
import { Driver } from "../driver/driver.model";
import {
  AVERAGE_SPEEDS,
  DEFAULT_DRIVER_LIMIT,
  DEFAULT_SEARCH_RADIUS_KM,
  LOCATION_STALE_THRESHOLD_SECONDS,
  MAX_DRIVER_LIMIT,
  MAX_SEARCH_RADIUS_KM,
} from "./driverLocation.constant";
import { INearbyDriverQuery } from "./driverLocation.interface";
import { DriverLocation } from "./driverLocation.model";

const updateDriverLocation = async (
  userId: string,
  payload: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  },
) => {
  // Find the driver associated with this user
  const driver = await Driver.findOne({ user: userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (driver.status !== "approved") {
    throw new AppError(httpStatus.FORBIDDEN, "Driver is not approved");
  }

  // Update or create driver location
  const location = await DriverLocation.findOneAndUpdate(
    { driver: driver._id },
    {
      driver: driver._id,
      user: userId,
      location: {
        type: "Point",
        coordinates: [payload.longitude, payload.latitude], // GeoJSON format: [lng, lat]
      },
      lastUpdated: new Date(),
      isOnline: driver.isOnline,
      vehicleType: driver.vehicleType,
      heading: payload.heading,
      speed: payload.speed,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );

  return location;
};

const getDriverLocation = async (driverId: string) => {
  const location = await DriverLocation.findOne({ driver: driverId })
    .populate("user", "name picture phone")
    .populate("driver");

  if (!location) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver location not found");
  }

  return location;
};

const findNearbyDrivers = async (query: INearbyDriverQuery) => {
  const {
    latitude,
    longitude,
    radiusKm = DEFAULT_SEARCH_RADIUS_KM,
    vehicleType,
    limit = DEFAULT_DRIVER_LIMIT,
  } = query;

  // Validate and cap values
  const searchRadius = Math.min(radiusKm, MAX_SEARCH_RADIUS_KM);
  const driverLimit = Math.min(limit, MAX_DRIVER_LIMIT);

  // Calculate stale threshold
  const staleThreshold = new Date(
    Date.now() - LOCATION_STALE_THRESHOLD_SECONDS * 1000,
  );

  // Build match conditions
  const matchConditions: Record<string, unknown> = {
    isOnline: true,
    lastUpdated: { $gte: staleThreshold },
  };

  if (vehicleType) {
    matchConditions.vehicleType = vehicleType;
  }

  // Find nearby drivers using geospatial query
  const nearbyDrivers = await DriverLocation.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        distanceField: "distance",
        maxDistance: searchRadius * 1000, // Convert km to meters
        spherical: true,
        query: matchConditions,
      },
    },
    {
      $limit: driverLimit,
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $lookup: {
        from: "drivers",
        localField: "driver",
        foreignField: "_id",
        as: "driverInfo",
      },
    },
    {
      $unwind: "$driverInfo",
    },
    {
      $match: {
        "driverInfo.status": "approved",
        "driverInfo.isActive": true,
      },
    },
    {
      $project: {
        driver: 1,
        user: {
          _id: "$userInfo._id",
          name: "$userInfo.name",
          picture: "$userInfo.picture",
          phone: "$userInfo.phone",
        },
        driverInfo: {
          vehicleType: "$driverInfo.vehicleType",
          vehicleModel: "$driverInfo.vehicleModel",
          vehiclePlateNumber: "$driverInfo.vehiclePlateNumber",
          rating: "$driverInfo.rating",
          totalCompletedRides: "$driverInfo.totalCompletedRides",
        },
        distance: { $divide: ["$distance", 1000] }, // Convert meters to km
        location: 1,
        heading: 1,
        speed: 1,
        lastUpdated: 1,
      },
    },
  ]);

  // Calculate ETA for each driver
  const driversWithETA = nearbyDrivers.map((driver) => {
    const speed = AVERAGE_SPEEDS[driver.driverInfo.vehicleType as "Car" | "Bike"];
    const estimatedArrivalMinutes = Math.ceil((driver.distance / speed) * 60);

    return {
      ...driver,
      distance: Math.round(driver.distance * 10) / 10, // Round to 1 decimal
      estimatedArrivalMinutes,
    };
  });

  return driversWithETA;
};

const setDriverOnlineStatus = async (userId: string, isOnline: boolean) => {
  const driver = await Driver.findOne({ user: userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  // Update driver online status
  await Driver.findByIdAndUpdate(driver._id, { isOnline });

  // Update location record if exists
  await DriverLocation.findOneAndUpdate(
    { driver: driver._id },
    { isOnline },
  );

  return { isOnline };
};

const removeDriverLocation = async (userId: string) => {
  const driver = await Driver.findOne({ user: userId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  await DriverLocation.findOneAndDelete({ driver: driver._id });

  return null;
};

const getOnlineDriversCount = async (vehicleType?: "Car" | "Bike") => {
  const staleThreshold = new Date(
    Date.now() - LOCATION_STALE_THRESHOLD_SECONDS * 1000,
  );

  const matchConditions: Record<string, unknown> = {
    isOnline: true,
    lastUpdated: { $gte: staleThreshold },
  };

  if (vehicleType) {
    matchConditions.vehicleType = vehicleType;
  }

  const count = await DriverLocation.countDocuments(matchConditions);

  return { count, vehicleType: vehicleType || "all" };
};

const getDriversInArea = async (
  bounds: {
    northEast: { latitude: number; longitude: number };
    southWest: { latitude: number; longitude: number };
  },
  vehicleType?: "Car" | "Bike",
) => {
  const staleThreshold = new Date(
    Date.now() - LOCATION_STALE_THRESHOLD_SECONDS * 1000,
  );

  const matchConditions: Record<string, unknown> = {
    isOnline: true,
    lastUpdated: { $gte: staleThreshold },
    location: {
      $geoWithin: {
        $box: [
          [bounds.southWest.longitude, bounds.southWest.latitude],
          [bounds.northEast.longitude, bounds.northEast.latitude],
        ],
      },
    },
  };

  if (vehicleType) {
    matchConditions.vehicleType = vehicleType;
  }

  const drivers = await DriverLocation.find(matchConditions)
    .populate("user", "name picture")
    .populate("driver", "vehicleType vehicleModel rating");

  return drivers;
};

export const DriverLocationServices = {
  updateDriverLocation,
  getDriverLocation,
  findNearbyDrivers,
  setDriverOnlineStatus,
  removeDriverLocation,
  getOnlineDriversCount,
  getDriversInArea,
};
