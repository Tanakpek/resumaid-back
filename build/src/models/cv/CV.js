"use strict";
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { ObjectId } = mongoose_1.default.Schema;
const cvSchema = new mongoose_1.default.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
    trim: true,
    text: true
  },
  title: {
    type: String,
    trim: true,
    text: true
  },
  education: [{
    institution: {
      type: String,
      required: [true, "institution is required"],
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    degree: {
      type: String,
      trim: true
    },
    dissertation: {
      type: String,
      trim: true
    },
    thesis: {
      type: String,
      trim: true
    },
    dates: {
      type: [String]
    },
    score: {
      type: String,
      trim: true
    },
    classification: {
      type: String,
      trim: true
    },
    gpa: {
      type: Number
    }
  }],
  achievements_and_awards: [{
    type: String,
    trim: true
  }],
  description: {
    type: String
  },
  projects: {
    type: Map,
    of: {
      takeaways: {
        type: [String]
      }
    }
  },
  volunteer: [
  {
    organization_name: {
      type: String,
      required: [true, "organization name is required"],
      trim: true
    },
    role: {
      type: String,
      trim: true
    },
    takeaways: {
      type: [String]
    },
    dates: {
      type: [String]
    }
  }],

  work: {
    type: Map,
    of: [{
      role: {
        type: String,
        trim: true
      },
      dates: {
        type: [String]
      },
      takeaways: {
        type: [String]
      }
    }]
  },
  skills: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  professional_certifications: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});
cvSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
exports.default = mongoose_1.default.model("CV", cvSchema, 'applicaid_cvs');