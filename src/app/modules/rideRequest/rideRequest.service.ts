import AppError from "../../ErrorHelpers/appError";
import httpStatus from "http-status-codes";
import { IRideRequest, RideRequestStatus } from "./rideRequest.interface";
import { RideRequest } from "./rideRequest.model";
import { Driver } from "../driver/driver.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { rideRequestSearchableFields } from "./rideRequest.constant";
import { calculateDistance, calculateFare } from "./rideRequest.utils";

const estimateFare = async (payload: {
  pickupLocation: { coordinates: { latitude: number; longitude: number } };
  dropoffLocation: { coordinates: { latitude: number; longitude: number } };
  vehicleType: "Car" | "Bike";
}) => {
  const { pickupLocation, dropoffLocation, vehicleType } = payload;
  const distance = calculateDistance(
    pickupLocation.coordinates.latitude,
    pickupLocation.coordinates.longitude,
    dropoffLocation.coordinates.latitude,
    dropoffLocation.coordinates.longitude,
  );

  const fare = calculateFare(distance, vehicleType);
  return { distance, fare };
};

const requestRide = async (riderId: string, payload: Partial<IRideRequest>) => {
  const rideRequest = await RideRequest.create({
    ...payload,
    rider: riderId,
    status: RideRequestStatus.REQUESTED,
  });

  return rideRequest;
};

const acceptRide = async (driverId: string, requestId: string) => {
  const driver = await Driver.findOne({ user: driverId });

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile not found");
  }

  // Check if driver is approved
  if (driver.status !== "approved") {
    throw new AppError(httpStatus.FORBIDDEN, "Driver not approved");
  }

  // Check if driver is online
  if (!driver.isOnline) {
    throw new AppError(httpStatus.FORBIDDEN, "Driver is offline");
  }

  // Check if driver has active ride
  const activeRide = await RideRequest.findOne({
    driver: driverId,
    status: {
      $in: [
        RideRequestStatus.ACCEPTED,
        RideRequestStatus.PICKED_UP,
        RideRequestStatus.IN_TRANSIT,
      ],
    },
  });

  if (activeRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver already has an active ride",
    );
  }

  // Check if ride is still available
  const ride = await RideRequest.findById(requestId);
  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride request not found");
  }

  if (ride.status !== RideRequestStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride request is no longer available",
    );
  }

  // Accept the ride
  const updatedRide = await RideRequest.findByIdAndUpdate(
    requestId,
    {
      driver: driverId,
      status: RideRequestStatus.ACCEPTED,
      acceptedAt: new Date(),
    },
    { new: true },
  )
    .populate("rider", "name phone")
    .populate("driver", "name phone");

  return updatedRide;
};

