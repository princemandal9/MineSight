const fs = require('fs');
const content = fs.readFileSync('src/app/supervisor/page.tsx', 'utf8');

const sErrStr = '{backendError && (';
const s1Str = '{/* 1. TOP METRICS BAR (4 Cards) */}';
const s2Str = '{/* STATUTORY COMPLIANCE CENTER */}';
const s3Str = '{/* 2. ENVIRONMENTAL & YIELD LOG */}';
const s4Str = '{/* 3. CONTRACTORS DIRECTORY */}';
const s5Str = '{/* 4. ACTIVE COMPLIANCE & RED-FLAGGED OPERATIONS (Live Feed) */}';
const s6Str = '{/* 5. QUICK OBSERVATION LOGGER FORM */}';
const s7Str = '{/* 6. USER AUTHENTICATION & REGISTRATION FILE LOG */}';

const mainStart = '<main className="max-w-7xl mx-auto mt-6 space-y-8">';
const mainEnd = '</main>\n    </div>\n  );\n}';

const idxMain = content.indexOf(mainStart);
const idxEnd = content.indexOf(mainEnd);

if (idxMain === -1 || idxEnd === -1) {
    console.error("Main tags not found");
    process.exit(1);
}

const mainContent = content.substring(idxMain + mainStart.length, idxEnd);

const idxErr = mainContent.indexOf(sErrStr);
const idx1 = mainContent.indexOf(s1Str);
const idx2 = mainContent.indexOf(s2Str);
const idx3 = mainContent.indexOf(s3Str);
const idx4 = mainContent.indexOf(s4Str);
const idx5 = mainContent.indexOf(s5Str);
const idx6 = mainContent.indexOf(s6Str);
const idx7 = mainContent.indexOf(s7Str);

const sErr = idxErr !== -1 && idxErr < idx1 ? mainContent.substring(idxErr, idx1) : '';
const s1 = mainContent.substring(idx1, idx2);
const s2 = mainContent.substring(idx2, idx3);
const s3 = mainContent.substring(idx3, idx4);
const s4 = mainContent.substring(idx4, idx5);
const s5 = mainContent.substring(idx5, idx6);
const s6 = mainContent.substring(idx6, idx7);
const s7 = mainContent.substring(idx7);

// We will construct the new content properly
const beforeReturn = content.substring(0, content.lastIndexOf('return ('));
const returnLineAndHeader = content.substring(content.lastIndexOf('return ('), idxMain + mainStart.length);

const importsAdd = `import {
  LayoutDashboard,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  HardHat,
  FileSignature,
  Truck as TruckIcon,
  Bomb as BombIcon,
  MessageSquare,
  User,
  Pencil,
  AlertTriangle, 
  FileCheck as FileCheckIcon, 
  CheckCircle2,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  Truck,
  Bomb,
  Pickaxe,
  Activity,
  Droplet,
  Wind,
  Volume2,
  ArrowLeft,
  FileCheck,
} from "lucide-react";
import Image from "next/image";
`;

let newBeforeReturn = beforeReturn.replace(/import \{.*?\} from "lucide-react";/s, importsAdd);
if(!newBeforeReturn.includes('import Image')) {
    newBeforeReturn = newBeforeReturn.replace('import Link', 'import Image from "next/image";\nimport Link');
}

const menuItems = `
const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "compliance", label: "Statutory Compliance", icon: FileCheckIcon },
  { id: "inspections", label: "Inspections", icon: FileText },
  { id: "contractors", label: "Contractors Directory", icon: HardHat },
  { id: "reports", label: "Reports & Analytics", icon: MessageSquare },
];

const generalItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "logout", label: "Logout", icon: LogOut },
];

`;

newBeforeReturn = newBeforeReturn.replace('export default function SupervisorPage() {', menuItems + 'export default function SupervisorPage() {');
newBeforeReturn = newBeforeReturn.replace('const [metrics, setMetrics] = useState<any>(null);', 'const [metrics, setMetrics] = useState<any>(null);\n  const [activeTab, setActiveTab] = useState("overview");');

const renderFunctions = `
  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      ${s1.trim()}
      ${s3.trim()}
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      ${s2.trim()}
    </div>
  );

  const renderInspections = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      ${s5.trim()}
      ${s6.trim()}
    </div>
  );

  const renderContractors = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      ${s4.trim()}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      ${s7.trim()}
    </div>
  );
`;

// REPLACE ROOT DIV SAFELY
// Find the first div after 'return ('
const rootDivRegex = /return\s*\(\s*<div[^>]*>/;
const match = returnLineAndHeader.match(rootDivRegex);

if (!match) {
    console.error("Root div not found");
    process.exit(1);
}

const newLayout = returnLineAndHeader.replace(
  match[0],
  `return (
  <div className="min-h-screen bg-neutral-50 dark:bg-mine-950 transition-colors duration-300 flex font-sans text-neutral-900 dark:text-neutral-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-mine-950 border-r border-neutral-200 dark:border-mine-800 flex flex-col hidden lg:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-100 dark:border-mine-800 shadow-sm bg-white">
            <Image src="/logo.jpg" alt="MineSight" width={40} height={40} className="object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-mine-950 dark:text-white">MineSight</span>
        </div>

        <div className="px-4 py-2 mt-4">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-4 px-2 uppercase tracking-wider">Menu</p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all \${activeTab === item.id
                    ? "bg-mine-700 text-white shadow-sm shadow-mine-700/20"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-mine-950 dark:hover:text-white hover:bg-mine-100/50 dark:hover:bg-mine-900/50"
                  }\`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-4 py-2 mt-auto pb-8">
          <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-4 px-2 uppercase tracking-wider">General</p>
          <nav className="space-y-1.5">
            {generalItems.map((item) => (
              <button
                key={item.id}
                className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all \${activeTab === item.id
                    ? "bg-mine-700 text-white shadow-sm shadow-mine-700/20"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-mine-950 dark:hover:text-white hover:bg-mine-100/50 dark:hover:bg-mine-900/50"
                  }\`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
        <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">`
);

// The problem last time was that I was generating:
// <main flex-1>
//   <div p-4>
//     <header>
//     <main max-w-7xl>

// I need to close the ones I added!
// Since returnLineAndHeader had <main max-w-7xl> at the end, I need to match its closing!
const newMainBody = `
          ${sErr.trim()}
          {activeTab === "overview" && renderOverview()}
          {activeTab === "compliance" && renderCompliance()}
          {activeTab === "inspections" && renderInspections()}
          {activeTab === "contractors" && renderContractors()}
          {activeTab === "reports" && renderReports()}
        </main>
      </div>
    </main>
  </div>
);
}
`;

fs.writeFileSync('src/app/supervisor/page_new.tsx', newBeforeReturn + renderFunctions + '\n' + newLayout + '\n' + newMainBody, 'utf8');
console.log("Generated page_new.tsx successfully.");
