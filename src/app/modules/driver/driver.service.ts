/* eslint-disable @typescript-eslint/no-unused-vars */
import { QueryBuilder } from "../../utils/QueryBuilder";
import { RideRequest } from "../rideRequest/rideRequest.model";
import { RideRequestStatus } from "../rideRequest/rideRequest.interface";
import { driverSearchableFields } from "./driver.constant";
import { IDriver } from "./driver.interface";
import { Driver } from "./driver.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";

const createDriverIntoDB = async (payload: IDriver) => {
  console.log(payload)
  const result = await Driver.create(payload);
  console.log(result)
  return result;
};

const getAllDriversFromDB = async (query: Record<string, unknown>) => {
  const driverQuery = new QueryBuilder(
    Driver.find().populate("user"),
    query as Record<string, string>,
  )
    .search(driverSearchableFields)
    .filter()
    .sort()
    .pagination()
    .fields();

  const [data, meta] = await Promise.all([
    driverQuery.build(),
    driverQuery.getMeta(),
  ]);

  console.log(data)

  return {
    meta,
    data,
  };
};

const getSingleDriverFromDB = async (id: string) => {
  const result = await Driver.findById(id).populate("user");
  return result;
};

const updateDriverIntoDB = async (id: string, payload: Partial<IDriver>) => {
  const result = await Driver.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteDriverFromDB = async (id: string) => {
  const result = await Driver.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  return result;
};

const toggleDriverAvailability = async (userId: string) => {
  const driver = await Driver.findOne({ user: userId });
  if (!driver) {
    throw new Error("Driver not found");
  }

  const result = await Driver.findByIdAndUpdate(
    driver._id,
    { isOnline: !driver.isOnline },
    { new: true },
  );
  return result;
};

const changeDriverStatus = async (
  id: string,
  status: "approved" | "rejected",
) => {
  const driver = await Driver.findById(id);
  if (!driver) {
    throw new Error("Driver not found");
  }

  // Update driver status
  const result = await Driver.findByIdAndUpdate(
    id, 
    { status, isVerified: status === "approved" }, 
    { new: true }
  ).populate("user", "name email phone");

  // If approved, update user role to DRIVER
  if (status === "approved") {
    await User.findByIdAndUpdate(driver.user, { role: Role.DRIVER });
  }

  return result;
};

// Suspend a driver (Admin only)
const suspendDriver = async (id: string, reason?: string) => {
  const driver = await Driver.findById(id);
  if (!driver) {
    throw new Error("Driver not found");
  }

  const result = await Driver.findByIdAndUpdate(
    id,
    { 
      status: "suspended",
      isOnline: false,
    },
    { new: true }
  ).populate("user", "name email phone");

  return result;
};

// Unsuspend/Reactivate a driver
const reactivateDriver = async (id: string) => {
  const result = await Driver.findByIdAndUpdate(
    id,
    { status: "approved" },
    { new: true }
  ).populate("user", "name email phone");

  return result;
};

// Get driver earnings history
const getDriverEarningsHistory = async (
  userId: string,
  query: Record<string, string>
) => {
  const driver = await Driver.findOne({ user: userId });
  if (!driver) {
    throw new Error("Driver not found");
  }

  // Get completed rides with earnings
  const completedRides = await RideRequest.find({
    driver: driver._id,
    status: RideRequestStatus.COMPLETED,
  })
    .select("fare pickupLocation dropoffLocation completedAt createdAt")
    .sort({ completedAt: -1 });

  // Calculate earnings summary
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const todayEarnings = completedRides
    .filter(ride => ride.completedAt && ride.completedAt >= today)
    .reduce((sum, ride) => sum + (ride.fare || 0), 0);

  const thisWeekEarnings = completedRides
    .filter(ride => ride.completedAt && ride.completedAt >= thisWeekStart)
    .reduce((sum, ride) => sum + (ride.fare || 0), 0);

  const thisMonthEarnings = completedRides
    .filter(ride => ride.completedAt && ride.completedAt >= thisMonthStart)
    .reduce((sum, ride) => sum + (ride.fare || 0), 0);

  return {
    totalEarnings: driver.earnings,
    todayEarnings,
    thisWeekEarnings,
    thisMonthEarnings,
    totalCompletedRides: driver.totalCompletedRides,
    recentRides: completedRides.slice(0, 20),
  };
};

// Get driver profile by user ID
const getDriverByUserId = async (userId: string) => {
  const result = await Driver.findOne({ user: userId }).populate("user", "name email phone picture");
  return result;
};

export const DriverServices = {
  createDriverIntoDB,
  getAllDriversFromDB,
  getSingleDriverFromDB,
  updateDriverIntoDB,
  deleteDriverFromDB,
  toggleDriverAvailability,
  changeDriverStatus,
  suspendDriver,
  reactivateDriver,
  getDriverEarningsHistory,
  getDriverByUserId,
};
