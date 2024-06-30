import  mongoose, { Document, Model } from "mongoose";

const { ObjectId } = mongoose.Schema;

const userDetailsSchema = new mongoose.Schema(
  {
    _id: {
      type: ObjectId,
      required: true,
      default: function () { return new mongoose.Types.ObjectId() },
    },
    name: {
      type: String,
      required: [true, "full name is required"],
      trim: true,
      text: true,
    },
    family_name: {
      type: String,
      required: [true, "family name is required"],
      trim: true,
      text: true,
    },
    given_name: {
      type: String,
      required: [true, "given name is required"],
      trim: true,
      text: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      text: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      unique: true,
    },
    linkedin: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    personal_website: {
      type: String,
      default: "",
    },
    phone_number: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);
userDetailsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});


const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: [true, "full name is required"],
      trim: true,
      text: true,
    },
    family_name: {
        type: String,
        required: [true, "family name is required"],
        trim: true,
        text: true,
    },
    given_name: {
        type: String,
        required: [true, "given name is required"],
        trim: true,
        text: true,
    },
    bio: {
        type: String,
        default: "",
        trim: true,
        text: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    cv_uploaded: {
      type: Boolean,
      default: false,
    },
    linkedin: {
        type: String,
        default: "",
    },
    github: {
        type: String,
        default: "",
    },
    personal_website: {
        type: String,
        default: "",
    },
    phone_number: {
        type: String,
        default: "",
    },
    cv: {
        type: ObjectId,
        ref: "CV"
    },
    details: {
      type: ObjectId,
      ref: "UserDetails",
      required: true
    }
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

const User: Model<UserType> = mongoose.model<UserType>("User", userSchema, 'applicaid_users');
export default User

export interface UserType extends UserInterface, Document { }

interface UserInterface extends Document  {
    name: string,
    family_name: string,
    given_name: string,
    bio: string,
    email: string,
    password: string,
    email_verified: boolean,
    cv_uploaded: boolean,
    linkedin: string,
    github: string,
    personal_website: string,
    cv: object,
    phone_number: string
}

export const UserDetails: Model<UserDetailsType> = mongoose.model<UserDetailsType>("UserDetails", userDetailsSchema, 'applicaid_user_details');
export interface UserDetailsType extends UserDetailsInterface, Document { }
interface UserDetailsInterface extends Document {
  name: string,
  family_name: string,
  given_name: string,
  bio: string,
  email: string,
  linkedin: string,
  github: string,
  personal_website: string,
  phone_number: string
}