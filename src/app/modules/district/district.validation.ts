import { z } from "zod";

export const createDistrictSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        division: z.string().min(1),
        thumbnail: z.string().optional(),
        description: z.string().optional(),
    }),
});

export const updateDistrictSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        division: z.string().min(1).optional(),
        thumbnail: z.string().optional(),
        description: z.string().optional(),
    }),
});
