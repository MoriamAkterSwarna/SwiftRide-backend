import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { districtSearchableFields } from "./district.constant";
import { IDistrict } from "./district.interface";
import { District } from "./district.model";

const createDistrict = async (payload: IDistrict) => {
  const existingDistrict = await District.findOne({ name: payload.name });
  if (existingDistrict) {
    throw new Error("A district with this name already exists.");
  }

  const district = await District.create(payload);

  return district;
};

const getAllDistricts = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    District.find().populate("division"),
    query
  );

  const result = queryBuilder
    .search(districtSearchableFields)
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

const getDistrictsByDivision = async (divisionId: string) => {
  const districts = await District.find({ division: divisionId }).populate(
    "division"
  );
  return {
    data: districts,
  };
};

const getSingleDistrict = async (slug: string) => {
  const district = await District.findOne({ slug }).populate("division");
  return {
    data: district,
  };
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

  const updatedDistrict = await District.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.thumbnail && existingDistrict.thumbnail) {
    await deleteImageFromCloudinary(existingDistrict.thumbnail);
  }

  return updatedDistrict;
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
