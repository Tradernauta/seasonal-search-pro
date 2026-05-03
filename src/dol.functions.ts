import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchDolJobs } from "./server/dol.server";

export const getDolJobs = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({
      top: z.number().optional(),
      skip: z.number().optional(),
      search: z.string().optional(),
      filter: z.string().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    return fetchDolJobs(data);
  });
