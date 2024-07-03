"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("@src/models/user/User"));
const cv_controller_1 = require("../cv/cv_controller");
const client_1 = require("@prisma/client");
const cv_form_types_1 = require("@src/utils/applicaid-ts-utils/cv_form_types");
class UsersController {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.CVsController = new cv_controller_1.CVsController();
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(user.password, 10);
            try {
                const data = {
                    email: user.email,
                    name: user.name,
                    given_name: user.given_name,
                    family_name: user.family_name,
                    details: {
                        email: user.email,
                        name: user.name,
                        given_name: user.given_name,
                        family_name: user.family_name,
                    }
                };
                const userdata = Object.assign(Object.assign({}, data), { password: hashedPassword });
                let new_user = yield User_1.default.create(userdata);
                new_user = yield new_user.save();
                try {
                    yield this.prisma.user.create({
                        data: {
                            email: user.email,
                        }
                    });
                }
                catch (e) {
                    yield User_1.default.deleteOne({ id: new_user.id });
                    console.error(e);
                }
                return new_user;
            }
            catch (e) {
                console.error(e);
            }
            return false;
        });
    }
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const u = yield User_1.default.findById(id).populate('details');
                return u;
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield User_1.default.deleteOne({ id: id });
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    loginEmail(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const u = yield User_1.default.findOne({ email: email });
            if (u === null) {
                return false;
            }
            else {
                try {
                    const match = yield bcrypt_1.default.compare(password, u.password);
                    if (match) {
                        return { id: u.id, email: u.email, name: u.name };
                    }
                    else {
                        return false;
                    }
                }
                catch (e) {
                    return false;
                }
            }
        });
    }
    getCV(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const cv = yield this.CVsController.getCV(email);
            if (cv) {
                return cv;
            }
        });
    }
    createEmptyCV(email, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cv = yield this.CVsController.createEmptyCV(email, name);
                if (cv) {
                    yield User_1.default.findOneAndUpdate({ email: email }, { $set: { cv: cv._id, cv_uploaded: true } });
                    return cv;
                }
                else {
                    return false;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateEducation(email, education) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                if (user) {
                    const cv = user.cv;
                    if (cv) {
                        cv.education = education.education;
                        const cv_new = yield cv.save();
                        return cv_new;
                    }
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    deleteEducation(email, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                cv.education = cv.education.filter((ed) => ed._id.toString() !== id);
                const cv_new = yield cv.save();
                return cv_new;
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateWork(email, work) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                if (cv) {
                    const newWork = work.workplaces.reduce((acc, curr) => {
                        if (curr.company in acc) {
                            const comp = curr.company;
                            delete curr.company;
                            const wp = Object.assign(Object.assign({}, curr), { dates: curr.startDate && curr.endDate ? [curr.startDate, curr.endDate] : [curr.startDate] });
                            acc[comp].push(wp);
                        }
                        else {
                            const comp = curr.company;
                            delete curr.company;
                            const wp = Object.assign(Object.assign({}, curr), { dates: curr.startDate && curr.endDate ? [curr.startDate, curr.endDate] : [curr.startDate] });
                            acc[comp] = [wp];
                        }
                        return acc;
                    }, {});
                    cv.work = newWork;
                    const cv_new = yield cv.save();
                    return cv_new;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    deleteWork(email, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                const newWork = cv.work;
                for (const [key, array] of newWork.entries()) {
                    newWork.set(key, array.filter((item) => item._id.toString() !== id));
                    if (newWork.get(key).length === 0) {
                        newWork.delete(key);
                    }
                }
                yield user.save();
                const cv_new = yield cv.save();
                return cv_new;
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateProjects(email, projects) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                if (cv) {
                    const pj = projects.projects.reduce((acc, curr) => {
                        if (curr.name in acc) {
                            const comp = curr.name;
                            const wp = Object.assign({}, curr);
                            acc[comp] = wp;
                        }
                        else {
                            const name = curr.name;
                            const wp = Object.assign({}, curr);
                            acc[name] = wp;
                        }
                        return acc;
                    }, {});
                    cv.projects = pj;
                    const cv_new = yield cv.save();
                    return cv_new;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    deleteProject(email, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                const newProjects = cv.projects;
                for (const [key, project] of newProjects.entries()) {
                    if (project._id.toString() === id) {
                        newProjects.delete(key);
                        break;
                    }
                }
                const cv_new = yield cv.save();
                return cv_new;
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateVolunteer(email, vol) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                if (cv) {
                    const orgs = vol.organizations.map((org) => {
                        return {
                            organization_name: org.organization_name,
                            role: org.role,
                            startDate: org.startDate,
                            dates: org.startDate && org.endDate ? [org.startDate, org.endDate] : [org.startDate],
                            takeaways: org.takeaways
                        };
                    });
                    cv.volunteer = orgs;
                    const cv_new = yield cv.save();
                    return cv_new;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    deleteVolunteer(email, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                cv.volunteer = cv.volunteer.filter((vol) => vol._id.toString() !== id);
                const cv_new = yield cv.save();
                return cv_new;
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateLanguages(email, languages) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                if (cv) {
                    cv.work = languages.languages;
                    const cv_new = yield cv.save();
                    return cv_new;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateAchievements(email, achievements) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                if (cv) {
                    cv.achievements_and_awards = achievements.achievements_and_awards;
                    const cv_new = yield cv.save();
                    return cv_new;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateCertificates(email, certs) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                if (cv) {
                    cv.professional_certifications = certs.certifications;
                    const cv_new = yield cv.save();
                    return cv_new;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateDetails(email, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email });
            if (!user) {
                return 404;
            }
            try {
                const deets = user.details;
                if (deets) {
                    cv_form_types_1.profileFormSchema.parse(data);
                    user.details = Object.assign(user.details, data);
                    const details_new = yield user.save();
                    const { name, given_name, family_name, email, bio, cv_uploaded, linkedin, github, personal_website, details } = details_new;
                    const resp = { name, given_name, bio, family_name, email, cv_uploaded, linkedin, github, personal_website, details };
                    console.log(resp);
                    return resp;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
    updateSkills(email, education) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findOne({ email: email }).populate('cv');
            if (!user) {
                return 404;
            }
            try {
                const cv = user.cv;
                if (cv) {
                    cv.skills = education.skills;
                    const cv_new = yield cv.save();
                    return cv_new;
                }
            }
            catch (e) {
                console.error(e);
                return 500;
            }
        });
    }
}
exports.UsersController = UsersController;
