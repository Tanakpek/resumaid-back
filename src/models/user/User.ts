import  mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: [true, "first name is required"],
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
    cv: {
        type: ObjectId,
        ref: "CV"
    }
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

export default mongoose.model("User", userSchema, 'applicaid_users');