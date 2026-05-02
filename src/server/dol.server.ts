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

const API_URL = "https://api.seasonaljobs.dol.gov/datahub/search?api-version=2023-11-01";

export async function fetchAllDolJobs(): Promise<DolJob[]> {
  const all: DolJob[] = [];
  let skip = 0;
  const top = 1000;
  let attempts = 0;

  while (attempts < 20) {
    attempts++;
    try {
      const res: Response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          top,
          skip,
          orderby: "begin_date desc",
        }),
      });

      if (!res.ok) {
        console.error(`DOL API error: ${res.status}`);
        break;
      }

      const data: any = await res.json();
      const items = data.value;

      if (!Array.isArray(items) || items.length === 0) break;

      all.push(...items);
      skip += items.length;

      // If we got fewer than requested, we're done
      if (items.length < top) break;
    } catch (e) {
      console.error("Fetch error:", e);
      break;
    }
  }

  return all;
}
