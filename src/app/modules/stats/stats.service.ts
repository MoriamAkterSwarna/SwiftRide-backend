import { Booking } from "../booking/booking.model";
import { PaymentStatus } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { RideStatus } from "../ride/ride.interface";
import { Ride } from "../ride/ride.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const ninetyDaysAgo = new Date(now).setDate(now.getDate() - 90);
const oneYearAgo = new Date(now).setDate(now.getDate() - 365);

const getUserStats = async () => {

   const totalUsersPromise = User.countDocuments();
    const totalActiveUsersPromise = User.countDocuments({ isActive: IsActive.ACTIVE })
    const totalInactiveUsersPromise = User.countDocuments({ isActive: IsActive.INACTIVE })
    const totalBlockedUsersPromise = User.countDocuments({isActive: IsActive.BLOCKED})


    const newUserInLast7DaysPromise = User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const newUserInLast30DaysPromise = User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    const newUserInLast90DaysPromise = User.countDocuments({ createdAt: { $gte: ninetyDaysAgo } })
    const newUserInLastYearPromise = User.countDocuments({ createdAt: { $gte: oneYearAgo } })


    const usersByRolePromise = User.aggregate([

        // Stage 1: Group users by role and count total users in each role
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
    ])

  const [
    totalUsers,
    totalActiveUsers,
    totalInactiveUsers,
    totalBlockedUsers,
    newUserInLast7Days,
    newUserInLast30Days,
    newUserInLast90Days,
    newUserInLastYear,
    usersByRole,
  ] = await Promise.all([
    totalUsersPromise,
    totalActiveUsersPromise,
    totalInactiveUsersPromise,
    totalBlockedUsersPromise,
    newUserInLast7DaysPromise,
    newUserInLast30DaysPromise,
    newUserInLast90DaysPromise,
    newUserInLastYearPromise,
    usersByRolePromise,
  ]);
  return {
    totalUsers,
    totalActiveUsers,
    totalInactiveUsers,
    totalBlockedUsers,
    newUserInLast7Days,
    newUserInLast30Days,
    newUserInLast90Days,
    newUserInLastYear,
    usersByRole,
  };
};
const getBookingStats = async () => {


    const totalBookingPromise = Booking.countDocuments();

    const totalBookingByStatusPromise = Booking.aggregate([

        // Stage 1: Group bookings by status and count total bookings in each status
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
        
    ])

    const bookingPerRidePromise = Booking.aggregate([

        // Stage 1: Group bookings by ride and count total bookings in each ride
        {
            $group: {
                _id: "$ride",
                bookingCount: { $sum: 1 },
            },
        },
        // stage 2 : sort the array by bookingCount in descending order
        {
            $sort: { bookingCount: -1 },
        }, 

        // stage 3 : limit the array to top 10
        {
            $limit: 10,
        }, 

        // stage 4 : lookup the ride name
        {
            $lookup: {
                from: "rides",
                localField: "_id",
                foreignField: "_id",
                as: "ride",
            },
        },
        // stage 5 : unwind the array to object
        {
            $unwind: "$ride",
        },
        // stage 6 : project the ride name
        {
            $project: {
                rideName: "$ride.title",
                bookingCount: 1,
            },
        },
        
    ])

    const avgGuestPerBookingPromise = Booking.aggregate([
        // Stage 1: group the guestCount from, do sum and average 
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: "$guestCount" },
            },
        },
    ])

    const bookingLast7DaysPromise = Booking.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const bookingLast30DaysPromise = Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    const bookingLast90DaysPromise = Booking.countDocuments({ createdAt: { $gte: ninetyDaysAgo } })
    const bookingLastYearPromise = Booking.countDocuments({ createdAt: { $gte: oneYearAgo } }) 


    const totalBookingByUniqueUserPromise = Booking.distinct("user").then((users) => users.length)

    const [totalBooking, totalBookingByStatus, bookingPerRide, avgGuestPerBooking, bookingLast7Days, bookingLast30Days, bookingLast90Days, bookingLastYear, totalBookingByUniqueUser] = await Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingPerRidePromise,
        avgGuestPerBookingPromise,
        bookingLast7DaysPromise,
        bookingLast30DaysPromise,
        bookingLast90DaysPromise,
        bookingLastYearPromise,
        totalBookingByUniqueUserPromise,
        ])

    return {
        totalBooking,
        totalBookingByStatus,
        bookingPerRide,
        avgGuestPerBooking,
        bookingLast7Days,
        bookingLast30Days,
        bookingLast90Days,
        bookingLastYear,
        totalBookingByUniqueUser,
    }
};

const getPaymentStats = async () => {

    const totalPaymentPromise = Payment.countDocuments();

    const totalPaymentByStatusPromise = Payment.aggregate([
        // stage 1: group the payment status and count the total payments
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ])

    const totalRevenuePromise = Payment.aggregate([
        // stage 1: match the payment status
        {
            $match: {
                status: PaymentStatus.Paid,
            },
        },
        // stage 2: group the payment status and count the total payments
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
            },
        },
    ])

    const avgPaymentAmountPromise = Payment.aggregate([
        // stage 1: group the payment status and count the total payments
        {
            $group: {
                _id: null,
                avgPaymentAmount: { $avg: "$amount" },
            },
        },
    ])

    const paymentGatewayDataPromise = Payment.aggregate([
        // stage 1: group the payment status and count the total payments
        {
            $group: {
                _id: {$ifNull: ["$paymentGatewayData.status", "UNKNOWN"]},
                count: { $sum: 1 },
            },
        },
    ])
   

    

    const [totalPayment, totalRevenue, totalPaymentByStatus, avgPaymentAmount, paymentGatewayData] = await Promise.all([
        totalPaymentPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise,
        ])

    return {
        totalPayment,
        totalPaymentByStatus,
        totalRevenue,
        avgPaymentAmount,
        paymentGatewayData,
    }
};

