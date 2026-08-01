import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertTriangle, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import { API_BASE_URL } from "../../services/api";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdvancedStudentImport({ onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALIASES = {
    name: ["student name", "name", "full name", "student", "candidate name"],
    registerNumber: ["register number", "register no", "register no.", "reg no", "reg number", "roll number", "roll no", "student id"],
    cin: ["cin", "cin number", "college id", "student code"],
    leetcodeUrl: ["leetcode url", "leetcode", "lc url", "profile url", "leetcode profile"],
    email: ["email", "email address", "mail"],
    phone: ["phone", "phone number", "mobile", "mobile number", "contact number"],
    department: ["department", "dept", "branch", "course"],
    year: ["year", "current year", "academic year", "study year"]
  };

  const mapColumns = (row: any) => {
    const mapped: any = {};
    const keys = Object.keys(row);
    
    for (const key of keys) {
      const lowerKey = key.toLowerCase().trim();
      let matched = false;
      
      for (const [field, aliases] of Object.entries(ALIASES)) {
        if (aliases.includes(lowerKey)) {
          mapped[field] = String(row[key] || "").trim();
          matched = true;
          break;
        }
      }
      
      // If it doesn't match an alias, but includes the word as a fallback
      if (!matched) {
        if (lowerKey.includes('name')) mapped.name = mapped.name || String(row[key]).trim();
        else if (lowerKey.includes('reg') || lowerKey.includes('roll')) mapped.registerNumber = mapped.registerNumber || String(row[key]).trim();
        else if (lowerKey.includes('cin')) mapped.cin = mapped.cin || String(row[key]).trim();
        else if (lowerKey.includes('leetcode') || lowerKey.includes('lc')) mapped.leetcodeUrl = mapped.leetcodeUrl || String(row[key]).trim();
      }
    }
    return mapped;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const mappedData = data.map(mapColumns).filter(row => row.name || row.registerNumber || row.cin || row.leetcodeUrl);
        setPreviewData(mappedData);
      } catch (err) {
        toast.error("Failed to parse file. Please ensure it is a valid CSV or Excel file.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return toast.error("No valid data to import");
    
    setIsUploading(true);
    const toastId = toast.loading("Importing students...");
    try {
      // Use API_BASE_URL which handles network IP access properly (no hardcoded localhost)
      const res = await fetch(`${API_BASE_URL}/students/import-v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: previewData })
      });
      
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || "Failed to import students");
      
      setSummary(result.summary);
      toast.success(result.message, { id: toastId });
      onSuccess();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSample = (type: string) => {
    let data: any[] = [];
    switch (type) {
      case 'full': data = [{ "Student Name": "Rahul", "Register Number": "23AI001", "CIN": "CIN123", "LeetCode URL": "https://leetcode.com/u/rahul", "Email": "rahul@shanmugha.edu.in", "Mobile": "9876543210", "Department": "CSE", "Year": "Second Year" }]; break;
      case 'name_reg': data = [{ "Student Name": "Priya", "Register Number": "23CS002" }]; break;
      case 'cin_only': data = [{ "CIN": "CIN456" }]; break;
      case 'reg_only': data = [{ "Register Number": "24IT005" }]; break;
      case 'name_only': data = [{ "Student Name": "Arun" }]; break;
      case 'name_reg_lc': data = [{ "Student Name": "Kavya", "Register Number": "23AI010", "LC URL": "https://leetcode.com/u/kavya" }]; break;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Template_${type}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream-100 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-sapphire-600" />
              Advanced Student Import
            </h2>
            <p className="text-xs text-ink-500 mt-1">Upload CSV or Excel files. Any column structure is supported.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
          
          {summary ? (
            <div className="bg-white p-8 rounded-xl border border-stone-200 text-center max-w-md mx-auto my-12">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 mb-2">Import Completed!</h3>
              <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                  <p className="text-xs text-stone-500 font-semibold uppercase">Total Rows</p>
                  <p className="text-xl font-bold text-ink-900">{summary.total}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-semibold uppercase">Created</p>
                  <p className="text-xl font-bold text-emerald-700">{summary.created}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold uppercase">Updated</p>
                  <p className="text-xl font-bold text-blue-700">{summary.updated}</p>
                </div>
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                  <p className="text-xs text-rose-600 font-semibold uppercase">Failed</p>
                  <p className="text-xl font-bold text-rose-700">{summary.failed}</p>
                </div>
              </div>
              {summary.errors && summary.errors.length > 0 && (
                <div className="mt-6 text-left bg-rose-50 p-4 rounded-lg border border-rose-200 h-32 overflow-y-auto">
                  <p className="text-xs font-bold text-rose-800 mb-2">Error Logs:</p>
                  <ul className="text-xs text-rose-700 space-y-1 list-disc pl-4">
                    {summary.errors.map((e: any, i: number) => (
                      <li key={i}>Row {e.row}: {e.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : !file ? (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-sapphire-300 bg-sapphire-50/50 rounded-xl p-12 text-center hover:bg-sapphire-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="w-12 h-12 text-sapphire-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-ink-900 mb-1">Click to Upload CSV or Excel</h3>
                <p className="text-sm text-ink-500">Supports .csv, .xls, .xlsx</p>
                <input type="file" ref={fileInputRef} className="hidden" accept=".csv, .xls, .xlsx" onChange={handleFileUpload} />
              </div>

              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h4 className="text-sm font-bold text-ink-900 mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4 text-sapphire-600" />
                  Download Sample Templates
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button onClick={() => downloadSample('full')} className="text-xs py-2 px-3 bg-stone-100 hover:bg-stone-200 rounded-lg text-left text-ink-700 font-medium transition-colors">1. Full Template (All Fields)</button>
                  <button onClick={() => downloadSample('name_reg')} className="text-xs py-2 px-3 bg-stone-100 hover:bg-stone-200 rounded-lg text-left text-ink-700 font-medium transition-colors">2. Name + Register No</button>
                  <button onClick={() => downloadSample('cin_only')} className="text-xs py-2 px-3 bg-stone-100 hover:bg-stone-200 rounded-lg text-left text-ink-700 font-medium transition-colors">3. CIN Only</button>
                  <button onClick={() => downloadSample('reg_only')} className="text-xs py-2 px-3 bg-stone-100 hover:bg-stone-200 rounded-lg text-left text-ink-700 font-medium transition-colors">4. Register No Only</button>
                  <button onClick={() => downloadSample('name_only')} className="text-xs py-2 px-3 bg-stone-100 hover:bg-stone-200 rounded-lg text-left text-ink-700 font-medium transition-colors">5. Name Only</button>
                  <button onClick={() => downloadSample('name_reg_lc')} className="text-xs py-2 px-3 bg-stone-100 hover:bg-stone-200 rounded-lg text-left text-ink-700 font-medium transition-colors">6. Name + Reg No + LeetCode</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                <h3 className="font-bold text-ink-900">Import Preview ({previewData.length} rows)</h3>
                <button onClick={() => setFile(null)} className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-medium transition-colors">
                  Cancel / Choose Another File
                </button>
              </div>
              
              <div className="flex-1 overflow-auto">
                {isProcessing ? (
                  <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-sapphire-600 animate-spin" /></div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-stone-100 border-b border-stone-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">#</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">Reg No</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">CIN</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">LeetCode</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">Phone</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">Dept</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-stone-500 uppercase">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {previewData.slice(0, 100).map((row, i) => (
                        <tr key={i} className="hover:bg-stone-50 text-sm">
                          <td className="px-4 py-2 text-stone-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-2">{row.name || <span className="text-stone-300 italic text-xs">Missing</span>}</td>
                          <td className="px-4 py-2 font-medium">{row.registerNumber || <span className="text-stone-300 italic text-xs">Missing</span>}</td>
                          <td className="px-4 py-2">{row.cin || <span className="text-stone-300 italic text-xs">Missing</span>}</td>
                          <td className="px-4 py-2">
                            {row.leetcodeUrl ? <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded truncate max-w-[120px] inline-block">{row.leetcodeUrl}</span> : <span className="text-stone-300 italic text-xs">Missing</span>}
                          </td>
                          <td className="px-4 py-2">{row.email || <span className="text-stone-300 italic text-xs">Missing</span>}</td>
                          <td className="px-4 py-2">{row.phone || <span className="text-stone-300 italic text-xs">Missing</span>}</td>
                          <td className="px-4 py-2">{row.department || <span className="text-stone-300 italic text-xs">Missing</span>}</td>
                          <td className="px-4 py-2">{row.year || <span className="text-stone-300 italic text-xs">Missing</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {previewData.length > 100 && (
                  <div className="p-3 text-center text-xs text-stone-500 bg-stone-50 border-t border-stone-200">
                    Showing first 100 rows. {previewData.length - 100} more rows will be imported.
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-stone-200 bg-white flex justify-between items-center">
                <p className="text-xs text-stone-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Missing fields are highlighted, but will not block the import.
                </p>
                <button 
                  onClick={handleImport}
                  disabled={isUploading}
                  className="bg-sapphire-600 hover:bg-sapphire-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Confirm & Import
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
