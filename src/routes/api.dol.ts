import { createAPIFileRoute } from "@tanstack/react-start/api";

const DOL_API = "https://api.seasonaljobs.dol.gov/datahub/search?api-version=2023-11-01";

export const APIRoute = createAPIFileRoute("/api/dol")({
  POST: async ({ request }) => {
    const body = await request.json();

    const res = await fetch(DOL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
});
