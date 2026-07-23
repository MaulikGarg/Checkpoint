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
  avatarimg?: string;
  role: Role;
  resetPasswordOTP?: string;
  resetPasswordExpire?: Date;
  resetPasswordValidated: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateotp(): Promise<string>;
  checkotpexpire(): Promise<boolean>;
  compareotp(candidateOTP: string): Promise<boolean>;
}

// NOTE IF ANY CHANGES:
// follow project convention: <Name>: <type>, <required>, <others>
const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatarimg: { type: String, required: false, default: "" },
    role: {
      type: String,
      required: true,
      enum: Object.values(Role),
      default: Role.customer,
    },
    // otp handlers, obviously not required
    resetPasswordOTP: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    resetPasswordValidated: { type: Boolean, select: false },
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

// generates a hashed otp and sets timer
userSchema.methods.generateotp = async function (): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOTP = await bcrypt.hash(otp, await bcrypt.genSalt());
  this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  await this.save();
  return otp;
};

// tells if otp has expired, true if it has
userSchema.methods.checkotpexpire =
  async function checkotpexpire(): Promise<boolean> {
    if (
      !this.resetPasswordExpire ||
      Date.now() > this.resetPasswordExpire.getTime()
    ) {
      this.resetPasswordOTP = undefined;
      this.resetPasswordExpire = undefined;
      await this.save();
      return true;
    }
    return false;
  };

// returns true/false promise
userSchema.methods.compareotp = async function compareOTP(
  candidateOTP: string,
): Promise<boolean> {
  if (!this.resetPasswordOTP) return false;
  return bcrypt.compare(candidateOTP, this.resetPasswordOTP);
};

export default mongoose.model<IUser>("User", userSchema);
