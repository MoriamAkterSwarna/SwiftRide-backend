/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { excludeField } from "../../utils/constant";
import { districtSearchableFields } from "./district.constant";
import { IDistrict } from "./district.interface";
import { District } from "./district.model";

const createDistrict = async (payload: IDistrict) => {

    const existingDistrict = await District.findOne({ name: payload.name });
    if (existingDistrict) {
        throw new Error("A district with this name already exists.");
    }

    const district = await District.create(payload);

    return district
};

const getAllDistricts = async (query: Record<string, unknown>) => {
    const queryObj: Record<string, unknown> = {};

    const searchTerm = query.searchTerm as string || "";
    const sortData = query.sortData as string || "createdAt";

    for (const key of excludeField) {
        delete queryObj[key];
    }

    const searchQuery = {
        $or: districtSearchableFields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
        }))
    }

    const districts = await District.find(searchQuery).find(queryObj).sort(sortData).populate('division');
    const totalDistricts = await District.countDocuments(searchQuery);
    return {
        data: districts,
        meta: {
            total: totalDistricts
        }
    }
};

const getDistrictsByDivision = async (divisionId: string) => {
    const districts = await District.find({ division: divisionId }).populate('division');
    return {
        data: districts,
    }
};

const getSingleDistrict = async (slug: string) => {
    const district = await District.findOne({ slug }).populate('division');
    return {
        data: district,
    }
};

const updateDistrict = async (id: string, payload: Partial<IDistrict>) => {

    const existingDistrict = await District.findById(id);
    if (!existingDistrict) {
        throw new Error("District not found.");
    }

    const duplicateDistrict = await District.findOne({
        name: payload.name,
        _id: { $ne: id },
    });

    if (duplicateDistrict) {
        throw new Error("A district with this name already exists.");
    }

    const updatedDistrict = await District.findByIdAndUpdate(id, payload, { new: true, runValidators: true })

    return updatedDistrict

};

const deleteDistrict = async (id: string) => {
    await District.findByIdAndDelete(id);
    return null;
};

export const DistrictService = {
    createDistrict,
    getAllDistricts,
    getDistrictsByDivision,
    getSingleDistrict,
    updateDistrict,
    deleteDistrict,
};
