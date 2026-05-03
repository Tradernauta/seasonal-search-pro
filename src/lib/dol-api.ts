import { getDolJobs } from "@/server/dol.functions";

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

export async function fetchDolJobsClient(options?: {
  top?: number;
  skip?: number;
  search?: string;
  filter?: string;
}): Promise<DolSearchResult> {
  try {
    const result = await getDolJobs({
      data: {
        top: options?.top ?? 24,
        skip: options?.skip ?? 0,
        search: options?.search,
        filter: options?.filter,
      },
    });
    return result as DolSearchResult;
  } catch (e) {
    console.error("Failed to fetch DOL jobs:", e);
    return { jobs: [], totalCount: 0 };
  }
}
