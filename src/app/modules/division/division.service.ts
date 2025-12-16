/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { excludeField } from "../../utils/constant";
import { divisionSearchableFields } from "./division.constant";
import { IDivision } from "./division.interface";
import { Division } from "./division.model";

const createDivision = async (payload: IDivision) => {

    const existingDivision = await Division.findOne({ name: payload.name });
    if (existingDivision) {
        throw new Error("A division with this name already exists.");
    }


    // const baseSlug = payload.name.toLowerCase().split(" ").join("-")
    // let slug = `${baseSlug}-division`

    // let counter = 0;
    // while (await Division.exists({ slug })) {
    //     slug = `${slug}-${counter++}` // dhaka-division-2
    // }

    // payload.slug = slug;

    const division = await Division.create(payload);

    return division
};

const getAllDivisions = async (query: Record<string, unknown>) => {

    const queryObj: Record<string, unknown> = {};

    const searchTerm = query.searchTerm as string || "";
    const sortData = query.sortData as string || "createdAt";

    for (const key of excludeField) {
        delete queryObj[key];
    }

    const searchQuery = {
        $or: divisionSearchableFields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
        }))
    }

    const divisions = await Division.find(searchQuery).find(queryObj).sort(sortData);
    const totalDivisions = await Division.countDocuments(searchQuery);
    return {
        data: divisions,
        meta: {
            total: totalDivisions
        }
    }
};
const getSingleDivision = async (slug: string) => {
    const division = await Division.findOne({ slug });
    return {
        data: division,
    }
};



const updateDivision = async (id: string, payload: Partial<IDivision>) => {

    const existingDivision = await Division.findById(id);
    if (!existingDivision) {
        throw new Error("Division not found.");
    }

    const duplicateDivision = await Division.findOne({
        name: payload.name,
        _id: { $ne: id },
    });

    if (duplicateDivision) {
        throw new Error("A division with this name already exists.");
    }

    // if (payload.name) {
    //     const baseSlug = payload.name.toLowerCase().split(" ").join("-")
    //     let slug = `${baseSlug}-division`

    //     let counter = 0;
    //     while (await Division.exists({ slug })) {
    //         slug = `${slug}-${counter++}` // dhaka-division-2
    //     }

    //     payload.slug = slug
    // }

    const updatedDivision = await Division.findByIdAndUpdate(id, payload, { new: true, runValidators: true })

    return updatedDivision

};

const deleteDivision = async (id: string) => {
    await Division.findByIdAndDelete(id);
    return null;
};

export const DivisionService = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision,
};