import { createServerFn } from "@tanstack/react-start";
import { fetchAllDolJobs } from "./dol.server";

export const getDolJobs = createServerFn({ method: "GET" })
  .handler(async () => {
    const jobs = await fetchAllDolJobs();
    return jobs;
  });
