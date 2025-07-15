import { createTRPCRouter } from "./create-context";
import { 
  hiProcedure, 
  getTasksProcedure, 
  getReportsProcedure, 
  createTaskProcedure, 
  createReportProcedure 
} from "./routes/example/hi/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  tasks: createTRPCRouter({
    getAll: getTasksProcedure,
    create: createTaskProcedure,
  }),
  reports: createTRPCRouter({
    getAll: getReportsProcedure,
    create: createReportProcedure,
  }),
});

export type AppRouter = typeof appRouter;