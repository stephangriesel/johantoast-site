import { defineCollection, z } from 'astro:content';

const videos = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string(),
        is_protected: z.boolean().default(true),
        s3_key: z.string(),
    }),
});

export const collections = {
    videos,
};
