import { runs } from "@prisma/client";
import { Prisma } from '@prisma/client';

export type RunCreateData =  Prisma.runsCreateInput
export type RunCreateUncheckedData = Prisma.runsUncheckedCreateInput
export type a = Prisma.runsCreateOrConnectWithoutApplicantsInput

export type RunUpdateData = Prisma.runsUpdateInput
export type RunUpdateUncheckedData = Prisma.runsUncheckedUpdateInput
