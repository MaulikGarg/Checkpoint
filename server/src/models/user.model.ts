import bcrypt from "bcryptjs";
import mongoose, { Schema, Document } from "mongoose";

// the roles are defined as:
// customer: regular user, can purchase
// admin: power user, can add/update/delete
export enum Role {
  customer = "customer",
  administrator = "admin",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatarimg: string;
  role: Role;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// NOTE IF ANY CHANGES:
// follow project convention: <Name>: <type>, <required>, <others>
const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarimg: { type: String, required: false, default: "" },
    role: {
      type: String,
      required: true,
      enum: Object.values(Role),
      default: Role.customer,
    },
  },
  { timestamps: true },
);

// auto hash when a password is saved or modified
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, await bcrypt.genSalt());
});

// returns true/false promise
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
