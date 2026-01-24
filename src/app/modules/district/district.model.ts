import { model, Schema } from "mongoose";
import { IDistrict } from "./district.interface";

const districtSchema = new Schema<IDistrict>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },
    thumbnail: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  },
);

districtSchema.pre("save", async function () {
  if (this.isModified("name")) {
    const baseSlug = this.name.toLowerCase().split(" ").join("-");
    let slug = `${baseSlug}-district`;

    let counter = 0;
    while (await District.exists({ slug })) {
      slug = `${baseSlug}-district-${counter++}`;
    }

    this.slug = slug;
  }
});

districtSchema.pre("findOneAndUpdate", async function () {
  const district = this.getUpdate() as IDistrict;

  if (district.name) {
    const baseSlug = district.name.toLowerCase().split(" ").join("-");
    let slug = `${baseSlug}-district`;

    let counter = 0;
    while (await District.exists({ slug })) {
      slug = `${baseSlug}-district-${counter++}`;
    }

    district.slug = slug;
  }

  this.setUpdate(district);
});

export const District = model<IDistrict>("District", districtSchema);
