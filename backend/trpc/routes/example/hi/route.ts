import { z } from "zod";
import { publicProcedure } from "../../create-context";

export const hiProcedure = publicProcedure
  .input(z.object({ name: z.string().optional() }))
  .query(({ input }: { input: { name?: string } | undefined }) => {
    return {
      message: `Hello ${input.name || 'World'}!`,
      timestamp: new Date().toISOString(),
    };
  });