import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  BookOpen,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { ResearchSource, EvidenceMatrixRow } from '../types';
import { CANONICAL_RESEARCH_SOURCES, buildEvidenceMatrixRows } from '../lib/researchEvidenceRegistry';

interface EvidenceMatrixViewProps {
  isOpen: boolean;
  onClose: () => void;
  sources?: ResearchSource[];
  onInsertIntoManuscript?: (markdownTable: string) => void;
}

export const EvidenceMatrixView: React.FC<EvidenceMatrixViewProps> = ({
  isOpen,
  onClose,
  sources = CANONICAL_RESEARCH_SOURCES,
  onInsertIntoManuscript
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [relevanceFilter, setRelevanceFilter] = useState('ALL');

  if (!isOpen) return null;

  const rows = buildEvidenceMatrixRows(sources);

  // Filter rows
  const filteredRows = rows.filter(row => {
    const matchesSearch = 
      row.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.dataset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.keyFinding.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain = domainFilter === 'ALL' || row.domain.toLowerCase().includes(domainFilter.toLowerCase());
    const matchesRelevance = relevanceFilter === 'ALL' || (
      relevanceFilter === 'DIRECT' ? row.directOrIndirect === 'Direct' : row.directOrIndirect.includes('Indirect')
    );

    return matchesSearch && matchesDomain && matchesRelevance;
  });

  const exportAsMarkdown = () => {
    let md = `| Source | Authors & Year | Domain | Dataset | Method / Privacy | Fairness Metric | Key Verified Finding | Relevance |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    filteredRows.forEach(r => {
      md += `| **${r.source}** | ${r.authors} (${r.year}) | ${r.domain} | ${r.dataset} | ${r.privacyMechanism} | ${r.fairnessMetric} | ${r.keyFinding.slice(0, 100)}... | ${r.directOrIndirect} |\n`;
    });

    if (onInsertIntoManuscript) {
      onInsertIntoManuscript(md);
      onClose();
    } else {
      navigator.clipboard.writeText(md);
      alert("Evidence Matrix Markdown table copied to clipboard!");
    }
  };

  const exportAsCSV = () => {
    const headers = ["Source", "Year", "Authors", "Domain", "Dataset", "Privacy Mechanism", "Fairness Metric", "Key Finding", "Numerical Finding", "Relevance", "Verification Status"];
    const csvRows = [
      headers.join(','),
      ...filteredRows.map(r => [
        `"${r.source}"`,
        r.year,
        `"${r.authors}"`,
        `"${r.domain}"`,
        `"${r.dataset.replace(/"/g, '""')}"`,
        `"${r.privacyMechanism.replace(/"/g, '""')}"`,
        `"${r.fairnessMetric.replace(/"/g, '""')}"`,
        `"${r.keyFinding.replace(/"/g, '""')}"`,
        `"${r.numericalFinding.replace(/"/g, '""')}"`,
        `"${r.directOrIndirect}"`,
        `"${r.verificationStatus}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Evidence_Matrix_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Interactive Evidence Matrix
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  {filteredRows.length} Ground-Truth Sources
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited peer-reviewed evidence mapping domain parameters, datasets, and verified quantitative findings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportAsCSV}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {onInsertIntoManuscript && (
              <button
                onClick={exportAsMarkdown}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Insert Markdown table into thesis chapter"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Insert Table into Manuscript</span>
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

        {/* Filter Controls Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search author, dataset (e.g. CIFAR-10, 14,200), domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Domain:</span>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 text-xs"
            >
              <option value="ALL">All Disciplines</option>
              <option value="Higher Education">Higher Education</option>
              <option value="Machine Learning">Machine Learning / CV</option>
              <option value="Differential Privacy">DP Theory</option>
              <option value="Census">Census / Public Policy</option>
            </select>

            <span className="text-slate-500 dark:text-slate-400 font-medium ml-2">Relevance:</span>
            <select
              value={relevanceFilter}
              onChange={(e) => setRelevanceFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-800 dark:text-slate-200 text-xs"
            >
              <option value="ALL">All Evidence</option>
              <option value="DIRECT">Direct Evidence Only</option>
              <option value="INDIRECT">Indirect / Transferable</option>
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-3 w-40">Source & Authors</th>
                  <th className="py-3 px-3 w-32">Research Domain</th>
                  <th className="py-3 px-3 w-44">Population & Dataset</th>
                  <th className="py-3 px-3 w-36">Method / Mechanism</th>
                  <th className="py-3 px-3 w-32">Fairness Metric</th>
                  <th className="py-3 px-3 min-w-[200px]">Key Verified Finding</th>
                  <th className="py-3 px-3 w-32">Relevance Type</th>
                  <th className="py-3 px-3 w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRows.map((row) => {
                  const isDirect = row.directOrIndirect === 'Direct';
                  return (
                    <tr 
                      key={row.sourceId} 
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors align-top"
                    >
                      <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                        <div className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {row.source}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {row.authors}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                          {row.domain}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{row.dataset}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{row.population}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <div className="font-mono text-[11px]">{row.privacyMechanism}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{row.fairnessMetric}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        <p className="line-clamp-3">{row.keyFinding}</p>
                        {row.numericalFinding && !row.numericalFinding.includes('No verified') && (
                          <div className="mt-1 text-[11px] text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-sm border border-sky-100 dark:border-sky-900/40 font-mono">
                            {row.numericalFinding}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isDirect 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          {row.directOrIndirect}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Direct: Studied higher ed or core research variable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Transferable: Studied CV, Census, or general benchmark
            </span>
          </div>
          <div>
            Showing {filteredRows.length} of {rows.length} verified literature entries
          </div>
        </div>
      </div>
    </div>
  );
};