const getRideStats = async () => {

    const totalRidesPromise = Ride.countDocuments();
    const totalActiveRidesPromise = Ride.countDocuments({rideStatus: RideStatus.ACTIVE})
    const totalCancelledRidesPromise = Ride.countDocuments({rideStatus: RideStatus.CANCELLED})
    const totalCompletedRidesPromise = Ride.countDocuments({rideStatus: RideStatus.COMPLETED})

    const newRidesInLast7DaysPromise = Ride.countDocuments({createdAt: { $gte: sevenDaysAgo }})
    const newRidesInLast30DaysPromise = Ride.countDocuments({createdAt: { $gte: thirtyDaysAgo }})
    const newRidesInLast90DaysPromise = Ride.countDocuments({createdAt: { $gte: ninetyDaysAgo }})
    const newRidesInLastYearPromise = Ride.countDocuments({createdAt: { $gte: oneYearAgo }})

    const ridesByVehiclePromise = Ride.aggregate([

        // Stage 1: Lookup rideType 
        {
            $lookup: {
                from: "rides",
                localField: "rideType",
                foreignField: "_id",
                as: "type",
            },
        }, 
        // Stage 2: unwind the array to object 
        {
            $unwind: "$type",
        },
        // Stage 3: group by rideType and count 
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
            },
        },
    ])

    const avgRideCostPromise = Ride.aggregate([
        // Stage 1: group the cost from, do sum and average 
        {
            $group: {
                _id: null,
                avgCost: { $avg: "$cost" },
            },
        },
    ])

    const rideTypeByDivisionPromise = Ride.aggregate([
        // Stage 1: Lookup rideType 
        {
            $lookup: {
                from: "divisions",
                localField: "division",
                foreignField: "_id",
                as: "divisionName",
            },
        }, 
        // Stage 2: unwind the array to object 
        {
            $unwind: "$divisionName",
        },
        // Stage 3: group by rideType and count 
        {
            $group: {
                _id: "$divisionName",
                count: { $sum: 1 },
            },
        },
    ])

    const rideTypeByDistrictPromise = Ride.aggregate([
        // Stage 1: Lookup rideType 
        {
            $lookup: {
                from: "districts",
                localField: "district",
                foreignField: "_id",
                as: "districtName",
            },
        }, 
        // Stage 2: unwind the array to object 
        {
            $unwind: "$districtName",
        },
        // Stage 3: group by rideType and count 
        {
            $group: {
                _id: "$districtName",
                count: { $sum: 1 },
            },
        },
    ])

    const totalHighestBookedRidePromise = Booking.aggregate([
        // Stage 1: group the cost from, do sum and average 
        {
            $group: {
                _id: "$ride",
                bookingCount: { $sum: 1 },
            },
        },
        // Stage 2: sort by bookingCount in descending order 
        {
            $sort: { bookingCount: -1 },
        },
        // Stage 3: limit to 1 
        {
            $limit: 5,
        },

        // Stage 4 : lookup stage 

        {
            $lookup : {
                from: "rides",
                let : {rideId : "$_id"},
                pipeline:[
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$rideId"],
                            },
                        },
                    },
                ] ,
                as : "rideDetails"
            }
        }
        ,
        // Stage 5 : unwind stage 

        {
            $unwind: "$rideDetails",
        },

        // Stage 6 : project stage 

        {
            $project: {
                _id: 1,
                bookingCount: 1,
                "rideDetails.title": 1,
                "rideDetails.vehicle": 1,
                "rideDetails.slug": 1,
            },
        }
    ])

    const [
        totalRides,
        totalActiveRides,
        totalCancelledRides,
        totalCompletedRides,
        newRidesInLast7Days,
        newRidesInLast30Days,
        newRidesInLast90Days,
        newRidesInLastYear,
        ridesByVehicle,
        avgRideCost,
        rideTypeByDivision,
        rideTypeByDistrict,
        highestBookedRides,

    ] = await Promise.all([
        totalRidesPromise,
        totalActiveRidesPromise,
        totalCancelledRidesPromise,
        totalCompletedRidesPromise,
        newRidesInLast7DaysPromise,
        newRidesInLast30DaysPromise,
        newRidesInLast90DaysPromise,
        newRidesInLastYearPromise,
        ridesByVehiclePromise,
        avgRideCostPromise,
        rideTypeByDivisionPromise,
        rideTypeByDistrictPromise,
        totalHighestBookedRidePromise,
    ])

    return {
        totalRides,
        totalActiveRides,
        totalCancelledRides,
        totalCompletedRides,
        newRidesInLast7Days,
        newRidesInLast30Days,
        newRidesInLast90Days,
        newRidesInLastYear,
        ridesByVehicle,
        avgRideCost,
        rideTypeByDivision,
        rideTypeByDistrict,
        highestBookedRides,
    }

}; 

export const StatsService = {
  getBookingStats,
  getPaymentStats,
  getUserStats,
  getRideStats,
};
