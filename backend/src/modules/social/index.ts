import { Elysia } from "elysia";
import { generateSocialPostsRequestSchema } from "./schemas";
import { generateSocialPosts } from "./service";

/**
 * Social media routes for generating shareable posts
 * from token analysis data.
 *
 * POST /api/social/generate
 *   Accepts token analysis + metadata, returns generated posts
 *   for Threads, X, and LinkedIn.
 */
export function createSocialRoutes() {
  return new Elysia()
    .post(
      "/social/generate",
      async ({ body, set }) => {
        try {
          const parsed = generateSocialPostsRequestSchema.parse(body);
          const posts = await generateSocialPosts(
            parsed.tokenAnalysis,
            parsed.tokenAddress,
            parsed.tokenSymbol
          );

          return {
            success: true,
            posts,
            meta: {
              generatedAt: new Date().toISOString(),
              model: Bun.env.DEEPSEEK_MODEL || "deepseek-chat",
            },
          };
        } catch (error) {
          set.status = 400;
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to generate social posts",
            meta: {
              generatedAt: new Date().toISOString(),
            },
          };
        }
      }
    );
}
