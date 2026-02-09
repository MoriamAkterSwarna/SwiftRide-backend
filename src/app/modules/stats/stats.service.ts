import { Booking } from "../booking/booking.model";
import { PaymentStatus } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { RideStatus } from "../ride/ride.interface";
import { Ride } from "../ride/ride.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";
import { Driver } from "../driver/driver.model";
import { Review } from "../review/review.model";
import { ReviewType } from "../review/review.interface";
import { RideRequest } from "../rideRequest/rideRequest.model";
import { RideRequestStatus } from "../rideRequest/rideRequest.interface";

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
      // stage 1: group by payment method and count the total payments
      {
        $group: {
          _id: { $ifNull: ["$paymentGatewayData.method", "UNKNOWN"] },
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

// Driver Statistics
const getDriverStats = async () => {
  const totalDriversPromise = Driver.countDocuments();
  const activeDriversPromise = Driver.countDocuments({ isActive: true, status: "approved" });
  const onlineDriversPromise = Driver.countDocuments({ isOnline: true });
  const pendingDriversPromise = Driver.countDocuments({ status: "pending" });
  const approvedDriversPromise = Driver.countDocuments({ status: "approved" });
  const rejectedDriversPromise = Driver.countDocuments({ status: "rejected" });
  const suspendedDriversPromise = Driver.countDocuments({ status: "suspended" });

  // Driver by vehicle type
  const driversByVehicleTypePromise = Driver.aggregate([
    {
      $group: {
        _id: "$vehicleType",
        count: { $sum: 1 },
      },
    },
  ]);

  // Top rated drivers
  const topRatedDriversPromise = Driver.find({ status: "approved" })
    .sort({ rating: -1, totalCompletedRides: -1 })
    .limit(10)
    .populate("user", "name email picture");

  // Drivers by completed rides
  const driversByCompletedRidesPromise = Driver.aggregate([
    {
      $match: { status: "approved" },
    },
    {
      $bucket: {
        groupBy: "$totalCompletedRides",
        boundaries: [0, 10, 50, 100, 500, 1000],
        default: "1000+",
        output: {
          count: { $sum: 1 },
        },
      },
    },
  ]);

  // Average driver rating
  const avgDriverRatingPromise = Driver.aggregate([
    {
      $match: { status: "approved" },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // Total earnings
  const totalDriverEarningsPromise = Driver.aggregate([
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$earnings" },
      },
    },
  ]);

  // New drivers in time periods
  const newDriversLast7DaysPromise = Driver.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newDriversLast30DaysPromise = Driver.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  const [
    totalDrivers,
    activeDrivers,
    onlineDrivers,
    pendingDrivers,
    approvedDrivers,
    rejectedDrivers,
    suspendedDrivers,
    driversByVehicleType,
    topRatedDrivers,
    driversByCompletedRides,
    avgDriverRating,
    totalDriverEarnings,
    newDriversLast7Days,
    newDriversLast30Days,
  ] = await Promise.all([
    totalDriversPromise,
    activeDriversPromise,
    onlineDriversPromise,
    pendingDriversPromise,
    approvedDriversPromise,
    rejectedDriversPromise,
    suspendedDriversPromise,
    driversByVehicleTypePromise,
    topRatedDriversPromise,
    driversByCompletedRidesPromise,
    avgDriverRatingPromise,
    totalDriverEarningsPromise,
    newDriversLast7DaysPromise,
    newDriversLast30DaysPromise,
  ]);

  return {
    totalDrivers,
    activeDrivers,
    onlineDrivers,
    pendingDrivers,
    approvedDrivers,
    rejectedDrivers,
    suspendedDrivers,
    driversByVehicleType,
    topRatedDrivers,
    driversByCompletedRides,
    avgDriverRating: avgDriverRating[0]?.avgRating || 0,
    totalDriverEarnings: totalDriverEarnings[0]?.totalEarnings || 0,
    newDriversLast7Days,
    newDriversLast30Days,
  };
};

// Review Statistics
const getReviewStats = async () => {
  const totalReviewsPromise = Review.countDocuments();
  const driverReviewsCountPromise = Review.countDocuments({ reviewType: ReviewType.DRIVER_REVIEW });
  const riderReviewsCountPromise = Review.countDocuments({ reviewType: ReviewType.RIDER_REVIEW });

  // Rating distribution
  const ratingDistributionPromise = Review.aggregate([
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Average ratings by type
  const avgRatingByTypePromise = Review.aggregate([
    {
      $group: {
        _id: "$reviewType",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Most common tags
  const mostCommonTagsPromise = Review.aggregate([
    {
      $unwind: "$tags",
    },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  // Reviews trend (last 30 days)
  const reviewsTrendPromise = Review.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(thirtyDaysAgo) },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const [
    totalReviews,
    driverReviewsCount,
    riderReviewsCount,
    ratingDistribution,
    avgRatingByType,
    mostCommonTags,
    reviewsTrend,
  ] = await Promise.all([
    totalReviewsPromise,
    driverReviewsCountPromise,
    riderReviewsCountPromise,
    ratingDistributionPromise,
    avgRatingByTypePromise,
    mostCommonTagsPromise,
    reviewsTrendPromise,
  ]);

  return {
    totalReviews,
    driverReviewsCount,
    riderReviewsCount,
    ratingDistribution,
    avgRatingByType,
    mostCommonTags,
    reviewsTrend,
  };
};

// Ride Request Statistics
const getRideRequestStats = async () => {
  const totalRideRequestsPromise = RideRequest.countDocuments();
  
  // Status breakdown
  const requestsByStatusPromise = RideRequest.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // By vehicle type
  const requestsByVehiclePromise = RideRequest.aggregate([
    {
      $group: {
        _id: "$vehicleType",
        count: { $sum: 1 },
        totalFare: { $sum: "$fare" },
        avgFare: { $avg: "$fare" },
      },
    },
  ]);

  // Completion rate
  const completedRequestsPromise = RideRequest.countDocuments({ status: RideRequestStatus.COMPLETED });
  const cancelledRequestsPromise = RideRequest.countDocuments({ status: RideRequestStatus.CANCELLED });

  // Cancellation reasons
  const cancellationReasonsPromise = RideRequest.aggregate([
    {
      $match: { status: RideRequestStatus.CANCELLED },
    },
    {
      $group: {
        _id: "$cancelledBy",
        count: { $sum: 1 },
      },
    },
  ]);

  // Average response time (time between requested and accepted)
  const avgResponseTimePromise = RideRequest.aggregate([
    {
      $match: {
        acceptedAt: { $exists: true },
      },
    },
    {
      $project: {
        responseTime: {
          $subtract: ["$acceptedAt", "$requestedAt"],
        },
      },
    },
    {
      $group: {
        _id: null,
        avgResponseTime: { $avg: "$responseTime" },
      },
    },
  ]);

  // Requests trend (last 30 days)
  const requestsTrendPromise = RideRequest.aggregate([
    {
      $match: {
        requestedAt: { $gte: new Date(thirtyDaysAgo) },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$requestedAt" },
        },
        count: { $sum: 1 },
        totalFare: { $sum: "$fare" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Peak hours analysis
  const peakHoursPromise = RideRequest.aggregate([
    {
      $project: {
        hour: { $hour: "$requestedAt" },
      },
    },
    {
      $group: {
        _id: "$hour",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const [
    totalRideRequests,
    requestsByStatus,
    requestsByVehicle,
    completedRequests,
    cancelledRequests,
    cancellationReasons,
    avgResponseTime,
    requestsTrend,
    peakHours,
  ] = await Promise.all([
    totalRideRequestsPromise,
    requestsByStatusPromise,
    requestsByVehiclePromise,
    completedRequestsPromise,
    cancelledRequestsPromise,
    cancellationReasonsPromise,
    avgResponseTimePromise,
    requestsTrendPromise,
    peakHoursPromise,
  ]);

  const completionRate = totalRideRequests > 0 
    ? Math.round((completedRequests / totalRideRequests) * 100 * 100) / 100 
    : 0;
  
  const cancellationRate = totalRideRequests > 0 
    ? Math.round((cancelledRequests / totalRideRequests) * 100 * 100) / 100 
    : 0;

  return {
    totalRideRequests,
    requestsByStatus,
    requestsByVehicle,
    completedRequests,
    cancelledRequests,
    completionRate,
    cancellationRate,
    cancellationReasons,
    avgResponseTimeMs: avgResponseTime[0]?.avgResponseTime || 0,
    requestsTrend,
    peakHours,
  };
};

// Comprehensive Dashboard Analytics
const getDashboardOverview = async () => {
  // Quick stats
  const totalUsersPromise = User.countDocuments();
  const totalDriversPromise = Driver.countDocuments({ status: "approved" });
  const onlineDriversPromise = Driver.countDocuments({ isOnline: true });
  const totalRidesPromise = Ride.countDocuments();
  const totalBookingsPromise = Booking.countDocuments();
  const completedRideRequestsPromise = RideRequest.countDocuments({ status: RideRequestStatus.COMPLETED });

  // Revenue
  const totalRevenuePromise = Payment.aggregate([
    {
      $match: { status: PaymentStatus.Paid },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayBookingsPromise = Booking.countDocuments({ createdAt: { $gte: today } });
  const todayRideRequestsPromise = RideRequest.countDocuments({ requestedAt: { $gte: today } });
  const todayRevenuePromise = Payment.aggregate([
    {
      $match: { 
        status: PaymentStatus.Paid,
        createdAt: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  // Active ride requests
  const activeRideRequestsPromise = RideRequest.countDocuments({
    status: { $in: [RideRequestStatus.REQUESTED, RideRequestStatus.ACCEPTED, RideRequestStatus.PICKED_UP, RideRequestStatus.IN_TRANSIT] },
  });

  // Average rating
  const avgDriverRatingPromise = Driver.aggregate([
    {
      $match: { status: "approved" },
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  const [
    totalUsers,
    totalDrivers,
    onlineDrivers,
    totalRides,
    totalBookings,
    completedRideRequests,
    totalRevenue,
    todayBookings,
    todayRideRequests,
    todayRevenue,
    activeRideRequests,
    avgDriverRating,
  ] = await Promise.all([
    totalUsersPromise,
    totalDriversPromise,
    onlineDriversPromise,
    totalRidesPromise,
    totalBookingsPromise,
    completedRideRequestsPromise,
    totalRevenuePromise,
    todayBookingsPromise,
    todayRideRequestsPromise,
    todayRevenuePromise,
    activeRideRequestsPromise,
    avgDriverRatingPromise,
  ]);

  return {
    overview: {
      totalUsers,
      totalDrivers,
      onlineDrivers,
      totalRides,
      totalBookings,
      completedRideRequests,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeRideRequests,
      avgDriverRating: Math.round((avgDriverRating[0]?.avgRating || 0) * 10) / 10,
    },
    today: {
      bookings: todayBookings,
      rideRequests: todayRideRequests,
      revenue: todayRevenue[0]?.total || 0,
    },
  };
};

// Revenue Analytics
const getRevenueAnalytics = async (period: "daily" | "weekly" | "monthly" = "daily") => {
  let dateFormat: string;
  let daysAgo: number;

  switch (period) {
    case "weekly":
      dateFormat = "%Y-W%V";
      daysAgo = 90;
      break;
    case "monthly":
      dateFormat = "%Y-%m";
      daysAgo = 365;
      break;
    default:
      dateFormat = "%Y-%m-%d";
      daysAgo = 30;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const revenueTrend = await Payment.aggregate([
    {
      $match: {
        status: PaymentStatus.Paid,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        },
        revenue: { $sum: "$amount" },
        transactions: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return revenueTrend;
};

export const StatsService = {
  getBookingStats,
  getPaymentStats,
  getUserStats,
  getRideStats,
  getDriverStats,
  getReviewStats,
  getRideRequestStats,
  getDashboardOverview,
  getRevenueAnalytics,
};
