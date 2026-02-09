/* eslint-disable @typescript-eslint/no-unused-expressions */
import { rideSearchableFields } from "./ride.constant";
import { IRide, IRideType, RideStatus } from "./ride.interface";
import { Ride, RideType } from "./ride.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../ErrorHelpers/appError";
import httpStatus from "http-status-codes";
import { Driver } from "../driver/driver.model";


// RideType Services
const createRideType = async (payload: IRideType) => {
  const existingRideType = await RideType.findOne({
    rideVehicle: payload.rideVehicle,
    placeType: payload.placeType,
  });

  if (existingRideType) {
    throw new Error(
      "A ride type with this vehicle and place type combination already exists."
    );
  }

  const rideType = await RideType.create(payload);
  return rideType;
};

const getAllRideTypes = async () => {
  const rideTypes = await RideType.find({});
  const totalRideTypes = await RideType.countDocuments();
  return {
    data: rideTypes,
    meta: {
      total: totalRideTypes,
    },
  };
};

const getSingleRideType = async (id: string) => {
  const rideType = await RideType.findById(id);
  return {
    data: rideType,
  };
};

const updateRideType = async (id: string, payload: Partial<IRideType>) => {
  const existingRideType = await RideType.findById(id);
  if (!existingRideType) {
    throw new Error("Ride type not found.");
  }

  const updatedRideType = await RideType.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return updatedRideType;
};

const deleteRideType = async (id: string) => {
  await RideType.findByIdAndDelete(id);
  return null;
};

// Ride Services
const createRide = async (payload: IRide) => {
  const existingRide = await Ride.findOne({ title: payload.title });
  if (existingRide) {
    throw new Error("A ride with this title already exists.");
  }

  const ride = await Ride.create(payload);
  return ride;
};

