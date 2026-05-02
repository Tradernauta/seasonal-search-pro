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

const API_BASE = "https://seasonaljobs.dol.gov/api/search";

export async function fetchAllDolJobs(): Promise<DolJob[]> {
  const all: DolJob[] = [];
  let url: string | null = `${API_BASE}?_limit=1000`;
  let attempts = 0;

  while (url && attempts < 20) {
    attempts++;
    try {
      const res: Response = await fetch(url as string, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "SeasonalJobsDashboard/1.0",
        },
      });

      if (!res.ok) {
        console.error(`DOL API error: ${res.status}`);
        break;
      }

      const data: any = await res.json();
      const items = data.data || data.value || data;

      if (Array.isArray(items)) {
        all.push(...items);
      }

      url = data["@odata.nextLink"] || data.links?.next || null;
    } catch (e) {
      console.error("Fetch error:", e);
      break;
    }
  }

  return all;
}
