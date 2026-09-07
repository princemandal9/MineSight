const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/app/supervisor/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. COLORS
content = content.replace(/slate/g, 'neutral');
content = content.replace(/zinc/g, 'mine');
content = content.replace(/emerald/g, 'emerald'); // keep
content = content.replace(/rose/g, 'rose'); // keep
content = content.replace(/amber/g, 'amber'); // keep

// Revert some specific incorrect neutral replaces (neutral is fine, mine is fine for dark mode)
content = content.replace(/bg-neutral-50/g, 'bg-neutral-50');
content = content.replace(/dark:bg-mine-950/g, 'dark:bg-mine-950');

// 2. ICONS
if (!content.includes('FileCheckIcon')) {
    content = content.replace('AlertTriangle,', 'AlertTriangle, FileCheck as FileCheckIcon, CheckCircle2,');
}

// 3. STATE
const stateInjection = `  const [obligations, setObligations] = useState<any[]>([]);

  useEffect(() => {
    // Load statutory obligations
    api.getObligations().then(res => {
      if (res.data) setObligations(res.data);
    }).catch(err => console.error("Failed to load obligations:", err));
  }, []);

  const handleVerifyCompliance = async (id: string, approved: boolean) => {
    try {
      await api.verifyCompliance(id, { verifiedBy: "Inspector R. Verma", approved, notes: approved ? "Verified compliant" : "Rejected, inadequate evidence" });
      const res = await api.getObligations();
      if (res.data) setObligations(res.data);
    } catch(e) {}
  };
`;
if (!content.includes('const [obligations, setObligations]')) {
    content = content.replace('  const [metrics, setMetrics] = useState<any>(null);', '  const [metrics, setMetrics] = useState<any>(null);\n' + stateInjection);
}

// 4. MODULE
const complianceJSX = `        {/* STATUTORY COMPLIANCE CENTER */}
        <section className="bg-white dark:bg-mine-900 p-6 rounded-2xl border border-neutral-200 dark:border-mine-800 space-y-4">
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-mine-950 dark:text-white">
                <FileCheckIcon className="text-purple-600" size={20} />
                Statutory Compliance Center
            </h2>
            </div>
            
            <div className="space-y-4">
                {obligations.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">No statutory obligations found.</div>
                ) : (
                obligations.map((ob: any) => (
                    <div key={ob.id} className="p-5 border border-neutral-100 dark:border-mine-800 rounded-xl bg-neutral-50/50 dark:bg-mine-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex gap-2 items-center mb-2">
                        <span className={\`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border \${
                            ob.status === 'COMPLIANT' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-300' :
                            ob.status === 'DUE_SOON' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-300' :
                            ob.status === 'OVERDUE' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:border-rose-800 dark:text-rose-300' :
                            ob.status === 'PENDING_VERIFICATION' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300' :
                            'bg-neutral-100 text-neutral-600 border-neutral-300 dark:bg-mine-800 dark:border-mine-700'
                        }\`}>
                            {ob.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">{ob.domain}</span>
                        </div>
                        <h4 className="text-sm font-bold text-mine-950 dark:text-white leading-tight mb-1">{ob.title}</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{ob.description}</p>
                        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                        Contractor: {ob.contractor?.name} • Due: {ob.dueDate ? new Date(ob.dueDate).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    
                    <div className="shrink-0 flex flex-col gap-2 min-w-[140px]">
                        {ob.status === 'PENDING_VERIFICATION' ? (
                        <div className="flex gap-2">
                            <button onClick={() => handleVerifyCompliance(ob.id, true)} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition">Verify</button>
                            <button onClick={() => handleVerifyCompliance(ob.id, false)} className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold transition">Reject</button>
                        </div>
                        ) : (
                        <div className="text-center px-3 py-2 bg-neutral-100 dark:bg-mine-800 text-neutral-500 dark:text-neutral-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                            {ob.status === 'COMPLIANT' ? <><CheckCircle2 size={14} /> Verified</> : 'No Action'}
                        </div>
                        )}
                        {ob.evidenceUrl && (
                        <a href={ob.evidenceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-blue-400 text-center hover:underline">
                            View Evidence
                        </a>
                        )}
                    </div>
                    </div>
                ))
                )}
            </div>
        </section>\n\n`;

if (!content.includes('STATUTORY COMPLIANCE CENTER')) {
    content = content.replace('{/* 2. ENVIRONMENTAL & YIELD LOG */}', complianceJSX + '        {/* 2. ENVIRONMENTAL & YIELD LOG */}');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Supervisor portal customized successfully.");
