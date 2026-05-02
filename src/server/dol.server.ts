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

const API_URL = "https://api.seasonaljobs.dol.gov/datahub/search?api-version=2023-11-01";

export async function fetchDolJobs(options?: {
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
}): Promise<DolSearchResult> {
  const top = options?.top ?? 1000;
  const skip = options?.skip ?? 0;

  const body: Record<string, any> = {
    top,
    skip,
    count: true,
    orderby: "begin_date desc",
  };

  if (options?.search) {
    body.search = options.search;
  }

  if (options?.filter) {
    body.filter = options.filter;
  }

  try {
    const res: Response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`DOL API error: ${res.status}`);
      return { jobs: [], totalCount: 0 };
    }

    const data: any = await res.json();
    const jobs = (data.value || []) as DolJob[];
    const totalCount = data["@odata.count"] ?? jobs.length;

    return { jobs, totalCount };
  } catch (e) {
    console.error("DOL fetch error:", e);
    return { jobs: [], totalCount: 0 };
  }
}
