import type { DolJob } from "@/server/dol.server";

export function formatWage(job: DolJob): string {
  if (job.pay_range_desc === "Month") {
    return job.basic_rate_from
      ? `$${job.basic_rate_from.toLocaleString("en-US", { minimumFractionDigits: 0 })}/mês`
      : "—";
  }
  if (job.basic_rate_from && job.basic_rate_to && job.basic_rate_to > job.basic_rate_from) {
    return `$${job.basic_rate_from.toFixed(2)} – $${job.basic_rate_to.toFixed(2)}/h`;
  }
  return job.basic_rate_from ? `$${job.basic_rate_from.toFixed(2)}/h` : "—";
}

export function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
}

export function getStatusClass(status: string | null): string {
  if (!status) return "other";
  if (status.includes("Certification")) return "cert";
  if (status.includes("Pending")) return "pending";
  if (status.includes("Withdrawn")) return "withdrawn";
  if (status.includes("Acceptance")) return "acceptance";
  return "other";
}

export function getStatusLabel(status: string | null): string {
  if (!status) return "DESCONHECIDO";
  if (status.includes("Certification")) return "CERTIFICADO";
  if (status.includes("Pending")) return "PENDENTE";
  if (status.includes("Withdrawn")) return "RETIRADO";
  if (status.includes("Acceptance")) return "ACEITO";
  return status.substring(0, 16).toUpperCase();
}
