"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workFormSchema = exports.workplaceSchema = exports.volunteerFormSchema = exports.volunteerSchema = exports.experienceSchema = exports.skillFormSchema = exports.ProjectFormSchema = exports.projectSchema = exports.languageFormSchema = exports.educationFormSchema = exports.profileFormSchema = exports.certificateFormSchema = exports.achivementFormSchema = void 0;
const zod_1 = require("zod");
const validator_1 = __importDefault(require("validator"));
exports.achivementFormSchema = zod_1.z.object({
    achievements_and_awards: zod_1.z.array(zod_1.z.object({
        _id: zod_1.z.string().optional(),
        immutable: zod_1.z.boolean().default(false),
        value: zod_1.z.string().optional(),
    })).default([]).optional(),
});
exports.certificateFormSchema = zod_1.z.object({
    certifications: zod_1.z.array(zod_1.z.object({
        _id: zod_1.z.string().optional(),
        immutable: zod_1.z.boolean().default(false),
        value: zod_1.z.string().optional(),
    })).default([]).optional(),
});
exports.profileFormSchema = zod_1.z.object({
    email: zod_1.z
        .string({
        required_error: "Please select an email to display.",
    })
        .email(),
    phone_number: zod_1.z.string().refine(validator_1.default.isMobilePhone).nullish().or(zod_1.z.literal("")),
    bio: zod_1.z.string().max(160, "Maximum 160 characters.").min(4, 'Minimum 4 characters.').optional().or(zod_1.z.literal("")),
    personal_website: zod_1.z.string().url('Please Enter a valid url.').optional().or(zod_1.z.literal("")),
    linkedin: zod_1.z.string().url().refine((e) => { e.startsWith('https://www.linkedin.com/in/'); }, 'must be a LinkedIn profile').optional().or(zod_1.z.literal("")),
    github: zod_1.z.string().refine((e) => { e.startsWith('https://github.com/'); }, 'Must be a GitHub Profile').optional().or(zod_1.z.literal("")),
});
exports.educationFormSchema = zod_1.z.object({
    education: zod_1.z.array(zod_1.z.object({
        _id: zod_1.z.string().optional(),
        immutable: zod_1.z.boolean(),
        start: zod_1.z.string().or(zod_1.z.date()).or(zod_1.z.literal("")),
        end: zod_1.z.string().optional().or(zod_1.z.literal("").or(zod_1.z.literal("PRESENT"))),
        institution: zod_1.z.string(),
        dates: zod_1.z.array(zod_1.z.string()).optional(),
        location: zod_1.z.string().optional().or(zod_1.z.literal("")),
        degree: zod_1.z.string().optional().or(zod_1.z.literal("")),
        capstone: zod_1.z.object({
            dissertation: zod_1.z.string().optional().or(zod_1.z.literal("")),
            thesis: zod_1.z.string().optional().or(zod_1.z.literal("")),
        }).default({ 'thesis': "", 'dissertation': "" }).optional().refine(data => {
            let filledFields = ['thesis', 'dissertation'].filter(field => data && data[field] !== undefined && data[field] !== '');
            const filled = filledFields.length;
            const good = filled <= 1;
            return good;
        }, {
            message: "only one field should be filled for capstone project", path: ['thesis', 'dissertation']
        }),
        outcome: zod_1.z.object({
            gpa: zod_1.z.number().max(4.3).optional().or(zod_1.z.literal("")),
            score: zod_1.z.string().optional().or(zod_1.z.literal("")),
            classification: zod_1.z.string().optional().or(zod_1.z.literal("")),
        }).default({ 'score': "", 'classification': "" }).refine(data => {
            let filledFields = ['gpa', 'score', 'classification'].filter(field => data[field] !== undefined && data[field] !== '');
            filledFields = filledFields.length;
            const good = filledFields <= 1;
            return good;
        }, {
            message: 'Only one field should be filled for education outcome',
        })
    }).refine(data => {
        if (data.end === 'PRESENT' && data.start)
            return true;
        if (data.start && data.end) {
            const startDate = new Date(data.start);
            const endDate = new Date(data.end);
            return startDate < endDate;
        }
        else {
            return false;
        }
    }, {
        message: 'Start date must be before end date',
        path: ['endDate']
    })).default([]).optional(),
});
exports.languageFormSchema = zod_1.z.object({
    languages: zod_1.z.array(zod_1.z.object({
        _id: zod_1.z.string().optional(),
        immutable: zod_1.z.boolean().default(false),
        value: zod_1.z.string().optional(),
    })).default([]).optional(),
});
exports.projectSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    immutable: zod_1.z.boolean().default(false),
    takeaways: zod_1.z.array(zod_1.z.object({
        immutabe: zod_1.z.boolean(),
        value: zod_1.z.string(),
        _id: zod_1.z.string().optional(),
    })).default([]),
});
exports.ProjectFormSchema = zod_1.z.object({
    projects: zod_1.z.array(exports.projectSchema).default([]),
});
exports.skillFormSchema = zod_1.z.object({
    skills: zod_1.z.array(zod_1.z.object({
        _id: zod_1.z.string().optional(),
        immutable: zod_1.z.boolean().default(false),
        value: zod_1.z.string().optional(),
    })).default([]).optional(),
});
exports.experienceSchema = zod_1.z.object({
    _id: zod_1.z.string().nullable().optional(),
    immutable: zod_1.z.boolean().default(false),
    value: zod_1.z.string().min(1, 'Description is required')
});
exports.volunteerSchema = zod_1.z.object({
    _id: zod_1.z.string().nullable().optional(),
    organization_name: zod_1.z.string().min(1, 'Organization name is required'),
    role: zod_1.z.string().min(1, 'Role is required'),
    immutable: zod_1.z.boolean().default(false),
    startDate: zod_1.z.string({
        required_error: 'Start date is required'
    }).min(1, 'Start date is required'),
    endDate: zod_1.z.string().min(1, 'End date is required').or(zod_1.z.literal('PRESENT')),
    takeaways: zod_1.z.array(exports.experienceSchema)
}).refine((data) => {
    if (data.endDate === 'PRESENT')
        return true;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return startDate < endDate;
}, {
    message: 'Start date must be before end date',
    path: ['endDate']
});
exports.volunteerFormSchema = zod_1.z.object({
    organizations: zod_1.z.array(exports.volunteerSchema)
});
exports.workplaceSchema = zod_1.z.object({
    _id: zod_1.z.string().optional(),
    company: zod_1.z.string().min(1, 'Company name is required'),
    role: zod_1.z.string().min(1, 'Role is required'),
    immutable: zod_1.z.boolean().default(false).optional(),
    startDate: zod_1.z.string({
        required_error: 'Start date is required'
    }).min(1, 'Start date is required'),
    endDate: zod_1.z.string().min(1, 'End date is required').or(zod_1.z.literal('PRESENT')),
    takeaways: zod_1.z.array(exports.experienceSchema)
}).refine((data) => {
    if (data.endDate === 'PRESENT')
        return true;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return startDate < endDate;
}, {
    message: 'Start date must be before end date',
    path: ['endDate']
});
exports.workFormSchema = zod_1.z.object({
    workplaces: zod_1.z.array(exports.workplaceSchema)
});
