import { defineCollection, z } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({
    type: "content",
    schema: docsSchema({
      extend: z.object({
        banner: z.object({ content: z.string() }).default({
          content:
            'You\'re viewing the beta version. Looking for legacy docs? <a href="https://docs.delta.io" target="_blank" rel="noopener">Click here</a>.',
        }),
      }),
    }),
  }),
};
