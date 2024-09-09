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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_controller_1 = require("@src/controllers/user/user_controller");
const createS3Folder_1 = require("@src/utils/services/createS3Folder");
const usersController = new user_controller_1.UsersController();
const router = (0, express_1.Router)();
router.get('/profile', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield usersController.getUser(req.userData.userId);
        if (!user) {
            res.status(500).send('User not found');
            return;
        }
        const { name, given_name, family_name, email, bio, cv_uploaded, linkedin, github, personal_website, details } = user;
        const resp = { name, given_name, bio, family_name, email, cv_uploaded, linkedin, github, personal_website, details };
        return res.status(200).json(resp);
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/', [
    (0, express_validator_1.check)('email').isEmail(),
    (0, express_validator_1.check)('name').notEmpty(),
    (0, express_validator_1.check)("password").notEmpty()
], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((0, express_validator_1.validationResult)(req).isEmpty()) {
            const user = req.body;
            const newuser = yield usersController.createUser(user);
            if (newuser) {
                const id = newuser;
                const folder = yield (0, createS3Folder_1.createS3Folder)(id.email);
                if (!folder) {
                    yield usersController.deleteUser(id.id);
                    res.status(500).send('User not created');
                }
                req.userData.userId = id;
                console.log('created user');
                res.status(200);
            }
            else {
                res.status(500).send('User not created');
            }
        }
        else {
            res.status(500).send('User not created');
        }
    }
    catch (e) {
        res.status(500).send('There was an error, please try again later');
    }
}));
router.get('/cv/scratch/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.userData.email;
        const name = req.userData.name;
        const cv = yield usersController.createEmptyCV(email, name);
        if (!cv) {
            res.status(500).send('CV not created');
            return;
        }
        return res.status(200).json(cv);
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.get('/cv', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.getCV(req.userData.email);
        return res.status(200).json(cv);
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv_url', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield usersController.getUser(req.userData.userId);
        const url = yield (0, createS3Folder_1.generateS3PresignedURL)(process.env.AWS_BUCKET_NAME, (user.email) + '_cv');
        return res.status(200).json({ upload_location: url });
    }
    catch (e) {
        console.log(e);
    }
}));
router.post('/details', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield usersController.updateDetails(req.userData.email, req.body);
        if (typeof user !== 'number') {
            return res.status(200).json(user);
        }
        else {
            res.status(user).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/education', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.updateEducation(req.userData.email, req.body);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.delete('/cv/education/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.deleteEducation(req.userData.email, req.params.id);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/work', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.updateWork(req.userData.email, req.body);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.delete('/cv/work/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.deleteWork(req.userData.email, req.params.id);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/projects', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.updateProjects(req.userData.email, req.body);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.delete('/cv/projects/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.deleteProject(req.userData.email, req.params.id);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/volunteer', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.updateVolunteer(req.userData.email, req.body);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.delete('/cv/volunteer/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.deleteVolunteer(req.userData.email, req.params.id);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/achievements', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.updateAchievements(req.userData.email, req.body);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/skills', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.updateSkills(req.userData.email, req.body);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/certifications', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.updateCertificates(req.userData.email, req.body);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/description', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
router.post('/cv/languages', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cv = yield usersController.updateLanguages(req.userData.email, req.body);
        if (typeof cv !== 'number') {
            return res.status(200).json(cv);
        }
        else {
            res.status(cv).send();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).send('There was an error, please try again later');
    }
}));
exports.default = router;
