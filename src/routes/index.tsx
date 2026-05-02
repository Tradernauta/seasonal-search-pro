import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { getDolJobs } from "@/server/dol.functions";
import type { DolJob } from "@/server/dol.server";
import { formatWage, formatDate, getStatusClass, getStatusLabel } from "@/lib/dol-utils";
import { JobModal } from "@/components/JobModal";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Seasonal Jobs — DOL Dashboard" },
      { name: "description", content: "Painel de vagas sazonais do Departamento de Trabalho dos EUA" },
    ],
  }),
});

const PER_PAGE = 24;

function Dashboard() {
  const [allJobs, setAllJobs] = useState<DolJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterVisa, setFilterVisa] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<DolJob | null>(null);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    getDolJobs().then((jobs) => {
      setAllJobs(jobs);
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }).catch(() => setLoading(false));
  }, []);

  const states = useMemo(() => {
    return [...new Set(allJobs.map((j) => j.employer_state).filter(Boolean))].sort();
  }, [allJobs]);

  const filtered = useMemo(() => {
    return allJobs.filter((j) => {
      if (filterVisa && j.visa_class !== filterVisa) return false;
      if (filterState && j.employer_state !== filterState) return false;
      if (filterStatus && j.case_status !== filterStatus) return false;
      if (filterActive === "true" && !j.active) return false;
      if (filterActive === "false" && j.active) return false;
      if (search) {
        const hay = [j.job_title, j.employer_business_name, j.employer_city, j.employer_state, j.soc_title]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [allJobs, search, filterVisa, filterState, filterStatus, filterActive]);

  useEffect(() => { setCurrentPage(1); }, [filtered]);

  const stats = useMemo(() => {
    const active = allJobs.filter((j) => j.active).length;
    const totalPos = allJobs.reduce((s, j) => s + (j.total_positions || 0), 0);
    const wages = allJobs.filter((j) => j.basic_rate_from > 0 && j.pay_range_desc !== "Month").map((j) => j.basic_rate_from);
    const avgWage = wages.length ? wages.reduce((a, b) => a + b, 0) / wages.length : 0;
    return { total: allJobs.length, active, totalPos, avgWage, stateCount: states.length };
  }, [allJobs, states]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageJobs = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const paginationRange = useMemo(() => {
    const range: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  }, [totalPages, currentPage]);

  const goPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 flex items-center justify-between h-[60px] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="bg-primary text-primary-foreground font-mono text-[10px] font-bold px-2 py-0.5 tracking-widest">DOL</span>
          <span className="font-condensed text-lg font-bold tracking-wide text-foreground">
            Seasonal<span className="text-primary">Jobs</span> Dashboard
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-text3 tracking-wider">
            {lastUpdated ? `ATUALIZADO: ${lastUpdated}` : "—"}
          </span>
          <div className="w-2 h-2 rounded-full bg-dol-green animate-pulse-dot" />
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-px bg-border border border-border mb-8 animate-fade-up">
          <StatCard label="Total de Vagas" value={loading ? "—" : stats.total.toLocaleString("pt-BR")} sub="carregadas da API" />
          <StatCard label="Vagas Ativas" value={loading ? "—" : stats.active.toLocaleString("pt-BR")} sub="status: active" accent />
          <StatCard label="Total de Posições" value={loading ? "—" : stats.totalPos.toLocaleString("pt-BR")} sub="vagas abertas" />
          <StatCard label="Salário Médio" value={loading ? "—" : stats.avgWage ? `$${stats.avgWage.toFixed(2)}` : "—"} sub="USD / hora" green />
          <StatCard label="Estados" value={loading ? "—" : String(stats.stateCount)} sub="cobertos" />
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center mb-6 flex-wrap animate-fade-up-delay">
          <div className="flex-1 min-w-[240px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text3 text-sm pointer-events-none">⌕</span>
            <input
              type="text"
              placeholder="Buscar cargo, empresa, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border2 text-foreground font-mono text-xs py-2.5 pl-9 pr-3 outline-none focus:border-primary transition-colors tracking-wider placeholder:text-text3"
            />
          </div>

          <Select value={filterVisa} onChange={setFilterVisa} options={[["", "VISTO: TODOS"], ["H-2A", "H-2A"], ["H-2B", "H-2B"]]} />
          <Select
            value={filterState}
            onChange={setFilterState}
            options={[["", "ESTADO: TODOS"], ...states.map((s) => [s, s] as [string, string])]}
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              ["", "STATUS: TODOS"],
              ["Certification", "Certificado"],
              ["Pending", "Pendente"],
              ["Acceptance", "Aceito"],
              ["Withdrawn", "Retirado"],
            ]}
          />
          <Select
            value={filterActive}
            onChange={setFilterActive}
            options={[["", "ATIVIDADE: TODAS"], ["true", "Apenas Ativas"], ["false", "Apenas Inativas"]]}
          />

          <span className="font-mono text-[10px] text-text3 ml-auto whitespace-nowrap">
            Exibindo <span className="text-primary">{filtered.length.toLocaleString("pt-BR")}</span> vagas
          </span>
        </div>

        {/* Jobs grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-px bg-border animate-fade-up-delay2">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 bg-card">
              <div className="w-9 h-9 border-2 border-border2 border-t-primary rounded-full animate-spin-loader" />
              <span className="font-mono text-[11px] text-text3 tracking-widest">CONECTANDO À API DOL...</span>
            </div>
          ) : pageJobs.length === 0 ? (
            <div className="col-span-full bg-card p-16 text-center font-mono text-xs text-text3 tracking-wider">
              NENHUMA VAGA ENCONTRADA COM OS FILTROS APLICADOS
            </div>
          ) : (
            pageJobs.map((job, i) => (
              <JobCard key={job.case_number || i} job={job} onClick={() => setSelectedJob(job)} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 animate-fade-up-delay2">
            <PageBtn onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1}>← ANTERIOR</PageBtn>
            {paginationRange.map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="font-mono text-[10px] text-text3 px-2">...</span>
              ) : (
                <PageBtn key={p} active={p === currentPage} onClick={() => goPage(p as number)}>
                  {p}
                </PageBtn>
              )
            )}
            <PageBtn onClick={() => goPage(currentPage + 1)} disabled={currentPage === totalPages}>PRÓXIMA →</PageBtn>
          </div>
        )}
      </main>

      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

function StatCard({ label, value, sub, accent, green }: { label: string; value: string; sub: string; accent?: boolean; green?: boolean }) {
  const colorClass = green ? "text-dol-green" : accent ? "text-primary" : "text-foreground";
  return (
    <div className="bg-card px-5 py-4 flex flex-col gap-1.5">
      <span className="font-mono text-[9px] tracking-[0.15em] text-text3 uppercase">{label}</span>
      <span className={`font-mono text-[26px] font-bold leading-none ${colorClass}`}>{value}</span>
      <span className="text-[11px] text-text3">{sub}</span>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-card border border-border2 text-foreground font-mono text-[11px] py-2.5 px-3 outline-none cursor-pointer focus:border-primary transition-colors tracking-wider"
    >
      {options.map(([val, label]) => (
        <option key={val} value={val} className="bg-surface2">{label}</option>
      ))}
    </select>
  );
}

function JobCard({ job, onClick }: { job: DolJob; onClick: () => void }) {
  const stClass = getStatusClass(job.case_status);
  const stLabel = getStatusLabel(job.case_status);
  const wageStr = formatWage(job);

  const statusColors: Record<string, string> = {
    cert: "bg-dol-green/10 text-dol-green border border-dol-green/25",
    pending: "bg-primary/10 text-primary border border-primary/25",
    withdrawn: "bg-dol-red/10 text-dol-red border border-dol-red/25",
    acceptance: "bg-dol-blue/10 text-dol-blue border border-dol-blue/25",
    other: "bg-foreground/5 text-text3 border border-border2",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-card px-5 py-4 flex flex-col gap-2.5 cursor-pointer transition-colors hover:bg-surface2 relative overflow-hidden group`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors ${job.active ? "bg-dol-green" : "bg-border2"} group-hover:bg-primary`} />

      <div className="flex justify-between items-start gap-2">
        <h3 className="font-condensed text-[15px] font-bold tracking-wide text-foreground leading-tight flex-1">
          {job.job_title || "—"}
        </h3>
        {job.visa_class && (
          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 tracking-widest shrink-0 ${
            job.visa_class === "H-2A"
              ? "bg-dol-blue/15 text-dol-blue border border-dol-blue/30"
              : "bg-dol-purple/15 text-dol-purple border border-dol-purple/30"
          }`}>
            {job.visa_class}
          </span>
        )}
      </div>

      <p className="text-xs text-text2 font-medium">{job.employer_business_name || "—"}</p>

      <div className="grid grid-cols-2 gap-1.5">
        <MetaItem label="Localização" value={`${job.employer_city || "—"}, ${job.employer_state || "—"}`} />
        <MetaItem label="Salário" value={wageStr} highlight />
        <MetaItem label="Início" value={formatDate(job.begin_date)} />
        <MetaItem label="Término" value={formatDate(job.end_date)} />
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border">
        <span className={`font-mono text-[9px] px-2 py-0.5 tracking-wider ${statusColors[stClass]}`}>
          {stLabel}
        </span>
        <span className="font-mono text-[10px] text-text3">
          <strong className="text-foreground">{job.total_positions || 0}</strong> POSIÇÕES
        </span>
      </div>
    </div>
  );
}

function MetaItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[8px] tracking-[0.12em] text-text3 uppercase">{label}</p>
      <p className={`font-mono text-[11px] ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-mono text-[11px] px-3.5 py-2 border transition-colors tracking-wider ${
        active
          ? "bg-primary text-primary-foreground border-primary font-bold"
          : "bg-card border-border2 text-text2 hover:border-primary hover:text-primary"
      } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border2 disabled:hover:text-text2`}
    >
      {children}
    </button>
  );
}
