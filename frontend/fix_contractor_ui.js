const fs = require('fs');
const file = 'src/app/contractor/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove alert from handleAction
content = content.replace(/alert\(`\$\{actionName\} action triggered! \(Dummy Data\)`\);/g, 'console.info(`[Unimplemented] ${actionName}`);');

// 2. Analytics divs
content = content.replace(/onClick=\{\(\) => handleAction\("View (Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) Analytics"\)\}/g, '');

// Remove onClick from table rows
const tableTypes = ['License', 'Machine', 'Explosive', 'Worker'];
for (const t of tableTypes) {
    const regex = new RegExp(`onClick=\\{\\(\\) => handleAction\\(\`View ${t}: \\$\\{.*?\\}\`\\)\\}`,'g');
    content = content.replace(regex, '');
}

// Remove onClick from Logs
content = content.replace(/onClick=\{\(\) => handleAction\(`View Log: \$\{log\.desc\}`\)\}/g, '');

// Clean up cursor-pointer and hover effects on those rows
content = content.replace(/cursor-pointer transition-colors/g, 'transition-colors');
content = content.replace(/hover:bg-neutral-50\/50 dark:hover:bg-mine-900\/30 /g, '');
content = content.replace(/hover:bg-neutral-100 dark:hover:bg-mine-800\/60 /g, '');

// For buttons, let's inject disabled and opacity-50 cursor-not-allowed into their class names
function disableButton(text) {
    const regex = new RegExp(`onClick=\\{\\(\\) => handleAction\\("${text}"\\)\\}([^>]+className=")([^"]+)(")`, 'g');
    content = content.replace(regex, `disabled title="Feature coming soon" $1$2 opacity-50 cursor-not-allowed"`);
    
    // Fallback if className is before onClick
    const regex2 = new RegExp(`(className="[^"]+)(")([^>]+)onClick=\\{\\(\\) => handleAction\\("${text}"\\)\\}`, 'g');
    content = content.replace(regex2, `$1 opacity-50 cursor-not-allowed"$3 disabled title="Feature coming soon"`);
}

disableButton("View Compliance");
disableButton("View Risk");
disableButton("Search");
disableButton("Add Project");
disableButton("Import Data");

fs.writeFileSync(file, content, 'utf8');
