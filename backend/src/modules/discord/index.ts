import { Elysia } from "elysia";
import { startBot, stopBot, getClient } from "./bot";

/**
 * Elysia routes for the Discord coaching bot module.
 *
 * Provides endpoints to start/stop the bot and check status.
 */
export function createDiscordRoutes() {
  return new Elysia({ prefix: "/discord" })
    .post("/start", async () => {
      try {
        await startBot();
        return { status: "ok", message: "Discord bot started" };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        return { status: "error", message };
      }
    })
    .post("/stop", async () => {
      await stopBot();
      return { status: "ok", message: "Discord bot stopped" };
    })
    .get("/status", () => {
      const client = getClient();
      return {
        online: !!client,
        username: client?.user?.tag ?? null,
        guilds: client?.guilds.cache.size ?? 0,
      };
    });
}
