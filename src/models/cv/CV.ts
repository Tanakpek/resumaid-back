const mongoose = require('mongoose');
const { Schema } = mongoose;


const TakeawaySchema = new Schema({
    immutable: { type: Boolean, default: true },
    value: { type: String, required: true },
    sel: { type: Boolean, required: true ,default: true }
});

const EducationSchema = new Schema({
    institution: { type: String, required: true },
    location: { type: String, required: false },
    degree: { type: String, required: true },
    dissertation: { type: String, default: null },
    thesis: { type: String, default: null },
    dates: [String],
    score: { type: String, default: null },
    classification: { type: String, default: null },
    gpa: { type: String, default: null },
    immutable: { type: Boolean, default: true }
});

EducationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const VolunteerSchema = new Schema({
    organization_name: { type: String, required: true },
    role: { type: String, required: true },
    takeaways: [TakeawaySchema],
    dates: [String],
    on: { type: Boolean, required: true, default: true},
    immutable: { type: Boolean, default: true }
});

VolunteerSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

const WorkItemSchema = new Schema({
    company: { type: String, required: false },
    role: { type: String, required: true },
    takeaways: [TakeawaySchema],
    dates: [String],
    on: { type: Boolean, required: true, default: true },
    immutable: { type: Boolean, default: true }
});

const ProjectSchema = new Schema({
    takeaways: [TakeawaySchema],
    immutable: { type: Boolean, default: true },
    on: { type: Boolean, required: true, default: true },
});

const SkillSchema = new Schema({
    immutable: { type: Boolean, default: true },
    value: { type: String, required: true }
});

const LanguageSchema = new Schema({
    immutable: { type: Boolean, default: true },
    value: { type: String, required: true }
});

const CertificationSchema = new Schema({
    immutable: { type: Boolean, default: true },
    value: { type: String, required: true }
});

const AchievementsSchema = new Schema({
    immutable: { type: Boolean, default: true },
    value: { type: String, required: true }
});

// Main CV schema
const CVSchema = new Schema({
    name: { type: String, required: true },
    title: { type: String, default: '' },
    education: [EducationSchema],
    achievements_and_awards: [AchievementsSchema],
    description: { type: String, default: '' },
    projects: {
        type: Map,
        of: ProjectSchema
    },
    volunteer: [VolunteerSchema],
    work: {
        type: Map,
        of: [WorkItemSchema]
    },
    skills: [SkillSchema],
    languages: [LanguageSchema],
    professional_certifications: [CertificationSchema],
    email: { type: String, required: true }
});

CVSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

export default mongoose.model("CV", CVSchema, 'applicaid_cvs');


