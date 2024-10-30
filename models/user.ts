import mongoose from "mongoose"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ICRMCity } from "../leads/crm.city.model";
import { IState } from "../erp_reports/state.model";
import { ICRMState } from "../leads/crm.state.model";
import { IErpEmployee } from "../erp_reports/erp.employee.model";

export type Asset = {
  _id: string,
  filename: string,
  public_url: string,
  content_type: string,
  size: string,
  bucket: string,
  created_at: Date
} | undefined


export type IUser = {
  _id: string,
  username: string,
  password: string,
  email: string,
  mobile: string,
  dp: Asset,
  client_id: string,
  orginal_password:string,
  connected_number: string,
  is_admin: Boolean,
  email_verified: Boolean,
  mobile_verified: Boolean,
  show_only_visiting_card_leads: boolean,
  is_active: Boolean,
  last_login: Date,
  multi_login_token: string | null,
  is_multi_login: boolean,
  assigned_users: IUser[]
  assigned_states: IState[]
  assigned_erpEmployees: IErpEmployee[]
  assigned_crm_states: ICRMState[]
  assigned_crm_cities: ICRMCity[],
  assigned_permissions: string[],
  created_at: Date,
  updated_at: Date,
  created_by: IUser,
  updated_by: IUser
  resetPasswordToken: string | null,
  resetPasswordExpire: Date | null,
  emailVerifyToken: string | null,
  emailVerifyExpire: Date | null
}
export type IUserMethods = {
  getAccessToken: () => string,
  comparePassword: (password: string) => boolean,
  getResetPasswordToken: () => string,
  getEmailVerifyToken: () => string
}

const UserSchema = new mongoose.Schema<IUser, mongoose.Model<IUser, {}, IUserMethods>, IUserMethods>({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    select: false,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  mobile: {
    type: String,
    trim: true,
    required: true,
  },
  multi_login_token: String,
  is_multi_login: {
    type: Boolean,
    default: true,
  },
  dp: {
    _id: { type: String },
    filename: { type: String },
    public_url: { type: String },
    content_type: { type: String },
    size: { type: String },
    bucket: { type: String },
    created_at: Date
  },
  client_id: {
    type: String,
    required: true,
    trim: true,
  },

  connected_number: {
    type: String,
    trim: true,
    index: true
  },
  is_admin: {
    type: Boolean,
    default: false,
    required: true,
  },
  email_verified: {
    type: Boolean,
    default: false,
    required: true
  },

  mobile_verified: {
    type: Boolean,
    default: false,
    required: true
  },
  is_active: {
    type: Boolean,
    default: true,
    required: true
  },
  assigned_permissions: Array<string>,
  assigned_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: []
    }
  ],
  assigned_erpEmployees:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ErpEmployee',
      default: []
    }
  ],
  assigned_states: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      default: []
    }
  ],
  show_only_visiting_card_leads: {
    type: Boolean,
    default: false
  },
  assigned_crm_states: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CRMState',
      default: []
    }
  ],
  assigned_crm_cities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CRMCity',
      default: []
    }
  ],

  last_login: {
    type: Date,
    default: new Date(),
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date(),
    required: true,

  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_at: {
    type: Date,
    default: new Date(),
    required: true,

  },

  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orginal_password:String,
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  },
  emailVerifyToken: {
    type: String,
    default: null
  },
  emailVerifyExpire: {
    type: Date,
    default: null
  },
})

// hashing passwords
UserSchema.pre('save', async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10)
});
// // authenticaion tokens
UserSchema.method(
  "getAccessToken", function () {
    return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_USER_SECRET || "kkskhsdhk", {
      expiresIn: process.env.JWT_ACCESS_EXPIRE,
    });
  }
)

// Compare Password
UserSchema.method("comparePassword", function (password: string) {
  return bcrypt.compare(password, this.password);
})


// Generating Password Reset Token
UserSchema.method("getResetPasswordToken", function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = resetToken
  this.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
  return resetToken;
})
//generating email verification token
UserSchema.method("getEmailVerifyToken", function () {
  const emailToken = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = emailToken
  this.emailVerifyExpire = new Date(Date.now() + 15 * 60 * 1000);
  return emailToken;
})
export const User = mongoose.model<IUser, mongoose.Model<IUser, {}, IUserMethods>>("User", UserSchema)