const getAllRides = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Ride.find()
      .populate("division")
      .populate("district")
      .populate("rideType")
      // .populate("rider")
      .populate("user"), 
    query
  );

  const rides = await queryBuilder
    .search(rideSearchableFields)
    .filter()
    .sort()
    .fields()
    .pagination();

  const [data, meta] = await Promise.all([
    rides.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getRideByUserId = async (userId: string, query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Ride.find({ user: userId })
      .populate("division")
      .populate("district")
      .populate("rideType")
      .populate("user"),
    query
  );

  const rides = await queryBuilder
    .search(rideSearchableFields)
    .filter()
    .sort()
    .fields()
    .pagination();

  const [data, meta] = await Promise.all([
    rides.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };

}

const getDriverRideHistory = async (
  driverUserId: string,
  query: Record<string, string>,
) => {
  const driver = await Driver.findOne({ user: driverUserId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  const queryBuilder = new QueryBuilder(
    Ride.find({
      driver: driver._id,
      status: { $in: [RideStatus.ACCEPTED, RideStatus.COMPLETED, RideStatus.CANCELLED] },
    })
      .populate("division")
      .populate("district")
      .populate("rideType")
      .populate("user", "name phone picture"),
    query,
  );

  const rides = await queryBuilder
    .search(rideSearchableFields)
    .filter()
    .sort()
    .fields()
    .pagination();

  const [data, meta] = await Promise.all([
    rides.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getRidesByDivision = async (divisionId: string) => {
  const rides = await Ride.find({ division: divisionId })
    .populate("division")
    .populate("district")
    .populate("rideType")
    .populate("driver");

  return {
    data: rides,
  };
};

const getRidesByDistrict = async (districtId: string) => {
  const rides = await Ride.find({ district: districtId })
    .populate("division")
    .populate("district")
    .populate("rideType")
    .populate("driver");

  return {
    data: rides,
  };
};

const getRidesByStatus = async (status: string) => {
  const rides = await Ride.find({ status })
    .populate("division")
    .populate("district")
    .populate("rideType")
    .populate("driver");

  return {
    data: rides,
  };
};

const getSingleRide = async (slug: string) => {
  const ride = await Ride.findOne({ slug })
    .populate("division")
    .populate("district")
    .populate("rideType")
    .populate("driver");

  return {
    data: ride,
  };
};

const updateRide = async (id: string, payload: Partial<IRide>) => {
  const existingRide = await Ride.findById(id);
  if (!existingRide) {
    throw new Error("Ride not found.");
  }

  if (payload.title) {
    const duplicateRide = await Ride.findOne({
      title: payload.title,
      _id: { $ne: id },
    });

    if (duplicateRide) {
      throw new Error("A ride with this title already exists.");
    }
  }

  if (payload.images && payload.images.length > 0 && existingRide.images && existingRide.images.length > 0) {
      

    payload.images = [
      ...existingRide.images,
      ...payload.images
    ]
    }

    if(payload.deleteImages && payload.deleteImages.length > 0 && existingRide.images && existingRide.images.length > 0){
        const restDBImages = existingRide.images.filter(imageUrl => {
          !payload.deleteImages?.includes(imageUrl)
        })
        const updatedPayloadImages = (payload.images || [])
            .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
            .filter(imageUrl => !restDBImages.includes(imageUrl))

        payload.images = [...restDBImages, ...updatedPayloadImages]
    }

  const updatedRide = await Ride.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("division")
    .populate("district")
    .populate("rideType")
    .populate("driver");


    if (payload.deleteImages && payload.deleteImages.length > 0 && existingRide.images && existingRide.images.length > 0) {
        await Promise.all(payload.deleteImages.map(url => deleteImageFromCloudinary(url)))
    }

  return updatedRide;
};

const deleteRide = async (id: string) => {
  await Ride.findByIdAndDelete(id);
  return null;
};

const getAvailableRidesForDriver = async (
  driverUserId: string,
  query: Record<string, string>,
) => {
  const driver = await Driver.findOne({ user: driverUserId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  const queryBuilder = new QueryBuilder(
    Ride.find({
      status: RideStatus.ACTIVE,
      $or: [{ driver: { $exists: false } }, { driver: null }],
      declinedDrivers: { $ne: driver._id },
    })
      .populate("division")
      .populate("district")
      .populate("rideType")
      .populate("user", "name phone"),
    query,
  );

  const rides = await queryBuilder
    .search(rideSearchableFields)
    .filter()
    .sort()
    .fields()
    .pagination();

  const [data, meta] = await Promise.all([
    rides.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const acceptRideByDriver = async (driverUserId: string, rideId: string) => {
  const driver = await Driver.findOne({ user: driverUserId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  if (driver.status !== "approved") {
    throw new AppError(httpStatus.FORBIDDEN, "Driver not approved");
  }

  if (!driver.isOnline) {
    throw new AppError(httpStatus.FORBIDDEN, "Driver is offline");
  }

  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  if (ride.status !== RideStatus.ACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride is not available");
  }

  if (ride.driver) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride already assigned");
  }

  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    { driver: driver._id, status: RideStatus.ACCEPTED },
    { new: true },
  )
    .populate("division")
    .populate("district")
    .populate("rideType")
    .populate("user", "name phone")
    .populate("driver");

  return updatedRide;
};

const rejectRideByDriver = async (driverUserId: string, rideId: string) => {
  const driver = await Driver.findOne({ user: driverUserId });
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    { $addToSet: { declinedDrivers: driver._id } },
    { new: true },
  )
    .populate("division")
    .populate("district")
    .populate("rideType")
    .populate("user", "name phone")
    .populate("driver");

  if (!updatedRide) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  return updatedRide;
};

export const RideService = {
  // RideType services
  createRideType,
  getAllRideTypes,
  getSingleRideType,
  updateRideType,
  deleteRideType,

  // Ride services
  createRide,
  getAllRides,
  getRidesByDivision,
  getRidesByDistrict,
  getRidesByStatus,
  getSingleRide,
  updateRide,
  deleteRide,
  getRideByUserId,
  getAvailableRidesForDriver,
  acceptRideByDriver,
  rejectRideByDriver,
  getDriverRideHistory
};
