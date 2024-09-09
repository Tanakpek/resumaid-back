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
exports.ScrapeInstructionsController = void 0;
const client_1 = require("@prisma/client");
class ScrapeInstructionsController {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        const a = this.prisma.job_scraping_pages.findFirst();
    }
    getScrapeInstructions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const u = yield this.prisma.$queryRaw `
            select private.job_scraping_pages.id, path_url, job_board, instructions, name, root_url , job_id_param
            from private.job_scraping_pages 
            join private.job_boards on private.job_scraping_pages.job_board = private.job_boards.id;
            `;
                return {
                    data: u,
                    ts: Date.now()
                };
            }
            catch (e) {
                console.log(e);
                return false;
            }
        });
    }
}
exports.ScrapeInstructionsController = ScrapeInstructionsController;
