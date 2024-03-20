import { model, models, Schema } from "mongoose";
import "./User";

const FeedbackSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    uploads: { type: [String] },
    userEmail: { type: String, required: true },
    votesCountCashed: { type: Number, default: 0 },
  },
  { timestamps: true, toObject: { virtuals: true }, toJSON: { virtuals: true } }
);

FeedbackSchema.virtual("user", {
  ref: "User",
  localField: "userEmail",
  foreignField: "email",
  justOne: true,
});

export const Feedback = models?.Feedback || model("Feedback", FeedbackSchema);