const updateRideStatus = async (
  rideId: string,
  newStatus: RideRequestStatus,
) => {
  const ride = await RideRequest.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride request not found");
  }

  // Define valid transitions
  const validTransitions: Record<RideRequestStatus, RideRequestStatus[]> = {
    [RideRequestStatus.PENDING]: [
      RideRequestStatus.REQUESTED,
      RideRequestStatus.CANCELLED,
    ],
    [RideRequestStatus.REQUESTED]: [
      RideRequestStatus.ACCEPTED,
      RideRequestStatus.CANCELLED,
    ],
    [RideRequestStatus.ACCEPTED]: [
      RideRequestStatus.PICKED_UP,
      RideRequestStatus.CANCELLED,
    ],
    [RideRequestStatus.PICKED_UP]: [
      RideRequestStatus.IN_TRANSIT,
      RideRequestStatus.CANCELLED,
    ],
    [RideRequestStatus.IN_TRANSIT]: [RideRequestStatus.COMPLETED],
    [RideRequestStatus.COMPLETED]: [],
    [RideRequestStatus.CANCELLED]: [],
  };

  if (!validTransitions[ride.status].includes(newStatus)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot transition from ${ride.status} to ${newStatus}`,
    );
  }

  // Update with timestamp
  const updateData: Partial<IRideRequest> = { status: newStatus };
  if (newStatus === RideRequestStatus.PICKED_UP)
    updateData.pickedUpAt = new Date();
  if (newStatus === RideRequestStatus.COMPLETED)
    updateData.completedAt = new Date();

  const updatedRide = await RideRequest.findByIdAndUpdate(rideId, updateData, {
    new: true,
  })
    .populate("rider", "name phone")
    .populate("driver", "name phone");

  // If completed, update driver earnings and stats
  if (newStatus === RideRequestStatus.COMPLETED && ride.driver) {
    await Driver.findOneAndUpdate(
      { user: ride.driver },
      {
        $inc: { totalCompletedRides: 1, earnings: ride.fare },
      },
    );
  }

  return updatedRide;
};

const cancelRide = async (
  rideId: string,
  userId: string,
  userRole: string,
  reason?: string,
) => {
  const ride = await RideRequest.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride request not found");
  }

  // Check cancellation window
  if (ride.status === RideRequestStatus.IN_TRANSIT) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel ride in transit");
  }

  if (ride.status === RideRequestStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel completed ride");
  }

  if (ride.status === RideRequestStatus.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride already cancelled");
  }

  // Check who can cancel
  const isRider = ride.rider.toString() === userId;
  const isDriver = ride.driver?.toString() === userId;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole);

  if (!isRider && !isDriver && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Not authorized to cancel this ride",
    );
  }

  // Track cancellation
  const cancelledBy = isRider ? "rider" : isDriver ? "driver" : "admin";

  const updatedRide = await RideRequest.findByIdAndUpdate(
    rideId,
    {
      status: RideRequestStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledBy,
      cancellationReason: reason,
    },
    { new: true },
  )
    .populate("rider", "name phone")
    .populate("driver", "name phone");

  return updatedRide;
};

const getRiderHistory = async (
  riderId: string,
  query: Record<string, string>,
) => {
  const queryBuilder = new QueryBuilder(
    RideRequest.find({ rider: riderId }).populate(
      "driver",
      "name phone rating",
    ),
    query,
  );

  const result = queryBuilder.filter().sort().fields().pagination();

  const [data, meta] = await Promise.all([
    result.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getDriverRides = async (
  driverId: string,
  query: Record<string, string>,
) => {
  const queryBuilder = new QueryBuilder(
    RideRequest.find({ driver: driverId }).populate("rider", "name phone"),
    query,
  );

  const result = queryBuilder.filter().sort().fields().pagination();

  const [data, meta] = await Promise.all([
    result.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getAllRideRequests = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    RideRequest.find()
      .populate("rider", "name phone email")
      .populate("driver", "name email phone role")  // driver directly refs User now
      .populate("user", "name phone email"),
    query,
  );

  const result = queryBuilder
    .search(rideRequestSearchableFields)
    .filter()
    .sort()
    .fields()
    .pagination();

  const [data, meta] = await Promise.all([
    result.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleRideRequest = async (id: string) => {
  const result = await RideRequest.findById(id)
    .populate("rider", "name phone email")
    .populate("driver", "name email phone role")  // driver directly refs User
    .populate("user", "name email phone");
  return result;
};

const getAvailableRides = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    RideRequest.find().populate(
      "rider",
      "name phone rating",
      "user"
    ),
    query,
  );

  const result = queryBuilder.filter().sort().fields().pagination();
  console.log(queryBuilder, "riderequest service ")
  const [data, meta] = await Promise.all([
    result.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getUserActiveRideRequests = async (userId: string) => {
  const activeRideRequests = await RideRequest.find({
    user: userId,
    status: {
      $in: [
        RideRequestStatus.REQUESTED,
        RideRequestStatus.ACCEPTED,
        RideRequestStatus.PICKED_UP,
        RideRequestStatus.IN_TRANSIT,
      ],
    },
  })
    .populate("rider", "name email phone picture")
    .populate("driver", "name email phone picture")
    .sort({ createdAt: -1 });

  return activeRideRequests;
};

const assignDriver = async (requestId: string, driverId: string) => {
  console.log("[assignDriver] Starting assignment - rideId:", requestId, "driverId (User ID):", driverId);
  
  // driverId is actually a User ID from the frontend, find Driver by user field
  const driver = await Driver.findOne({ user: driverId }).populate("user");
  console.log("[assignDriver] Driver found:", driver ? "yes" : "no");
  console.log("[assignDriver] Driver data:", driver);

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (!driver.user) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver user not found");
  }

  if (driver.status !== "approved") {
    throw new AppError(httpStatus.FORBIDDEN, "Driver is not approved");
  }

  const rideRequest = await RideRequest.findById(requestId);
  console.log("[assignDriver] Ride found:", rideRequest ? "yes" : "no");

  if (!rideRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride request not found");
  }

  if (
    rideRequest.status !== RideRequestStatus.REQUESTED &&
    rideRequest.status !== RideRequestStatus.ACCEPTED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot assign driver to ride in current status"
    );
  }

  console.log("[assignDriver] Setting driver field to User ID:", driverId);

  const updatedRideRequest = await RideRequest.findByIdAndUpdate(
    requestId,
    {
      driver: driverId,  // ✅ Store User ID directly (driverId is already a User ID)
      status: RideRequestStatus.ACCEPTED,
      acceptedAt: new Date(),
    },
    { new: true }
  )
    .populate("driver", "name email phone")
    .populate("rider", "name email phone");

  console.log("[assignDriver] Updated ride with driver:", JSON.stringify(updatedRideRequest, null, 2));
  return updatedRideRequest;
};

export const RideRequestServices = {
  requestRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getRiderHistory,
  getDriverRides,
  getAllRideRequests,
  getSingleRideRequest,
  getAvailableRides,
  getUserActiveRideRequests,
  estimateFare,
  assignDriver,
};
