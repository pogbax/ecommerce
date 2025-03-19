import mongoose from "mongoose";

const FeatureSchema = new mongoose.Schema(
  {
    images: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Feature", FeatureSchema);