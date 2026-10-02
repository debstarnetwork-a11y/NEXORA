import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Search,
  Check,
  Wand2
} from 'lucide-react';
import { ResearchClaim, ClaimClassification, VerificationStatus } from '../types';
import { extractClaimsFromText, applyIntegrityQualificationsToText } from '../lib/researchIntegrityEngine';

interface ClaimAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  claims?: ResearchClaim[];
  currentText?: string;
  onApplyFixesToText?: (newText: string) => void;
}

export const ClaimAuditModal: React.FC<ClaimAuditModalProps> = ({
  isOpen,
  onClose,
  claims: initialClaims,
  currentText = '',
  onApplyFixesToText
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const claims = initialClaims && initialClaims.length > 0 
    ? initialClaims 
    : extractClaimsFromText(currentText);

  const filteredClaims = claims.filter(c => {
    const matchesFilter = selectedFilter === 'ALL' || c.claim_type === selectedFilter || (
      selectedFilter === 'ISSUES_ONLY' && (c.verification_status !== 'verified' || c.domainTransfer)
    );
    const matchesSearch = c.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.authors && c.authors.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.domain && c.domain.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const activeClaim = claims.find(c => c.id === activeClaimId) || filteredClaims[0];

  const getBadgeForClassification = (type: ClaimClassification) => {
    switch (type) {
      case 'VERIFIED_FACT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">1. Verified Fact</span>;
      case 'VERIFIED_NUMERICAL_CLAIM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">2. Verified Numerical</span>;
      case 'SOURCE_SYNTHESIS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">3. Source Synthesis</span>;
      case 'INTERPRETATION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">4. Interpretation</span>;
      case 'RESEARCH_HYPOTHESIS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">5. Research Hypothesis</span>;
      case 'UNVERIFIED_CLAIM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">6. Unverified Claim</span>;
      case 'CONTESTED_CONFLICTING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">7. Contested / Conflicting</span>;
    }
  };

  const getStatusIcon = (status: VerificationStatus, isDomainTransfer?: boolean) => {
    if (isDomainTransfer) {
      return <span title="Domain Transfer"><AlertTriangle className="w-4 h-4 text-amber-500" /></span>;
    }
    switch (status) {
      case 'verified':
        return <span title="Verified"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></span>;
      case 'qualified':
      case 'indirect':
        return <span title="Requires Qualification"><AlertTriangle className="w-4 h-4 text-amber-500" /></span>;
      case 'conflicting':
        return <span title="Conflicting Evidence"><AlertTriangle className="w-4 h-4 text-rose-500" /></span>;
      case 'unverified':
      case 'unsupported':
      default:
        return <span title="Unverified"><XCircle className="w-4 h-4 text-rose-500" /></span>;
    }
  };

  const handleApplyAllRecommendedQualifications = () => {
    if (!currentText || !onApplyFixesToText) return;
    const { sanitizedText, fixesAppliedCount } = applyIntegrityQualificationsToText(currentText);
    onApplyFixesToText(sanitizedText);
    setAppliedNotification(`Applied ${fixesAppliedCount} academic tone & causal qualification fixes to manuscript.`);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Manuscript Claim Audit & Source Traceability
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {claims.length} Substantive Claims Audited
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Granular classification into 7 research evidence tiers, source mapping, and numerical fidelity checks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onApplyFixesToText && (
              <button
                onClick={handleApplyAllRecommendedQualifications}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Automatically calibrate inflated buzzwords and causal assertions in manuscript"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply Recommended Qualifications</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {appliedNotification && (
          <div className="bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{appliedNotification}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search audited claim text, cited author, or metric..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 dark:text-slate-400 font-medium mr-1">Filter:</span>
            {[
              { id: 'ALL', label: 'All Claims' },
              { id: 'ISSUES_ONLY', label: 'Needs Attention' },
              { id: 'VERIFIED_FACT', label: 'Verified Facts' },
              { id: 'VERIFIED_NUMERICAL_CLAIM', label: 'Numerical' },
              { id: 'INTERPRETATION', label: 'Interpretations' },
              { id: 'RESEARCH_HYPOTHESIS', label: 'Hypotheses' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedFilter === tab.id
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Claims List (Left Column) */}
          <div className="w-1/2 border-r border-slate-200 dark:border-slate-800 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No claims match your search or filter criteria.
              </div>
            ) : (
              filteredClaims.map((claim, idx) => {
                const isSelected = activeClaim?.id === claim.id;
                return (
                  <div
                    key={claim.id}
                    onClick={() => setActiveClaimId(claim.id)}
                    className={`p-3.5 cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(claim.verification_status, claim.domainTransfer)}
                        <span className="font-mono text-[10px] text-slate-400">Claim #{idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getBadgeForClassification(claim.claim_type)}
                      </div>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                      "{claim.claim}"
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{claim.authors ? `${claim.authors.split(',')[0]} (${claim.publication_year || 'n.d.'})` : 'No direct citation'}</span>
                      {claim.domainTransfer && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Domain Transfer ⚠</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Claim Inspector & Traceability (Right Column) */}
          <div className="w-1/2 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {activeClaim ? (
              <div className="space-y-4">
                
                {/* Statement Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Audited Statement
                    </span>
                    {getBadgeForClassification(activeClaim.claim_type)}
                  </div>
                  <blockquote className="text-slate-900 dark:text-white font-medium text-sm leading-relaxed border-l-3 border-indigo-500 pl-3 my-2">
                    "{activeClaim.claim}"
                  </blockquote>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span>Evidence Status: <strong className="capitalize text-slate-700 dark:text-slate-300">{activeClaim.verification_status}</strong></span>
                    <span>Confidence: <strong>{Math.round(activeClaim.confidence * 100)}%</strong></span>
                  </div>
                </div>

                {/* Supporting Source Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Supporting Academic Source
                  </span>

                  {activeClaim.authors ? (
                    <div>
                      <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs">
                        {activeClaim.source_title || 'Peer-Reviewed Source'}
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                        <strong>Authors:</strong> {activeClaim.authors} ({activeClaim.publication_year})
                      </p>
                      {activeClaim.evidence_location && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <strong>Archival Venue:</strong> {activeClaim.evidence_location}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <strong>Source Research Domain:</strong> {activeClaim.domain}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>No specific citation retrieved for this sentence. Present as an author interpretation or qualify.</span>
                    </div>
                  )}
                </div>

                {/* Domain Transfer Diagnostic */}
                {activeClaim.domainTransfer && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-4 border border-amber-200 dark:border-amber-800 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Domain Transfer Detected</span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                      {activeClaim.notes || "This source studied computer vision or public census data, rather than higher education student retention. Avoid presenting findings as established in postsecondary education."}
                    </p>
                  </div>
                )}

                {/* Suggested Fix / Recommendation */}
                {activeClaim.suggestedFix && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Recommended Scholarly Qualification</span>
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed font-medium">
                      {activeClaim.suggestedFix}
                    </p>
                  </div>
                )}

                {/* Question Answering Fidelity Check */}
                <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Citation Fidelity Question: "What source supports this sentence?"
                  </div>
                  <p>
                    {activeClaim.authors 
                      ? `Supported by ${activeClaim.authors.split(',')[0]} et al. (${activeClaim.publication_year}). Verified in canonical archival proceedings.`
                      : 'Unanchored statement. Must be accompanied by peer-reviewed evidence or formulated as a hypothesis.'}
                  </p>
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Select a claim on the left to inspect evidence provenance.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" /> Requires Qualification / Transfer
            </span>
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <XCircle className="w-3.5 h-3.5" /> Unverified
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
