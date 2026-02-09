/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { Query } from "mongoose";
import { excludeField } from "./constant";

export class QueryBuilder<T> {
    public modelQuery : Query<T[], T> ;
    public readonly query : Record<string, string>    
    
constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
       this.modelQuery = modelQuery;
       this.query = query;
    }

    filter() :this{
        const filter ={...this.query}
        for(const key of excludeField){
        delete filter[key];
    }
    this.modelQuery.find(filter)
    return this;

    }
    search(searchableFields: string[]) : this{
        const searchTerm = this.query.searchTerm as string || ""; 
        const searchQuery = {
            $or: searchableFields.map(field => ({
                [field]: {$regex: searchTerm, $options: 'i' }
            }))
        }
        this.modelQuery.find(searchQuery)

        return this; 
    }
    sort() : this{
        const sortQuery = this.query.sortData || ""; 
        if(sortQuery){
            this.modelQuery.sort(sortQuery)
        }
        return this;
    }
    fields() : this{
        const fields = this.query.fields?.split(",").join(" ")   || ""; 
        this.modelQuery.select(fields)


        return this;
    }
    pagination() : this{
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.modelQuery.skip(skip).limit(limit)

        return this;
    }
    build() {
        return this.modelQuery;
    }

    async getMeta () {
        const totalDocuments = await this.modelQuery.model.countDocuments(
            this.modelQuery.getFilter(),
        ); 
        const totalPage = Math.ceil(totalDocuments / Number(this.query.limit))


        return{
            page: Number(this.query.page) || 1, 
            limit: Number(this.query.limit) || 10,
            totalPage,
            total: totalDocuments,
        }
    }
}