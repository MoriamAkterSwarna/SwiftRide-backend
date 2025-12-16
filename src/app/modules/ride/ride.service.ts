/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { excludeField } from "../../utils/constant";
import { rideSearchableFields } from "./ride.constant";
import { IRide, IRideType } from "./ride.interface";
import { Ride, RideType } from "./ride.model";

// RideType Services
const createRideType = async (payload: IRideType) => {
    const existingRideType = await RideType.findOne({ 
        rideVehicle: payload.rideVehicle,
        placeType: payload.placeType 
    });
    
    if (existingRideType) {
        throw new Error("A ride type with this vehicle and place type combination already exists.");
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
            total: totalRideTypes
        }
    }
};

const getSingleRideType = async (id: string) => {
    const rideType = await RideType.findById(id);
    return {
        data: rideType,
    }
};

const updateRideType = async (id: string, payload: Partial<IRideType>) => {
    const existingRideType = await RideType.findById(id);
    if (!existingRideType) {
        throw new Error("Ride type not found.");
    }

    const updatedRideType = await RideType.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
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

const getAllRides = async (query: Record<string, unknown>) => {
    const queryObj: Record<string, unknown> = {};

    // filter by district
    if (query.district) {
        queryObj.district = query.district;
    }

    // const rides = await Ride.find(queryObj)

    const searchTerm = query.searchTerm as string  || "";

    const sortData = query.sortData as string || "createdAt";

    const fields = (query.fields as string )?.split(",").join(" ") || "";
    console.log(fields);

    // delete queryObj["searchTerm"];
    // delete queryObj["sortData"];

    // const rideSearchableFields = ['title', 'description', 'pickupLocation'];
   
    // const searchArray = rideSearchableFields.map(field => ({
    //     [field]: {$regex: searchTerm, $options: 'i' }
    // }))

    // const excludeField = ['searchTerm', 'sortData']; 

    for(const key of excludeField){
        delete queryObj[key];
    }

    const searchQuery = {
        $or: rideSearchableFields.map(field => ({
            [field]: {$regex: searchTerm, $options: 'i' }
        }))
    }
    const rides = await Ride.find(
        // { title: {$regex: searchTerm , $options: 'i' } }
        // { $or: [
        //     { title: { $regex: searchTerm, $options: 'i' } },
        //     { description: { $regex: searchTerm, $options: 'i' } },
        // ]}
    
        // {$or: searchArray}  
        searchQuery
    ).find(queryObj).sort(sortData).select(fields)
        
    
    const totalRides = await Ride.countDocuments(queryObj).sort({ [sortData]: -1 })
    return {
        data: rides,
        meta: {
            total: totalRides
        }
    }
};

const getRidesByDivision = async (divisionId: string) => {
    const rides = await Ride.find({ division: divisionId })
        .populate('division')
        .populate('district')
        .populate('rideType')
        .populate('driver');
    
    return {
        data: rides,
    }
};

const getRidesByDistrict = async (districtId: string) => {
    const rides = await Ride.find({ district: districtId })
        .populate('division')
        .populate('district')
        .populate('rideType')
        .populate('driver');
    
    return {
        data: rides,
    }
};

const getRidesByStatus = async (status: string) => {
    const rides = await Ride.find({ status })
        .populate('division')
        .populate('district')
        .populate('rideType')
        .populate('driver');
    
    return {
        data: rides,
    }
};

const getSingleRide = async (slug: string) => {
    const ride = await Ride.findOne({ slug })
        .populate('division')
        .populate('district')
        .populate('rideType')
        .populate('driver');
    
    return {
        data: ride,
    }
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

    const updatedRide = await Ride.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
        .populate('division')
        .populate('district')
        .populate('rideType')
        .populate('driver');

    return updatedRide;
};

const deleteRide = async (id: string) => {
    await Ride.findByIdAndDelete(id);
    return null;
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
};
