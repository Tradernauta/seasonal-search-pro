// Tries direct API first, falls back to corsproxy if blocked
const DOL_API = "https://api.seasonaljobs.dol.gov/datahub/search?api-version=2023-11-01";
const PROXY_URL = "https://corsproxy.io/?" + encodeURIComponent(DOL_API);

export interface DolJob {
  case_number: string;
  case_status: string;
  visa_class: string;
  job_title: string;
  employer_business_name: string;
  employer_city: string;
  employer_state: string;
  employer_zip: string;
  employer_phone: string;
  worksite_address: string;
  begin_date: string;
  end_date: string;
  total_positions: number;
  basic_rate_from: number;
  basic_rate_to: number;
  pay_range_desc: string;
  work_hour_num_basic: number;
  hourly_work_schedule_am: string;
  hourly_work_schedule_pm: string;
  job_duties: string;
  special_req: string;
  soc_title: string;
  apply_url: string;
  apply_email: string;
  apply_phone: string;
  active: boolean;
}

export interface DolSearchResult {
  jobs: DolJob[];
  totalCount: number;
}

async function doFetch(url: string, body: object): Promise<any> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export async function fetchDolJobsClient(options?: {
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
}): Promise<DolSearchResult> {
  const body: Record<string, any> = {
    top: options?.top ?? 24,
    skip: options?.skip ?? 0,
    count: true,
    orderby: "begin_date desc",
  };

  if (options?.search) body.search = options.search;
  if (options?.filter) body.filter = options.filter;

  let data: any;

  try {
    // Try direct first
    data = await doFetch(DOL_API, body);
  } catch (e) {
    console.warn("Direct API failed, trying proxy...", e);
    try {
      data = await doFetch(PROXY_URL, body);
    } catch (e2) {
      console.error("Proxy also failed:", e2);
      return { jobs: [], totalCount: 0 };
    }
  }

  const jobs = (data.value || []) as DolJob[];
  const totalCount = data["@odata.count"] ?? jobs.length;
  return { jobs, totalCount };
}
