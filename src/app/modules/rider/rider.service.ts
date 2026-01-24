import { QueryBuilder } from "../../utils/QueryBuilder";
import { riderSearchableFields } from "./rider.constant";
import { IRider } from "./rider.interface";
import { Rider } from "./rider.model";

const createRiderIntoDB = async (payload: IRider) => {
  const result = await Rider.create(payload);
  return result;
};

const getAllRidersFromDB = async (query: Record<string, unknown>) => {
  const riderQuery = new QueryBuilder(Rider.find().populate("user"), query as Record<string, string>)
    .search(riderSearchableFields)
    .filter()
    .sort()
    .pagination()
    .fields();

  const [data, meta] = await Promise.all([
    riderQuery.build(),
    riderQuery.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};

const getSingleRiderFromDB = async (id: string) => {
  const result = await Rider.findById(id).populate("user");
  return result;
};

const updateRiderIntoDB = async (id: string, payload: Partial<IRider>) => {
  const result = await Rider.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteRiderFromDB = async (id: string) => {
  const result = await Rider.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true },
  );
  return result;
};

export const RiderServices = {
  createRiderIntoDB,
  getAllRidersFromDB,
  getSingleRiderFromDB,
  updateRiderIntoDB,
  deleteRiderFromDB,
};
