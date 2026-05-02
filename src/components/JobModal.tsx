import type { DolJob } from "@/server/dol.server";
import { formatWage, formatDate } from "@/lib/dol-utils";

interface JobModalProps {
  job: DolJob | null;
  onClose: () => void;
}

export function JobModal({ job, onClose }: JobModalProps) {
  if (!job) return null;

  const wageStr = formatWage(job);

  const applyLinks: { label: string; href: string; icon: string; secondary?: boolean }[] = [];
  if (job.apply_url && job.apply_url !== "N/A") {
    const url = job.apply_url.startsWith("http") ? job.apply_url : "https://" + job.apply_url;
    applyLinks.push({ label: "APLICAR ONLINE", href: url, icon: "🔗" });
  }
  if (job.apply_email && job.apply_email !== "N/A") {
    applyLinks.push({ label: "EMAIL", href: `mailto:${job.apply_email}`, icon: "✉", secondary: true });
  }
  if (job.apply_phone && job.apply_phone !== "N/A") {
    applyLinks.push({ label: "LIGAR", href: `tel:${job.apply_phone}`, icon: "📞", secondary: true });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 transition-opacity"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border2 max-w-[640px] w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex justify-between items-start gap-3 sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-condensed text-xl font-bold leading-tight text-foreground">{job.job_title || "—"}</h2>
            <p className="text-xs text-text2 mt-1">{job.employer_business_name || ""}</p>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs px-3 py-1.5 border border-border2 text-text2 hover:border-destructive hover:text-destructive transition-colors shrink-0"
          >
            ✕ FECHAR
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <Section label="Detalhes da Vaga">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Case Number" value={job.case_number} />
              <Detail label="Visto" value={job.visa_class} />
              <Detail label="Status" value={job.case_status} />
              <Detail label="Posições" value={String(job.total_positions || "—")} />
              <Detail label="Salário" value={wageStr} />
              <Detail label="H. Semanais" value={job.work_hour_num_basic ? `${job.work_hour_num_basic}h` : "—"} />
              <Detail label="Horário" value={`${job.hourly_work_schedule_am || "—"} – ${job.hourly_work_schedule_pm || "—"}`} />
              <Detail label="Início / Fim" value={`${formatDate(job.begin_date)} → ${formatDate(job.end_date)}`} />
            </div>
          </Section>

          <Section label="Empregador & Localização">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Empresa" value={job.employer_business_name} />
              <Detail label="Cidade/Estado" value={`${job.employer_city || "—"}, ${job.employer_state || "—"}`} />
              <Detail label="Endereço" value={job.worksite_address} />
              <Detail label="CEP" value={job.employer_zip} />
              <Detail label="Telefone" value={job.employer_phone} />
              <Detail label="Categoria SOC" value={job.soc_title} />
            </div>
          </Section>

          {job.job_duties && (
            <Section label="Responsabilidades">
              <pre className="text-xs text-text2 leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto bg-background p-3 border border-border font-sans">
                {job.job_duties.trim()}
              </pre>
            </Section>
          )}

          {job.special_req && job.special_req !== "N/A" && (
            <Section label="Requisitos Especiais">
              <pre className="text-xs text-text2 leading-relaxed whitespace-pre-wrap bg-background p-3 border border-border font-sans">
                {job.special_req.trim()}
              </pre>
            </Section>
          )}

          {applyLinks.length > 0 && (
            <Section label="Candidatura">
              <div className="flex gap-2 flex-wrap">
                {applyLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      link.secondary
                        ? "font-mono text-[11px] font-bold px-4 py-2.5 tracking-wider bg-surface2 text-foreground border border-border2 hover:border-primary hover:text-primary transition-colors no-underline"
                        : "font-mono text-[11px] font-bold px-4 py-2.5 tracking-wider bg-primary text-primary-foreground hover:opacity-90 transition-opacity no-underline"
                    }
                  >
                    {link.icon} {link.label}
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[9px] tracking-[0.15em] text-primary uppercase mb-2">{label}</p>
      {children}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="font-mono text-[9px] tracking-[0.1em] text-text3 uppercase mb-0.5">{label}</p>
      <p className="font-mono text-xs text-foreground break-words">{value || "—"}</p>
    </div>
  );
}
