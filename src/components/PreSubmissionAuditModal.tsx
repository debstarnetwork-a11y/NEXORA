import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Play, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  Wand2,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { PreSubmissionAuditResult, IntegrityAuditCheckItem } from '../types';
import { runPreSubmissionAudit } from '../lib/researchIntegrityEngine';
import { runAllIntegrityTests, TestResultItem } from '../lib/__tests__/researchIntegrityTests';
import { resolveAllAuditIssues, resolveSingleAuditIssue } from '../lib/auditAutoResolver';

interface PreSubmissionAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  auditResult?: PreSubmissionAuditResult;
  projectPages?: { title: string; content: string }[];
  onApplyResolvedContent?: (
    resolvedContent: string, 
    resolvedTitle: string, 
    updatedPages?: { title: string; content: string }[]
  ) => void;
}

export const PreSubmissionAuditModal: React.FC<PreSubmissionAuditModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  auditResult: initialAudit,
  projectPages,
  onApplyResolvedContent
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>(title);
  const [currentContent, setCurrentContent] = useState<string>(content);
  const [currentPages, setCurrentPages] = useState<{ title: string; content: string }[] | undefined>(projectPages);
  const [currentAudit, setCurrentAudit] = useState<PreSubmissionAuditResult>(
    initialAudit || runPreSubmissionAudit(title, content)
  );

  const [isResolvingAll, setIsResolvingAll] = useState<boolean>(false);
  const [resolvingCheckId, setResolvingCheckId] = useState<string | null>(null);
  const [lastResolutionSummary, setLastResolutionSummary] = useState<string | null>(null);
  const [resolutionReports, setResolutionReports] = useState<string[]>([]);

  const [testSuiteOutput, setTestSuiteOutput] = useState<{
    isRunning: boolean;
    report?: { allPassed: boolean; passedCount: number; totalCount: number; results: TestResultItem[] };
  }>({ isRunning: false });

  // Sync state whenever modal opens or props update
  useEffect(() => {
    if (isOpen) {
      setCurrentTitle(title);
      setCurrentContent(content);
      setCurrentPages(projectPages);
      const computedAudit = initialAudit || runPreSubmissionAudit(title, content);
      setCurrentAudit(computedAudit);
      setResolutionReports([]);
      setLastResolutionSummary(null);
    }
  }, [isOpen, title, content, projectPages, initialAudit]);

  if (!isOpen) return null;

  const categories = ['ALL', 'Citations', 'Numerical', 'Domain Transfer', 'Methodology & Alignment', 'Causal & Tone', 'Frameworks'];

  const filteredChecks = currentAudit.checks.filter(c => {
    if (activeCategory === 'ALL') return true;
    return c.category === activeCategory;
  });

  const passedCount = currentAudit.checks.filter(c => c.passed).length;
  const warningCount = currentAudit.checks.filter(c => !c.passed && c.severity === 'warning').length;
  const errorCount = currentAudit.checks.filter(c => !c.passed && c.severity === 'error').length;
  const actionableIssuesCount = warningCount + errorCount;

  // Auto-resolve all identified violations
  const handleAutoResolveAll = async () => {
    setIsResolvingAll(true);
    setLastResolutionSummary(null);

    // Give a brief tick so UI shows resolving spinner
    setTimeout(() => {
      try {
        const result = resolveAllAuditIssues(currentTitle, currentContent, currentPages);
        const newAudit = runPreSubmissionAudit(result.resolvedTitle, result.resolvedContent);

        setCurrentTitle(result.resolvedTitle);
        setCurrentContent(result.resolvedContent);
        setCurrentPages(result.pages);
        setCurrentAudit(newAudit);
        setResolutionReports(result.report);
        setLastResolutionSummary(`Successfully resolved ${result.resolvedCount} violations! Overall integrity score elevated to ${newAudit.overallScore}%.`);

        if (onApplyResolvedContent) {
          onApplyResolvedContent(result.resolvedContent, result.resolvedTitle, result.pages);
        }
      } catch (err: any) {
        console.error("Auto resolve all error:", err);
        setLastResolutionSummary(`Error resolving issues: ${err.message || 'Unknown error'}`);
      } finally {
        setIsResolvingAll(false);
      }
    }, 350);
  };

  // Auto-resolve a single specific check issue
  const handleResolveSingleCheck = async (checkId: string) => {
    setResolvingCheckId(checkId);
    setLastResolutionSummary(null);

    setTimeout(() => {
      try {
        const result = resolveSingleAuditIssue(checkId, currentTitle, currentContent, currentPages);
        const newAudit = runPreSubmissionAudit(result.resolvedTitle, result.resolvedContent);

        setCurrentTitle(result.resolvedTitle);
        setCurrentContent(result.resolvedContent);
        setCurrentPages(result.pages);
        setCurrentAudit(newAudit);
        setLastResolutionSummary(`Resolved: ${result.description}`);

        if (onApplyResolvedContent) {
          onApplyResolvedContent(result.resolvedContent, result.resolvedTitle, result.pages);
        }
      } catch (err: any) {
        console.error("Auto resolve single error:", err);
        setLastResolutionSummary(`Error resolving check: ${err.message || 'Unknown error'}`);
      } finally {
        setResolvingCheckId(null);
      }
    }, 250);
  };

  const handleRunAutomatedTestSuite = () => {
    setTestSuiteOutput({ isRunning: true });
    setTimeout(() => {
      const report = runAllIntegrityTests();
      setTestSuiteOutput({ isRunning: false, report });
    }, 400);
  };

  const handleExportAuditReport = () => {
    const reportText = `================================================================
ACADEMIC RESEARCH INTEGRITY AUDIT CERTIFICATE
================================================================
Date: ${new Date().toISOString()}
Project Title: ${currentAudit.titleAlignment.title}
Overall Integrity Score: ${currentAudit.overallScore}%
Audit Status: ${currentAudit.passed ? 'PASSED (Publication Ready)' : 'ACTION REQUIRED'}

${currentAudit.checks.length}-POINT INTEGRITY CHECKLIST SUMMARY:
- Total Checks: ${currentAudit.checks.length}
- Passed: ${passedCount}
- Warnings: ${warningCount}
- Errors: ${errorCount}

DETAILED VERIFICATION BREAKDOWN:
${currentAudit.checks.map((c, i) => `${i + 1}. [${c.passed ? 'PASS' : c.severity.toUpperCase()}] ${c.title} (${c.category})\n   Outcome: ${c.message}`).join('\n\n')}

RESEARCH GAP VALIDATION:
- Type: ${currentAudit.researchGapValidation.type}
- Valid: ${currentAudit.researchGapValidation.valid ? 'Yes' : 'No'}
- Description: ${currentAudit.researchGapValidation.description}

TITLE & METHODOLOGY FIDELITY:
- Matches Methodology: ${currentAudit.titleAlignment.matchesMethodology ? 'Yes' : 'No'}
${currentAudit.titleAlignment.recommendedTitle ? `- Recommended Calibrated Title: ${currentAudit.titleAlignment.recommendedTitle}\n` : ''}

================================================================
Generated by Academic Research Integrity & Citation Fidelity Engine
================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Academic_Integrity_Audit_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentAudit.checks.length}-Point Academic Pre-Submission Audit
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  currentAudit.overallScore >= 90
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}>
                  {currentAudit.overallScore}% Integrity Score
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rigorous evaluation across citations, numbers, domain transfer, subheading depth, methodology, and tone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Automatic Resolve All Button */}
            <button
              onClick={handleAutoResolveAll}
              disabled={isResolvingAll || actionableIssuesCount === 0}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                actionableIssuesCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
              title="Automatically resolve all identified audit violations across the manuscript"
            >
              {isResolvingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Resolving All Issues...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resolve All Issues</span>
                  {actionableIssuesCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                      {actionableIssuesCount}
                    </span>
                  )}
                </>
              )}
            </button>

            <button
              onClick={handleRunAutomatedTestSuite}
              disabled={testSuiteOutput.isRunning}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Run the automated test suite across all 11 criteria"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{testSuiteOutput.isRunning ? 'Running Tests...' : 'Run Automated Tests (A-K)'}</span>
            </button>

            <button
              onClick={handleExportAuditReport}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Certificate</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score & Status Summary Banner */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{passedCount} Checks Passed</span>
            </div>
            {warningCount > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-amber-600 dark:text-amber-400">{warningCount} Qualification Warnings</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-rose-600 dark:text-rose-400">{errorCount} Critical Violations</span>
              </div>
            )}
            {actionableIssuesCount === 0 && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>100% Fully Compliant with Academic Archival Standards</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500">
            Manuscript Scope: <strong className="text-slate-800 dark:text-slate-200">{currentAudit.claims.length} Claims Analysed</strong>
          </div>
        </div>

        {/* Resolution Feedback Alert Banner (if applied) */}
        {lastResolutionSummary && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">{lastResolutionSummary}</p>
                {resolutionReports.length > 0 && (
                  <ul className="mt-1.5 list-disc pl-4 space-y-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                    {resolutionReports.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button 
              onClick={() => setLastResolutionSummary(null)}
              className="text-emerald-600 hover:text-emerald-900 dark:hover:text-white shrink-0 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Automated Test Suite Output (if triggered) */}
        {testSuiteOutput.report && (
          <div className="mx-6 mt-3 p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-700 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 font-sans font-semibold">
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Automated Research Integrity Test Suite Results ({testSuiteOutput.report.passedCount}/{testSuiteOutput.report.totalCount} Passed)
              </span>
              <button 
                onClick={() => setTestSuiteOutput({ isRunning: false })}
                className="text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {testSuiteOutput.report.results.map((r, i) => (
                <div key={i} className="p-2 rounded-md bg-slate-800/80 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={r.passed ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {r.passed ? "✓ PASS" : "✗ FAIL"}
                    </span>
                    <span className="font-sans text-slate-300 font-medium truncate">{r.suite}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">{r.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="px-6 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs bg-white dark:bg-slate-900">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Checklist Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredChecks.map((check) => {
            const isExpanded = expandedCheckId === check.id;
            const isResolvingThis = resolvingCheckId === check.id;

            return (
              <div
                key={check.id}
                className={`border rounded-xl transition-all ${
                  check.passed
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50'
                    : check.severity === 'error'
                      ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                      : 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20'
                }`}
              >
                <div
                  onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                  className="p-3.5 flex items-start justify-between cursor-pointer gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : check.severity === 'error' ? (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                          {check.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {check.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {check.message}
                      </p>
                    </div>
                  </div>

                  {/* Per-Issue Resolve Button (Actionable for unresolved checks) */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!check.passed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolveSingleCheck(check.id);
                        }}
                        disabled={isResolvingThis || isResolvingAll}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                        title="Automatically resolve this specific issue and apply fix to manuscript"
                      >
                        {isResolvingThis ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Resolving...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3" />
                            <span>Resolve</span>
                          </>
                        )}
                      </button>
                    )}

                    <div className="text-slate-400 pl-1">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && check.details && check.details.length > 0 && (
                  <div className="px-10 pb-3.5 pt-1 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Diagnostic Details:
                    </span>
                    <ul className="list-disc pl-4 space-y-1">
                      {check.details.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            {currentAudit.passed ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Ready for Academic Defense & Archival Export
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Click &ldquo;Resolve All Issues&rdquo; or individual &ldquo;Resolve&rdquo; buttons to automatically rectify warnings
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
