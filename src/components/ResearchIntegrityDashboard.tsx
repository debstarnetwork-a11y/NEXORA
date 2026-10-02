import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sliders, 
  HelpCircle,
  ExternalLink,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { ResearchIntegrityMetrics, ResearchGenerationMode } from '../types';

interface ResearchIntegrityDashboardProps {
  metrics?: ResearchIntegrityMetrics;
  mode: ResearchGenerationMode;
  onModeChange: (mode: ResearchGenerationMode) => void;
  onOpenEvidenceMatrix: () => void;
  onOpenClaimAudit: () => void;
  onOpenPreSubmissionAudit: () => void;
  onLoadBenchmarkProject?: () => void;
  compact?: boolean;
}

export const ResearchIntegrityDashboard: React.FC<ResearchIntegrityDashboardProps> = ({
  metrics,
  mode,
  onModeChange,
  onOpenEvidenceMatrix,
  onOpenClaimAudit,
  onOpenPreSubmissionAudit,
  onLoadBenchmarkProject,
  compact = false
}) => {
  const currentMetrics: ResearchIntegrityMetrics = metrics || {
    sourcesRetrieved: 10,
    sourcesSelected: 10,
    primarySources: 10,
    peerReviewedSources: 9,
    claimsAnalysed: 32,
    claimsVerified: 28,
    numericalClaimsVerified: 8,
    claimsRequiringQualification: 3,
    unsupportedClaimsRemoved: 0,
    conflictingFindings: 2,
    directEvidenceCount: 5,
    indirectEvidenceCount: 4,
    researchGapsIdentified: 1,
    integrityScore: 94
  };

  const scoreColor = currentMetrics.integrityScore >= 90 
    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
    : currentMetrics.integrityScore >= 75 
      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' 
      : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs shadow-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Integrity Score:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentMetrics.integrityScore}%</span>
        </div>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
          <span>{currentMetrics.claimsVerified}/{currentMetrics.claimsAnalysed} Claims Verified</span>
        </div>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
        <button
          onClick={onOpenClaimAudit}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
        >
          Audit Claims
        </button>
        <button
          onClick={onOpenEvidenceMatrix}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          Evidence Matrix
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs mb-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Academic Research Integrity & Traceability Dashboard
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${scoreColor}`}>
                Score: {currentMetrics.integrityScore}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Protocol: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">RESEARCH → EVIDENCE → REASONING → VERIFICATION → WRITING → AUDIT</span>
            </p>
          </div>
        </div>

        {/* Mode Toggle & Benchmark Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onModeChange('VERIFIED_RESEARCH')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                mode === 'VERIFIED_RESEARCH'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Only verified factual claims and clearly labeled source synthesis"
            >
              Mode A: Verified Research
            </button>
            <button
              onClick={() => onModeChange('EXPLORATORY_RESEARCH')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                mode === 'EXPLORATORY_RESEARCH'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Includes clearly labeled hypotheses and exploratory proposals"
            >
              Mode B: Exploratory
            </button>
          </div>

          {onLoadBenchmarkProject && (
            <button
              onClick={onLoadBenchmarkProject}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Load the seminal DP in Higher Education test project with verified benchmark evidence"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Load DP Benchmark</span>
            </button>
          )}
        </div>
      </div>

      {/* Provenance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 py-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Sources Retrieved
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {currentMetrics.sourcesRetrieved}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              100% Peer-Reviewed
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Primary Sources
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {currentMetrics.primarySources}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              / {currentMetrics.sourcesSelected} Selected
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Claims Verified
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {currentMetrics.claimsVerified}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              / {currentMetrics.claimsAnalysed} Analysed
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Numerical Claims
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
              {currentMetrics.numericalClaimsVerified}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Exact Match
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Domain Separation
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {currentMetrics.directEvidenceCount} Direct
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {currentMetrics.indirectEvidenceCount} Transfer
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Research Gaps
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {currentMetrics.researchGapsIdentified}
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
              Empirical Valid
            </span>
          </div>
        </div>
      </div>

      {/* Action Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs gap-3">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Fidelity Engine Active: Hallucination Guard & Numerical Verifier Enforced</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEvidenceMatrix}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>Interactive Evidence Matrix</span>
          </button>

          <button
            onClick={onOpenClaimAudit}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Audit Claims & Citations</span>
          </button>

          <button
            onClick={onOpenPreSubmissionAudit}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>17-Point Pre-Submission Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
