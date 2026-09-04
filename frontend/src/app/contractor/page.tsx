"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Mail, Command, Plus, ArrowUpRight, 
  LayoutDashboard, FileText, Settings, HelpCircle, LogOut, 
  HardHat, FileSignature, Truck, Bomb, MessageSquare, Video, User
} from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

// --- INITIAL DATA CONSTANTS ---

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "licenses", label: "Licenses & Certs", icon: FileSignature },
  { id: "machinery", label: "Machinery Register", icon: Truck },
  { id: "daily_log", label: "Daily Work Log", icon: FileText },
  { id: "explosives", label: "Explosives Stock", icon: Bomb },
  { id: "roster", label: "Worker Roster", icon: HardHat },
  { id: "requests", label: "Requests", icon: MessageSquare },
];

const generalItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "logout", label: "Logout", icon: LogOut },
];

const initialProjectsData = [
  { id: 1, title: "Blast Planning - Pit A", date: "Nov 26, 2026", icon: Bomb, colorClass: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: 2, title: "Haulage Optimization", date: "Nov 28, 2026", icon: Truck, colorClass: "text-mine-700 bg-mine-100 dark:bg-mine-800/50 dark:text-mine-300" },
  { id: 3, title: "License Renewal", date: "Nov 30, 2026", icon: FileSignature, colorClass: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: 4, title: "Worker Induction", date: "Dec 5, 2026", icon: HardHat, colorClass: "text-orange-500 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400" },
];

const initialTeamData = [
  { id: 1, name: "Alexandra Deff", initials: "AD", task: "Explosives Inventory", status: "Completed", 
    avatarClass: "bg-pink-100 text-pink-700 border-pink-50 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-900/50", 
    badgeClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
  { id: 2, name: "Edwin Adenike", initials: "EA", task: "Machinery Servicing", status: "In Progress", 
    avatarClass: "bg-lime-100 text-lime-700 border-lime-50 dark:bg-lime-900/30 dark:text-lime-400 dark:border-lime-900/50", 
    badgeClass: "bg-amber-50 text-amber-600 border-amber-100/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" },
  { id: 3, name: "Isaac Oluwatemilorun", initials: "IO", task: "Safety Compliance Report", status: "Pending", 
    avatarClass: "bg-blue-100 text-blue-700 border-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50", 
    badgeClass: "bg-red-50 text-red-600 border-red-100/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50" },
  { id: 4, name: "David Oshodi", initials: "DO", task: "Daily Work Log Entry", status: "In Progress", 
    avatarClass: "bg-orange-100 text-orange-700 border-orange-50 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900/50", 
    badgeClass: "bg-amber-50 text-amber-600 border-amber-100/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" },
];

const initialLicensesData = [
  { id: 1, document: "Contract Labour License", holder: "CL-2026-0417", expiry: "30 Nov 2026", status: "Valid", statusClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
  { id: 2, document: "Blaster's Certificate (DGMS)", holder: "R. Sharma — BC-11894", expiry: "12 Sep 2026", status: "18 days left", statusClass: "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" },
  { id: 3, document: "Explosives License", holder: "EXP-WB-2291", expiry: "05 Oct 2026", status: "Valid", statusClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
];

const initialMachineryData = [
  { id: 1, machine: "Hydraulic Excavator (x5)", ownership: "Owned", lastServiced: "02 Aug 2026", nextDue: "02 Nov 2026", status: "Active", statusClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
  { id: 2, machine: "Drilling Machine", ownership: "Owned", lastServiced: "14 Jul 2026", nextDue: "14 Sep 2026", status: "Due soon", statusClass: "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" },
  { id: 3, machine: "Dumper / Tipper (30–35T) x8", ownership: "Rented", lastServiced: "20 Aug 2026", nextDue: "20 Nov 2026", status: "Active", statusClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
  { id: 4, machine: "Water Tanker (x3)", ownership: "Owned", lastServiced: "10 Jun 2026", nextDue: "10 Sep 2026", status: "Overdue", statusClass: "bg-red-50 text-red-600 border-red-200/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50" },
];

const initialExplosivesData = [
  { id: 1, type: "Site-mix emulsion", procured: "2,400 kg", used: "2,180 kg", remaining: "220 kg" },
  { id: 2, type: "Detonators", procured: "600 units", used: "540 units", remaining: "60 units" },
];

const initialWorkerRosterData = [
  { id: "Worker #0114", training: "Complete", trainingClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700", ppe: "Yes", ppeClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
  { id: "Worker #0115", training: "Missing", trainingClass: "bg-red-50 text-red-600 border-red-200/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50", ppe: "Yes", ppeClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
  { id: "Worker #0116", training: "Complete", trainingClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700", ppe: "Pending", ppeClass: "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" },
];

const initialRequestsData = [
  { id: 1, task: "Requesting water tanker refill, Zone B", time: "Today, 09:12", status: "Open", statusClass: "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" },
  { id: 2, task: "Extension request — 2 days, weather delay", time: "Yesterday", status: "Approved", statusClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
];

const initialDailyStats = [
  { value: "3", label: "Blasting rounds fired today" },
  { value: "1,240 m²", label: "Area covered today" }
];

const initialDailyLogs = [
  { id: 1, text: "Round #3 fired, Zone B", meta: "14:20 · Logged by R. Sharma" },
  { id: 2, text: "Round #2 fired, Zone B", meta: "11:05 · Logged by R. Sharma" }
];

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
  actionTab?: string;
  actionLabel?: string;
}

export interface AppMessage {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
}

const initialNotifications: AppNotification[] = [
  { id: "n1", type: "Safety", title: "High-risk safety violation detected", message: "Worker spotted without proper PPE near blasting zone.", severity: "CRITICAL", timestamp: "10 mins ago", read: false, actionTab: "requests", actionLabel: "Review Violation →" },
  { id: "n2", type: "Compliance", title: "Safety certificate expires in 7 days", message: "Blaster's Certificate for R. Sharma is nearing expiration.", severity: "WARNING", timestamp: "2 hours ago", read: false, actionTab: "licenses", actionLabel: "View Document →" },
  { id: "n3", type: "System", title: "Weekly Summary Available", message: "Your weekly performance and safety summary is ready to view.", severity: "INFO", timestamp: "Yesterday", read: true },
  { id: "n4", type: "Inspection", title: "New inspection assigned", message: "Site inspector arrival scheduled for tomorrow 9 AM.", severity: "SYSTEM", timestamp: "Yesterday", read: true },
];

const initialMessages: AppMessage[] = [
  { id: "m1", sender: "Admin Office", subject: "Urgent: License Verification", preview: "Please submit the updated Contract Labour License by Friday.", timestamp: "10:30 AM", read: false },
  { id: "m2", sender: "Site Supervisor", subject: "Shift Change Request", preview: "David Oshodi is requesting a shift change for next week.", timestamp: "Yesterday", read: false },
  { id: "m3", sender: "Maintenance Team", subject: "Excavator Service Complete", preview: "Hydraulic Excavator #3 has been serviced and is back on site.", timestamp: "Yesterday", read: true },
];


export default function ContractorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // --- COMPONENT STATES ---
  const [projects, setProjects] = useState(initialProjectsData);
  const [team, setTeam] = useState(initialTeamData);
  const [licenses, setLicenses] = useState(initialLicensesData);
  const [machinery, setMachinery] = useState(initialMachineryData);
  const [explosives, setExplosives] = useState(initialExplosivesData);
  const [workers, setWorkers] = useState(initialWorkerRosterData);
  const [requests, setRequests] = useState(initialRequestsData);
  const [dailyLogs, setDailyLogs] = useState(initialDailyLogs);

  // --- MODAL STATES ---
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isUploadLicenseOpen, setIsUploadLicenseOpen] = useState(false);
  const [isRegisterMachineOpen, setIsRegisterMachineOpen] = useState(false);
  const [isNewLogOpen, setIsNewLogOpen] = useState(false);
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // --- HEADER POPOVER STATES ---
  const [isMailOpen, setIsMailOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // --- NOTIFICATION & MESSAGE STATES ---
  const [appNotifications, setAppNotifications] = useState(initialNotifications);
  const [appMessages, setAppMessages] = useState(initialMessages);
  
  // --- PROFILE & SETTINGS STATES ---
  const [profileName, setProfileName] = useState("ABC Infra");
  const [profileDesignation, setProfileDesignation] = useState("Contractor / Lead Entity");
  const [profileCompany, setProfileCompany] = useState("ABC Infra Ltd.");
  const [profileLocation, setProfileLocation] = useState("Pit A, Sector 4");
  const [profileAddress, setProfileAddress] = useState("123 Mining Road, Industrial Area");

  const [toastMessage, setToastMessage] = useState("");
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [helpMessage, setHelpMessage] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("abc@minesight.com");
  const [settingsPhone, setSettingsPhone] = useState("+1 234 567 8900");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [notifSafety, setNotifSafety] = useState({ email: true, sms: true });
  const [notifCompliance, setNotifCompliance] = useState({ email: true, sms: true });
  const [notifBlasting, setNotifBlasting] = useState({ email: true, sms: true });
  const [notifDaily, setNotifDaily] = useState({ email: true, sms: false });
  const [notifWeekly, setNotifWeekly] = useState({ email: true, sms: false });
  const [notifSystem, setNotifSystem] = useState({ email: true, sms: false });

  // --- FORM INPUT STATES ---
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDate, setNewProjectDate] = useState("");
  
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberTask, setNewMemberTask] = useState("");
  
  const [newLicenseDoc, setNewLicenseDoc] = useState("");
  const [newLicenseHolder, setNewLicenseHolder] = useState("");
  const [newLicenseExpiry, setNewLicenseExpiry] = useState("");
  
  const [newMachineName, setNewMachineName] = useState("");
  const [newMachineOwnership, setNewMachineOwnership] = useState("");
  const [newMachineNextDue, setNewMachineNextDue] = useState("");
  
  const [newLogDesc, setNewLogDesc] = useState("");
  const [newLogAuthor, setNewLogAuthor] = useState("");
  
  const [newExplosiveType, setNewExplosiveType] = useState("");
  const [newExplosiveProcured, setNewExplosiveProcured] = useState("");
  const [newExplosiveUsed, setNewExplosiveUsed] = useState("");
  
  const [newWorkerId, setNewWorkerId] = useState("");
  const [newWorkerTraining, setNewWorkerTraining] = useState("");
  const [newWorkerPPE, setNewWorkerPPE] = useState("");
  
  const [newRequestTask, setNewRequestTask] = useState("");

  const closePopovers = () => {
    setIsMailOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
  };

  const unreadMailCount = appMessages.filter(m => !m.read).length;
  const unreadNotifCount = appNotifications.filter(n => !n.read).length;

  const markAllNotifsRead = () => {
    setAppNotifications(appNotifications.map(n => ({...n, read: true})));
  };

  const markNotifRead = (id: string) => {
    setAppNotifications(appNotifications.map(n => n.id === id ? {...n, read: true} : n));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopovers();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAction = (actionName: string) => {
    closePopovers(); // Close popovers on any navigation
    switch(actionName) {
      case "Add Project":
      case "New Project":
        setIsAddProjectOpen(true);
        break;
      case "Add Team Member":
      case "Add Member":
        setIsAddMemberOpen(true);
        break;
      case "Upload New License":
      case "Upload":
        setIsUploadLicenseOpen(true);
        break;
      case "Register Machine":
        setIsRegisterMachineOpen(true);
        break;
      case "New Log Entry":
        setIsNewLogOpen(true);
        break;
      case "Update Stock":
        setIsUpdateStockOpen(true);
        break;
      case "Add Worker":
        setIsAddWorkerOpen(true);
        break;
      case "New Request":
        setIsNewRequestOpen(true);
        break;
      case "Logout":
        router.push("/");
        break;
      case "Help":
        setIsHelpOpen(true);
        break;
      case "User Profile":
      case "Profile":
        setActiveTab("profile");
        break;
      case "Settings":
        setActiveTab("settings");
        break;
      default:
        alert(`${actionName} action triggered! (Dummy Data)`);
    }
  };

  // --- FORM SUBMIT HANDLERS ---
  const submitAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle || !newProjectDate) return;
    setProjects([
      { id: Date.now(), title: newProjectTitle, date: newProjectDate, icon: LayoutDashboard, colorClass: "text-mine-700 bg-mine-100 dark:bg-mine-800/50 dark:text-mine-300" },
      ...projects
    ]);
    setIsAddProjectOpen(false);
    setNewProjectTitle("");
    setNewProjectDate("");
  };

  const submitAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberTask) return;
    setTeam([
      { id: Date.now(), name: newMemberName, initials: newMemberName.substring(0, 2).toUpperCase(), task: newMemberTask, status: "Just Assigned", 
        avatarClass: "bg-mine-100 text-mine-700 border-mine-50 dark:bg-mine-900/30 dark:text-mine-400 dark:border-mine-900/50", 
        badgeClass: "bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50" },
      ...team
    ]);
    setIsAddMemberOpen(false);
    setNewMemberName("");
    setNewMemberTask("");
  };

  const submitUploadLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicenseDoc || !newLicenseHolder || !newLicenseExpiry) return;
    setLicenses([
      { id: Date.now(), document: newLicenseDoc, holder: newLicenseHolder, expiry: newLicenseExpiry, status: "Pending Review", statusClass: "bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50" },
      ...licenses
    ]);
    setIsUploadLicenseOpen(false);
    setNewLicenseDoc("");
    setNewLicenseHolder("");
    setNewLicenseExpiry("");
  };

  const submitRegisterMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineName || !newMachineOwnership || !newMachineNextDue) return;
    setMachinery([
      { id: Date.now(), machine: newMachineName, ownership: newMachineOwnership, lastServiced: "Today", nextDue: newMachineNextDue, status: "Active", statusClass: "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700" },
      ...machinery
    ]);
    setIsRegisterMachineOpen(false);
    setNewMachineName("");
    setNewMachineOwnership("");
    setNewMachineNextDue("");
  };

  const submitNewLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDesc || !newLogAuthor) return;
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setDailyLogs([
      { id: Date.now(), text: newLogDesc, meta: `${timeString} · Logged by ${newLogAuthor}` },
      ...dailyLogs
    ]);
    setIsNewLogOpen(false);
    setNewLogDesc("");
    setNewLogAuthor("");
  };

  const submitUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExplosiveType || !newExplosiveProcured || !newExplosiveUsed) return;
    
    // Attempt parsing for 'remaining' if numbers are provided
    const procuredNum = parseFloat(newExplosiveProcured);
    const usedNum = parseFloat(newExplosiveUsed);
    let remaining = "N/A";
    if (!isNaN(procuredNum) && !isNaN(usedNum)) {
      remaining = (procuredNum - usedNum).toString() + (newExplosiveProcured.replace(/[0-9.]/g, ''));
    }

    setExplosives([
      { id: Date.now(), type: newExplosiveType, procured: newExplosiveProcured, used: newExplosiveUsed, remaining: remaining },
      ...explosives
    ]);
    setIsUpdateStockOpen(false);
    setNewExplosiveType("");
    setNewExplosiveProcured("");
    setNewExplosiveUsed("");
  };

  const submitAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerId || !newWorkerTraining || !newWorkerPPE) return;
    
    const getStatusClass = (status: string) => {
      const lower = status.toLowerCase();
      if (lower.includes("miss") || lower.includes("no") || lower.includes("fail")) return "bg-red-50 text-red-600 border-red-200/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
      if (lower.includes("pend") || lower.includes("wait")) return "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
      return "bg-mine-100 text-mine-800 border-mine-300 dark:bg-mine-900/50 dark:text-mine-300 dark:border-mine-700";
    };

    setWorkers([
      { id: newWorkerId, training: newWorkerTraining, trainingClass: getStatusClass(newWorkerTraining), ppe: newWorkerPPE, ppeClass: getStatusClass(newWorkerPPE) },
      ...workers
    ]);
    setIsAddWorkerOpen(false);
    setNewWorkerId("");
    setNewWorkerTraining("");
    setNewWorkerPPE("");
  };

  const submitNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestTask) return;
    setRequests([
      { id: Date.now(), task: newRequestTask, time: "Just now", status: "Open", statusClass: "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" },
      ...requests
    ]);
    setIsNewRequestOpen(false);
    setNewRequestTask("");
  };

  const submitHelpMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage) return;
    alert("Message sent to support! We will get back to you shortly.");
    setIsHelpOpen(false);
    setHelpMessage("");
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleNotificationChange = (itemLabel: string, type: 'email'|'sms', value: boolean, setter: any, state: any) => {
    setter({ ...state, [type]: value });
    showToast("Notification preferences updated");
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Action recorded (Backend pending)");
  };

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    showToast("Action recorded (Backend pending)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // ------------------------------------
  // TAB RENDERERS
  // ------------------------------------

  const renderProfile = () => (
    <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-6 mb-8 border-b border-neutral-100 dark:border-mine-800 pb-8">
        <div className="w-20 h-20 rounded-full bg-mine-100 dark:bg-mine-800 border-4 border-white dark:border-mine-900 shadow-sm overflow-hidden flex items-center justify-center text-mine-800 dark:text-mine-100 font-bold text-2xl">
          AB
        </div>
        <div>
          <h2 className="text-2xl font-bold text-mine-950 dark:text-white leading-tight">{profileName}</h2>
          <p className="text-mine-700 dark:text-mine-300 font-medium">{profileDesignation}</p>
        </div>
      </div>

      <form onSubmit={saveProfile} className="space-y-6">
        
        {/* Personal Information Card */}
        <div className="bg-white dark:bg-mine-950 p-6 rounded-[1.5rem] border border-neutral-100 dark:border-mine-800 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider border-b border-neutral-100 dark:border-mine-800 pb-2 mb-6">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="uiverse-input-container">
              <input id="profileName" type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              <label htmlFor="profileName" className="label">Full Name</label>
              <div className="underline"></div>
            </div>
            <div className="uiverse-input-container">
              <input id="profileDesignation" type="text" required value={profileDesignation} onChange={(e) => setProfileDesignation(e.target.value)} />
              <label htmlFor="profileDesignation" className="label">Designation / Role</label>
              <div className="underline"></div>
            </div>
          </div>
        </div>

        {/* Company Information Card */}
        <div className="bg-white dark:bg-mine-950 p-6 rounded-[1.5rem] border border-neutral-100 dark:border-mine-800 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider border-b border-neutral-100 dark:border-mine-800 pb-2 mb-6">Company Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <div className="uiverse-input-container md:col-span-2">
              <input id="profileCompany" type="text" required value={profileCompany} onChange={(e) => setProfileCompany(e.target.value)} />
              <label htmlFor="profileCompany" className="label">Company / Contractor Name</label>
              <div className="underline"></div>
            </div>
            <div className="uiverse-input-container">
              <input id="profileLocation" type="text" required value={profileLocation} onChange={(e) => setProfileLocation(e.target.value)} />
              <label htmlFor="profileLocation" className="label">Work Location</label>
              <div className="underline"></div>
            </div>
            <div className="uiverse-input-container">
              <input id="profileAddress" type="text" required value={profileAddress} onChange={(e) => setProfileAddress(e.target.value)} />
              <label htmlFor="profileAddress" className="label">Company Address</label>
              <div className="underline"></div>
            </div>
          </div>
          
          <div className="bg-neutral-50 dark:bg-mine-900/30 p-4 rounded-xl border border-neutral-100 dark:border-mine-800">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Account Information</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-700 dark:text-neutral-300">
              <div><p className="text-neutral-500 text-xs mb-1">Account Type</p><p className="font-medium text-mine-950 dark:text-white">Contractor</p></div>
              <div><p className="text-neutral-500 text-xs mb-1">Account ID</p><p className="font-medium text-mine-950 dark:text-white">CNT-88218E</p></div>
              <div><p className="text-neutral-500 text-xs mb-1">Joined Date</p><p className="font-medium text-mine-950 dark:text-white">Oct 12, 2025</p></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="uiverse-btn !w-auto !px-8">
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
      
      <div>
        <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-2">Account Settings</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your account preferences, notifications, and security.</p>
      </div>

      {/* ACCOUNT CARD */}
      <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-6 border-b border-neutral-100 dark:border-mine-800 pb-2">Account</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Email Address</p>
            <p className="font-medium text-mine-950 dark:text-white mb-3">{settingsEmail}</p>
            <button type="button" className="px-4 py-2 border border-neutral-200 dark:border-mine-700 text-mine-700 dark:text-mine-300 hover:bg-neutral-50 dark:hover:bg-mine-800 rounded-xl text-xs font-semibold transition-colors">Change Email</button>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Phone Number</p>
            <p className="font-medium text-mine-950 dark:text-white mb-3">{settingsPhone}</p>
            <button type="button" className="px-4 py-2 border border-neutral-200 dark:border-mine-700 text-mine-700 dark:text-mine-300 hover:bg-neutral-50 dark:hover:bg-mine-800 rounded-xl text-xs font-semibold transition-colors">Change Phone</button>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS CARD */}
      <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-6 border-b border-neutral-100 dark:border-mine-800 pb-2">Notification Preferences</h4>
        
        <div className="flex flex-col">
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-neutral-100 dark:border-mine-800 text-sm font-semibold text-neutral-500">
            <div className="col-span-8">Notification</div>
            <div className="col-span-2 text-center">Email</div>
            <div className="col-span-2 text-center">SMS</div>
          </div>
          
          <div className="divide-y divide-neutral-50 dark:divide-mine-900/50">
            {[
              { label: "Safety Alerts", state: notifSafety, setter: setNotifSafety },
              { label: "Compliance Violations", state: notifCompliance, setter: setNotifCompliance },
              { label: "Blasting Schedule", state: notifBlasting, setter: setNotifBlasting },
              { label: "Daily Reports", state: notifDaily, setter: setNotifDaily },
              { label: "Weekly Summary", state: notifWeekly, setter: setNotifWeekly },
              { label: "System Updates", state: notifSystem, setter: setNotifSystem },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 py-4 sm:items-center hover:bg-neutral-50 dark:hover:bg-mine-900/20 transition-colors">
                <div className="col-span-8 font-medium text-mine-950 dark:text-white mb-2 sm:mb-0">{item.label}</div>
                <div className="col-span-4 sm:col-span-4 flex items-center gap-6 sm:gap-0">
                  <div className="w-1/2 flex items-center justify-start sm:justify-center gap-2">
                    <span className="sm:hidden text-xs text-neutral-500 font-medium w-10">Email</span>
                    <label>
                      <input type="checkbox" className="toggle-checkbox" checked={item.state.email} onChange={(e) => handleNotificationChange(item.label, 'email', e.target.checked, item.setter, item.state)} />
                      <div className="toggle-slot">
                        <div className="sun-icon-wrapper"><div className="sun-icon"></div></div>
                        <div className="toggle-button"></div>
                        <div className="moon-icon-wrapper"><div className="moon-icon"></div></div>
                      </div>
                    </label>
                  </div>
                  <div className="w-1/2 flex items-center justify-start sm:justify-center gap-2">
                    <span className="sm:hidden text-xs text-neutral-500 font-medium w-10">SMS</span>
                    <label>
                      <input type="checkbox" className="toggle-checkbox" checked={item.state.sms} onChange={(e) => handleNotificationChange(item.label, 'sms', e.target.checked, item.setter, item.state)} />
                      <div className="toggle-slot">
                        <div className="sun-icon-wrapper"><div className="sun-icon"></div></div>
                        <div className="toggle-button"></div>
                        <div className="moon-icon-wrapper"><div className="moon-icon"></div></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECURITY CARD */}
      <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-6 border-b border-neutral-100 dark:border-mine-800 pb-2">Security</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={updatePassword} className="space-y-2">
            <p className="text-sm text-neutral-500 mb-6">Keep your account secure by regularly updating your password.</p>
            <div className="uiverse-input-container">
              <input id="currentPassword" type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <label htmlFor="currentPassword" className="label">Current Password</label>
              <div className="underline"></div>
            </div>
            <div className="uiverse-input-container">
              <input id="newPassword" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <label htmlFor="newPassword" className="label">New Password</label>
              <div className="underline"></div>
            </div>
            <div className="uiverse-input-container !mb-6">
              <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
              <div className="underline"></div>
            </div>
            <button type="submit" className="uiverse-btn !w-auto !px-8">Update Password</button>
          </form>

          <div className="bg-neutral-50 dark:bg-mine-900/30 p-5 rounded-xl border border-neutral-100 dark:border-mine-800 h-fit">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Password Requirements</p>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-2"><span className="text-mine-700 dark:text-mine-300">✓</span> At least 8 characters</li>
              <li className="flex items-center gap-2"><span className="text-mine-700 dark:text-mine-300">✓</span> One uppercase letter</li>
              <li className="flex items-center gap-2"><span className="text-mine-700 dark:text-mine-300">✓</span> One number</li>
              <li className="flex items-center gap-2"><span className="text-mine-700 dark:text-mine-300">✓</span> One special character</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2FA & SESSIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 flex flex-col">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-2 border-b border-neutral-100 dark:border-mine-800 pb-2">Two-Factor Authentication</h4>
          <p className="text-xs text-neutral-500 mb-6">Add an additional layer of protection to your account.</p>
          <div className="flex items-center justify-between mt-auto bg-neutral-50 dark:bg-mine-900/30 p-4 rounded-xl border border-neutral-100 dark:border-mine-800">
            <div>
              <p className="text-xs text-neutral-500">Status</p>
              <p className="text-sm font-semibold text-mine-950 dark:text-white">Disabled</p>
            </div>
            <button type="button" className="uiverse-btn !w-auto !px-4 !h-8 !text-xs !line-height-8 !m-0">Enable 2FA</button>
          </div>
        </div>

        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 flex flex-col">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-2 border-b border-neutral-100 dark:border-mine-800 pb-2">Active Sessions</h4>
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-mine-950 dark:text-white">MacBook · Chrome</p>
                <p className="text-xs text-mine-700 dark:text-mine-300">Last active: Now [This device]</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">iPhone · Safari</p>
                <p className="text-xs text-neutral-500">Last active: 2 hours ago</p>
              </div>
              <button type="button" className="text-xs font-semibold text-neutral-400 hover:text-mine-700 dark:hover:text-mine-300 transition-colors">Sign out</button>
            </div>
          </div>
          <button type="button" className="mt-6 text-sm font-semibold text-mine-700 dark:text-mine-300 hover:underline self-start">Sign out all other sessions</button>
        </div>
      </div>

      {/* ACCOUNT MANAGEMENT */}
      <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-6 border-b border-neutral-100 dark:border-mine-800 pb-2">Account Management</h4>
        
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-mine-950 dark:text-white">Export Account Data</p>
              <p className="text-xs text-neutral-500">Download your profile and account information.</p>
            </div>
            <button type="button" className="uiverse-btn !w-auto !px-4 !h-8 !text-xs !line-height-8 !m-0 bg-white dark:bg-mine-900">Export Data</button>
          </div>
          
          <div className="pt-4 border-t border-red-100 dark:border-red-900/30">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-4">Danger Zone</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-mine-950 dark:text-white">Deactivate Account</p>
                <p className="text-xs text-neutral-500">Temporarily disable your account.</p>
              </div>
              <button type="button" onClick={() => setIsConfirmDeactivateOpen(true)} className="px-4 py-2 border border-neutral-200 dark:border-mine-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-mine-800 rounded-xl text-xs font-semibold transition-colors">Deactivate Account</button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-mine-950 dark:text-white">Delete Account</p>
                <p className="text-xs text-neutral-500">Permanently delete your account and associated account data.</p>
              </div>
              <button type="button" onClick={() => setIsConfirmDeleteOpen(true)} className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-xs font-semibold transition-colors">Delete Account</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );

  const renderMessages = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-mine-950 rounded-3xl p-8 border border-neutral-100 dark:border-mine-900 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-mine-950 dark:text-white">Messages Inbox</h2>
        </div>
        <div className="flex flex-col gap-4">
          {appMessages.map(msg => (
            <div key={msg.id} className={`p-6 border rounded-2xl transition-all hover:shadow-md ${!msg.read ? 'bg-mine-50/50 border-mine-200 dark:bg-mine-900/20 dark:border-mine-800' : 'bg-white border-neutral-100 dark:bg-mine-950 dark:border-mine-900'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-lg ${!msg.read ? 'font-bold text-mine-950 dark:text-white' : 'font-semibold text-neutral-800 dark:text-neutral-200'}`}>{msg.subject}</h3>
                <span className="text-sm font-medium text-neutral-400">{msg.timestamp}</span>
              </div>
              <p className="text-sm font-medium text-mine-600 dark:text-mine-400 mb-4">From: {msg.sender}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{msg.preview}</p>
              
              {!msg.read && (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => setAppMessages(appMessages.map(m => m.id === msg.id ? {...m, read: true} : m))} className="text-xs font-semibold text-mine-700 dark:text-mine-300 hover:underline">Mark as read</button>
                </div>
              )}
            </div>
          ))}
          {appMessages.length === 0 && <p className="text-neutral-500 text-center py-10">Inbox is empty.</p>}
        </div>
      </div>
    </div>
  );

  const renderNotificationCenter = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-mine-950 rounded-3xl p-8 border border-neutral-100 dark:border-mine-900 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-mine-950 dark:text-white">Notification Center</h2>
          {unreadNotifCount > 0 && (
            <button onClick={markAllNotifsRead} className="uiverse-btn">Mark All as Read</button>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {appNotifications.map(notif => (
            <div key={notif.id} className={`p-6 border rounded-2xl transition-all hover:shadow-md ${!notif.read ? 'bg-mine-50/50 border-mine-200 dark:bg-mine-900/20 dark:border-mine-800' : 'bg-white border-neutral-100 dark:bg-mine-950 dark:border-mine-900'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                    notif.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                    notif.severity === 'WARNING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                    notif.severity === 'SYSTEM' ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' : 
                    'bg-mine-100 text-mine-800 dark:bg-mine-900/50 dark:text-mine-300'
                  }`}>{notif.type}</span>
                  {!notif.read && <span className="flex w-2 h-2 rounded-full bg-mine-500"></span>}
                </div>
                <span className="text-sm font-medium text-neutral-400">{notif.timestamp}</span>
              </div>
              <h3 className={`text-lg mb-2 ${!notif.read ? 'font-bold text-mine-950 dark:text-white' : 'font-semibold text-neutral-800 dark:text-neutral-200'}`}>{notif.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{notif.message}</p>
              
              <div className="flex items-center gap-4">
                {notif.actionLabel && notif.actionTab && (
                  <button onClick={() => { markNotifRead(notif.id); setActiveTab(notif.actionTab!); }} className="text-sm font-semibold text-mine-700 dark:text-mine-300 hover:underline">
                    {notif.actionLabel}
                  </button>
                )}
                {!notif.read && (
                  <button onClick={() => markNotifRead(notif.id)} className="text-sm font-semibold text-neutral-500 hover:text-mine-700 dark:hover:text-mine-300 transition-colors">Mark as read</button>
                )}
              </div>
            </div>
          ))}
          {appNotifications.length === 0 && <p className="text-neutral-500 text-center py-10">No notifications.</p>}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ended Projects */}
        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 relative group overflow-hidden flex flex-col justify-between hover:border-mine-300 dark:hover:border-mine-700 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Ended Projects</h3>
            <button 
              onClick={() => handleAction("View Ended Projects")}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-mine-800 flex items-center justify-center text-neutral-400 dark:text-mine-300 group-hover:bg-mine-100 dark:group-hover:bg-mine-800 group-hover:text-mine-800 dark:group-hover:text-white group-hover:border-mine-300 dark:group-hover:border-mine-700 transition-colors"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <div>
            <div className="text-5xl font-medium text-mine-950 dark:text-white mb-4 tracking-tighter">10</div>
            <div className="flex items-center gap-2 text-xs font-semibold text-mine-800 dark:text-mine-300">
              <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-mine-100 dark:bg-mine-800 border border-mine-300 dark:border-mine-700">
                <ArrowUpRight size={12} className="mr-0.5" /> 6%
              </span>
              <span className="text-neutral-400 dark:text-neutral-500 font-medium">Increased from last month</span>
            </div>
          </div>
        </div>

        {/* Running Projects */}
        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 relative group overflow-hidden flex flex-col justify-between hover:border-mine-300 dark:hover:border-mine-700 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Running Projects</h3>
            <button 
              onClick={() => handleAction("View Running Projects")}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-mine-800 flex items-center justify-center text-neutral-400 dark:text-mine-300 group-hover:bg-mine-100 dark:group-hover:bg-mine-800 group-hover:text-mine-800 dark:group-hover:text-white group-hover:border-mine-300 dark:group-hover:border-mine-700 transition-colors"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <div>
            <div className="text-5xl font-medium text-mine-950 dark:text-white mb-4 tracking-tighter">12</div>
            <div className="flex items-center gap-2 text-xs font-semibold text-mine-800 dark:text-mine-300">
              <span className="flex items-center justify-center px-1.5 py-0.5 rounded bg-mine-100 dark:bg-mine-800 border border-mine-300 dark:border-mine-700">
                <ArrowUpRight size={12} className="mr-0.5" /> 2%
              </span>
              <span className="text-neutral-400 dark:text-neutral-500 font-medium">Increased from last month</span>
            </div>
          </div>
        </div>

        {/* Pending Project */}
        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 relative group overflow-hidden flex flex-col justify-between hover:border-mine-300 dark:hover:border-mine-700 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Pending Project</h3>
            <button 
              onClick={() => handleAction("View Pending Projects")}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-mine-800 flex items-center justify-center text-neutral-400 dark:text-mine-300 group-hover:bg-mine-100 dark:group-hover:bg-mine-800 group-hover:text-mine-800 dark:group-hover:text-white group-hover:border-mine-300 dark:group-hover:border-mine-700 transition-colors"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <div>
            <div className="text-5xl font-medium text-mine-950 dark:text-white mb-4 tracking-tighter">2</div>
            <div className="flex items-center gap-2 text-xs font-medium text-mine-800 dark:text-mine-300">
              <span className="text-neutral-400 dark:text-neutral-500">On Discuss</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Analytics Chart */}
        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 col-span-1">
          <h3 className="text-mine-950 dark:text-white font-semibold mb-8 text-base">Project Analytics</h3>
          
          <div className="h-44 flex items-end justify-between px-2 gap-3 mb-4">
            <div className="w-full relative h-[60%] rounded-t-full opacity-40 hover:opacity-70 transition-opacity cursor-pointer" 
                 style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #235347 3px, #235347 5px)' }}
                 onClick={() => handleAction("View Sunday Analytics")}>
            </div>
            <div className="w-full relative h-[80%] bg-mine-800 dark:bg-mine-700 hover:bg-mine-700 dark:hover:bg-mine-600 transition-colors cursor-pointer rounded-t-full"
                 onClick={() => handleAction("View Monday Analytics")}></div>
            <div className="w-full relative h-[65%] bg-mine-300 hover:bg-[#a5c7b0] transition-colors cursor-pointer rounded-t-full flex justify-center"
                 onClick={() => handleAction("View Tuesday Analytics")}>
              <div className="absolute -top-8 bg-white dark:bg-mine-800 shadow-sm border border-neutral-100 dark:border-mine-700 text-[10px] font-bold px-2.5 py-1 rounded-full text-mine-800 dark:text-white">74%</div>
            </div>
            <div className="w-full relative h-[100%] bg-mine-950 dark:bg-white hover:bg-mine-900 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-t-full"
                 onClick={() => handleAction("View Wednesday Analytics")}></div>
            <div className="w-full relative h-[70%] rounded-t-full opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
                 style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #235347 3px, #235347 5px)' }}
                 onClick={() => handleAction("View Thursday Analytics")}>
            </div>
            <div className="w-full relative h-[50%] rounded-t-full opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
                 style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #235347 3px, #235347 5px)' }}
                 onClick={() => handleAction("View Friday Analytics")}>
            </div>
            <div className="w-full relative h-[65%] rounded-t-full opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
                 style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #235347 3px, #235347 5px)' }}
                 onClick={() => handleAction("View Saturday Analytics")}>
            </div>
          </div>
          <div className="flex justify-between px-3 text-xs font-bold text-neutral-300 dark:text-neutral-600">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>
        </div>

        {/* Reminders */}
        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 col-span-1 flex flex-col">
          <h3 className="text-mine-950 dark:text-white font-semibold mb-6 text-base">Reminders</h3>
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="text-[22px] font-bold text-mine-900 dark:text-mine-100 mb-2 leading-tight">Safety Briefing<br/>Meeting</h4>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium mb-8">Time : 02.00 pm - 04.00 pm</p>
            
            <button 
              onClick={() => handleAction("Start Meeting")}
              className="uiverse-btn w-full mt-auto"
            >
              <Video size={18} /> Start Meeting
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Project</h3>
            <button 
              onClick={() => handleAction("New Project")}
              className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-mine-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-mine-100 dark:hover:bg-mine-800 hover:text-mine-800 dark:hover:text-white hover:border-mine-300 dark:hover:border-mine-700 transition-colors uppercase tracking-wide"
            >
              <Plus size={12} /> New
            </button>
          </div>
          
          <div className="space-y-5">
            {projects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => handleAction(`Open Project: ${project.title}`)}
                className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 hover:bg-neutral-50 dark:hover:bg-mine-900/50 rounded-xl transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${project.colorClass}`}>
                  <project.icon size={18} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-mine-950 dark:text-white leading-tight mb-0.5 group-hover:text-mine-700 dark:group-hover:text-mine-300 transition-colors">{project.title}</h4>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Due date: {project.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM ROW (Team Collaboration) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Team Collaboration</h3>
            <button 
              onClick={() => handleAction("Add Team Member")}
              className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-mine-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-mine-100 dark:hover:bg-mine-800 hover:text-mine-800 dark:hover:text-white hover:border-mine-300 dark:hover:border-mine-700 transition-colors uppercase tracking-wide"
            >
              <Plus size={12} /> Add Member
            </button>
          </div>

          <div className="space-y-2">
            {team.map((member) => (
              <div 
                key={member.id}
                onClick={() => handleAction(`View Member Profile: ${member.name}`)}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-2 hover:bg-neutral-50 dark:hover:bg-mine-900/50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-neutral-100 dark:hover:border-mine-800"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border ${member.avatarClass} group-hover:scale-105 transition-transform`}>
                    {member.initials}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-mine-950 dark:text-white mb-0.5 group-hover:text-mine-700 dark:group-hover:text-mine-300 transition-colors">{member.name}</h4>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Working on <span className="font-bold text-mine-900 dark:text-mine-100 group-hover:text-mine-700 dark:group-hover:text-mine-300 transition-colors">{member.task}</span></p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${member.badgeClass}`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLicenses = () => (
    <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Licenses & Certificates</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage and track compliance documents for your contract.</p>
        </div>
        <button onClick={() => handleAction("Upload New License")} className="uiverse-btn">
          <Plus size={16} /> Upload
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-mine-800/50">
            <tr>
              <th className="pb-4 font-semibold uppercase tracking-wide">Document</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">Expiry</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-mine-800/50">
            {licenses.map((item, idx) => (
              <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-mine-900/30 cursor-pointer transition-colors" onClick={() => handleAction(`View License: ${item.document}`)}>
                <td className="py-4 pr-4">
                  <div className="font-semibold text-mine-950 dark:text-white">{item.document}</div>
                  <div className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-1">{item.holder}</div>
                </td>
                <td className="py-4 text-neutral-600 dark:text-neutral-300 font-medium">{item.expiry}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded border uppercase tracking-wider ${item.statusClass}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMachinery = () => (
    <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Machinery Register</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Track all active machinery, ownership, and maintenance schedules.</p>
        </div>
        <button onClick={() => handleAction("Register Machine")} className="uiverse-btn">
          <Plus size={16} /> Register
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-mine-800/50">
            <tr>
              <th className="pb-4 font-semibold uppercase tracking-wide">Machine</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">Ownership</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">Last Serviced</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-mine-800/50">
            {machinery.map((item, idx) => (
              <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-mine-900/30 cursor-pointer transition-colors" onClick={() => handleAction(`View Machine: ${item.machine}`)}>
                <td className="py-4 pr-4 font-semibold text-mine-950 dark:text-white">{item.machine}</td>
                <td className="py-4 text-neutral-600 dark:text-neutral-300 font-medium">{item.ownership}</td>
                <td className="py-4">
                  <div className="text-mine-900 dark:text-mine-100 font-medium">{item.lastServiced}</div>
                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">Next: {item.nextDue}</div>
                </td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded border uppercase tracking-wider ${item.statusClass}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDailyLog = () => (
    <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Daily Work Log</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Review task-specific output metrics for the current day.</p>
        </div>
        <button onClick={() => handleAction("New Log Entry")} className="uiverse-btn">
          <Plus size={16} /> Log Entry
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {initialDailyStats.map((stat, idx) => (
          <div key={idx} className="bg-mine-50/50 dark:bg-mine-900/30 border border-mine-100 dark:border-mine-800 rounded-[1rem] p-5">
            <div className="text-3xl font-bold text-mine-800 dark:text-mine-100 mb-1 tracking-tight">{stat.value}</div>
            <div className="text-xs font-semibold text-mine-700 dark:text-mine-300 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-2">Recent Logs</h4>
        {dailyLogs.map((log) => (
          <div key={log.id} className="p-4 border border-neutral-100 dark:border-mine-800 rounded-[1rem] hover:bg-neutral-50 dark:hover:bg-mine-900/30 transition-colors cursor-pointer" onClick={() => handleAction(`View Log: ${log.text}`)}>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-mine-100 dark:bg-mine-800 text-mine-700 dark:text-mine-300 flex items-center justify-center shrink-0">
                <FileText size={14} />
              </div>
              <div>
                <p className="text-sm font-semibold text-mine-950 dark:text-white mb-1">{log.text}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">{log.meta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExplosives = () => (
    <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Explosives Stock Register</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Track explosives procured, used, and remaining in stock.</p>
        </div>
        <button onClick={() => handleAction("Update Stock")} className="uiverse-btn">
          <Plus size={16} /> Update Stock
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-mine-800/50">
            <tr>
              <th className="pb-4 font-semibold uppercase tracking-wide">Type</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">Procured</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">Used</th>
              <th className="pb-4 font-semibold uppercase tracking-wide text-right">Left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-mine-800/50">
            {explosives.map((item, idx) => (
              <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-mine-900/30 cursor-pointer transition-colors" onClick={() => handleAction(`View Explosive: ${item.type}`)}>
                <td className="py-4 pr-4 font-semibold text-mine-950 dark:text-white">{item.type}</td>
                <td className="py-4 text-neutral-600 dark:text-neutral-300 font-medium">{item.procured}</td>
                <td className="py-4 text-neutral-600 dark:text-neutral-300 font-medium">{item.used}</td>
                <td className="py-4 text-mine-800 dark:text-mine-100 font-bold text-right text-base">{item.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRoster = () => (
    <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Worker Roster</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Monitor active workers, safety training, and PPE issuance.</p>
        </div>
        <button onClick={() => handleAction("Add Worker")} className="uiverse-btn">
          <Plus size={16} /> Add Worker
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-mine-800/50">
            <tr>
              <th className="pb-4 font-semibold uppercase tracking-wide">Worker ID</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">Training</th>
              <th className="pb-4 font-semibold uppercase tracking-wide">PPE Issued</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50 dark:divide-mine-800/50">
            {workers.map((item, idx) => (
              <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-mine-900/30 cursor-pointer transition-colors" onClick={() => handleAction(`View Worker: ${item.id}`)}>
                <td className="py-4 pr-4 font-semibold text-mine-950 dark:text-white">{item.id}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded border uppercase tracking-wider ${item.trainingClass}`}>{item.training}</span>
                </td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 text-[11px] font-bold rounded border uppercase tracking-wider ${item.ppeClass}`}>{item.ppe}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="bg-white dark:bg-mine-950 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Supervisor Requests</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Track and respond to formal requests and approvals.</p>
        </div>
        <button onClick={() => handleAction("New Request")} className="uiverse-btn">
          <Plus size={16} /> New Request
        </button>
      </div>
      <div className="space-y-4">
        {requests.map((req, idx) => (
          <div key={idx} className="p-4 border border-neutral-100 dark:border-mine-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-mine-900/30 cursor-pointer transition-colors" onClick={() => handleAction(`View Request: ${req.task}`)}>
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-semibold text-mine-950 dark:text-white leading-tight">{req.task}</p>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider border ${req.statusClass}`}>{req.status}</span>
            </div>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">{req.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ------------------------------------
  // MAIN COMPONENT RENDER
  // ------------------------------------

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-mine-950 transition-colors duration-300 flex font-sans text-neutral-900 dark:text-neutral-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-mine-950 dark:bg-white text-white dark:text-mine-950 px-6 py-3 rounded-full shadow-lg font-medium text-sm flex items-center gap-3 border border-white/10 dark:border-mine-950/10">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {toastMessage}
          </div>
        </div>
      )}

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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === item.id 
                    ? "bg-mine-700 text-white shadow-sm shadow-mine-700/20" 
                    : "text-neutral-500 dark:text-neutral-400 hover:text-mine-950 dark:hover:text-white hover:bg-mine-100/50 dark:hover:bg-mine-900/50"
                }`}
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
                onClick={() => handleAction(item.label)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-500 dark:text-neutral-400 hover:text-mine-950 dark:hover:text-white hover:bg-mine-100/50 dark:hover:bg-mine-900/50 rounded-xl font-medium transition-colors"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
        {/* TOPBAR */}
        <header className="sticky top-0 bg-[#f3f4f6]/80 dark:bg-neutral-950/80 backdrop-blur-md z-10 px-8 py-4 flex items-center justify-between border-b border-transparent dark:border-mine-900 transition-colors">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={18} />
            <input 
              type="text" 
              placeholder="Search task" 
              className="w-full pl-10 pr-12 py-2.5 bg-white dark:bg-mine-900 border border-neutral-200/50 dark:border-mine-800 rounded-full text-sm font-medium text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-300 shadow-sm placeholder:text-neutral-400 dark:placeholder:text-mine-300/50 transition-colors"
            />
            <button 
              onClick={() => handleAction("Search")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 dark:bg-mine-800 rounded text-xs text-neutral-400 dark:text-mine-300 font-bold border border-neutral-200 dark:border-mine-700 hover:bg-neutral-200 dark:hover:bg-mine-700 transition-colors"
            >
              <Command size={12} /> F
            </button>
          </div>
          
          <div className="flex items-center gap-5 relative">
            
            {/* INVISIBLE OVERLAY TO CLOSE POPOVERS */}
            {(isMailOpen || isNotifOpen || isProfileOpen) && (
              <div className="fixed inset-0 z-40" onClick={closePopovers}></div>
            )}

            <ThemeToggle />
            
            {/* MAIL POPOVER CONTAINER */}
            <div className="relative z-50">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsNotifOpen(false); setIsProfileOpen(false); setIsMailOpen(!isMailOpen); }}
                className={`relative p-2.5 rounded-full shadow-sm border border-neutral-200/50 dark:border-mine-800 transition-colors ${isMailOpen ? 'bg-mine-100 dark:bg-mine-800 text-mine-800 dark:text-white' : 'bg-white dark:bg-mine-900 text-neutral-500 dark:text-mine-300 hover:text-mine-700 dark:hover:text-white'}`}
              >
                <Mail size={18} />
                {unreadMailCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-mine-900"></span>}
              </button>

              {isMailOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-mine-950 border border-neutral-200 dark:border-mine-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-mine-800">
                    <h3 className="font-bold text-sm text-mine-950 dark:text-white">Messages</h3>
                    <button onClick={() => { closePopovers(); setActiveTab("messages"); }} className="text-xs font-semibold text-mine-700 dark:text-mine-300 hover:underline">View all</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-neutral-50 dark:divide-mine-900/50">
                    {appMessages.slice(0, 4).map((msg) => (
                      <button key={msg.id} onClick={() => { closePopovers(); setActiveTab("messages"); }} className={`w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-mine-900/30 transition-colors ${!msg.read ? 'bg-mine-50/50 dark:bg-mine-900/20' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${!msg.read ? 'font-bold text-mine-950 dark:text-white' : 'font-medium text-neutral-700 dark:text-neutral-300'}`}>{msg.sender}</p>
                          <span className="text-[10px] font-medium text-neutral-400">{msg.timestamp}</span>
                        </div>
                        <p className={`text-xs truncate ${!msg.read ? 'font-semibold text-mine-800 dark:text-mine-100' : 'text-neutral-500 dark:text-neutral-400'}`}>{msg.subject}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-1">{msg.preview}</p>
                      </button>
                    ))}
                    {appMessages.length === 0 && <div className="p-8 text-center text-sm text-neutral-500">No messages</div>}
                  </div>
                </div>
              )}
            </div>

            {/* NOTIFICATIONS POPOVER CONTAINER */}
            <div className="relative z-50">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMailOpen(false); setIsProfileOpen(false); setIsNotifOpen(!isNotifOpen); }}
                className={`relative p-2.5 rounded-full shadow-sm border border-neutral-200/50 dark:border-mine-800 transition-colors ${isNotifOpen ? 'bg-mine-100 dark:bg-mine-800 text-mine-800 dark:text-white' : 'bg-white dark:bg-mine-900 text-neutral-500 dark:text-mine-300 hover:text-mine-700 dark:hover:text-white'}`}
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-mine-900"></span>}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-mine-950 border border-neutral-200 dark:border-mine-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-mine-800 bg-neutral-50/50 dark:bg-mine-900/10">
                    <h3 className="font-bold text-sm text-mine-950 dark:text-white flex items-center gap-2">Notifications {unreadNotifCount > 0 && <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{unreadNotifCount}</span>}</h3>
                    <div className="flex items-center gap-4">
                      {unreadNotifCount > 0 && <button onClick={markAllNotifsRead} className="text-xs font-semibold text-mine-700 dark:text-mine-300 hover:underline">Mark all read</button>}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto divide-y divide-neutral-50 dark:divide-mine-900/50">
                    {appNotifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className={`p-4 hover:bg-neutral-50 dark:hover:bg-mine-900/30 transition-colors ${!notif.read ? 'bg-mine-50/50 dark:bg-mine-900/20' : ''}`}>
                        <div className="flex gap-3">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-mine-500' : 'bg-transparent'}`}></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                notif.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                                notif.severity === 'WARNING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                                notif.severity === 'SYSTEM' ? 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' : 
                                'bg-mine-100 text-mine-800 dark:bg-mine-900/50 dark:text-mine-300'
                              }`}>{notif.type}</span>
                              <span className="text-[10px] font-medium text-neutral-400">{notif.timestamp}</span>
                            </div>
                            <p className={`text-sm mb-1 ${!notif.read ? 'font-bold text-mine-950 dark:text-white' : 'font-medium text-neutral-800 dark:text-neutral-200'}`}>{notif.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">{notif.message}</p>
                            
                            {notif.actionLabel && notif.actionTab && (
                              <button onClick={() => { markNotifRead(notif.id); closePopovers(); setActiveTab(notif.actionTab!); }} className="text-xs font-semibold text-mine-700 dark:text-mine-300 hover:underline flex items-center gap-1">
                                {notif.actionLabel}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {appNotifications.length === 0 && <div className="p-8 text-center text-sm text-neutral-500">All caught up!</div>}
                  </div>
                  <div className="p-3 border-t border-neutral-100 dark:border-mine-800 text-center bg-neutral-50/50 dark:bg-mine-900/10">
                    <button onClick={() => { closePopovers(); setActiveTab("notification_center"); }} className="text-xs font-bold text-mine-950 dark:text-white hover:underline">View Notification Center</button>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE MENU POPOVER CONTAINER */}
            <div className="relative z-50">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMailOpen(false); setIsNotifOpen(false); setIsProfileOpen(!isProfileOpen); }}
                className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity text-left"
              >
                <div className="w-10 h-10 rounded-full bg-mine-100 dark:bg-mine-800 border-2 border-white dark:border-mine-900 shadow-sm overflow-hidden flex items-center justify-center text-mine-800 dark:text-mine-100 font-bold">
                  AB
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-mine-950 dark:text-white leading-none">ABC Infra</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">abc@minesight.com</p>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-mine-950 border border-neutral-200 dark:border-mine-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-2">
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-mine-800 mb-2 sm:hidden">
                    <p className="text-sm font-bold text-mine-950 dark:text-white leading-none">ABC Infra</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">abc@minesight.com</p>
                  </div>
                  <button onClick={() => { closePopovers(); setActiveTab("profile"); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-mine-900/50 transition-colors flex items-center gap-3">
                    <User size={16} /> View Profile
                  </button>
                  <button onClick={() => { closePopovers(); setActiveTab("settings"); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-mine-900/50 transition-colors flex items-center gap-3">
                    <Settings size={16} /> Account Settings
                  </button>
                  <div className="h-px bg-neutral-100 dark:bg-mine-800 my-2"></div>
                  <button onClick={() => { closePopovers(); handleAction("Logout"); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="px-8 pb-12 pt-4 w-full">
          
          {/* DYNAMIC HEADER SECTION BASED ON TAB */}
          {activeTab === "overview" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <h1 className="text-3xl font-bold text-mine-950 dark:text-white mb-1.5 tracking-tight">Dashboard</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Plan, prioritize, and accomplish your tasks with ease.</p>
              </div>
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <button 
                  onClick={() => handleAction("Add Project")}
                  className="uiverse-btn"
                >
                  <Plus size={16} /> Add Project
                </button>
                <button 
                  onClick={() => handleAction("Import Data")}
                  className="uiverse-btn"
                >
                  Import Data
                </button>
              </div>
            </div>
          )}

          {/* RENDER ACTIVE TAB CONTENT */}
          {activeTab === "overview" && renderOverview()}
          {activeTab === "messages" && renderMessages()}
          {activeTab === "notification_center" && renderNotificationCenter()}
          {activeTab === "licenses" && renderLicenses()}
          {activeTab === "machinery" && renderMachinery()}
          {activeTab === "daily_log" && renderDailyLog()}
          {activeTab === "explosives" && renderExplosives()}
          {activeTab === "roster" && renderRoster()}
          {activeTab === "requests" && renderRequests()}
          {activeTab === "profile" && renderProfile()}
          {activeTab === "settings" && renderSettings()}

        </div>
      </main>

      {/* MODALS */}
      
      {/* 1. ADD PROJECT MODAL */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">Add New Project</h2>
            <form onSubmit={submitAddProject}>
              <div className="uiverse-input-container">
                <input type="text" required value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} />
                <label className="label">Project Title</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newProjectDate} onChange={(e) => setNewProjectDate(e.target.value)} />
                <label className="label">Expected Due Date</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-10">
                <button type="button" onClick={() => setIsAddProjectOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD MEMBER MODAL */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">Add Team Member</h2>
            <form onSubmit={submitAddMember}>
              <div className="uiverse-input-container">
                <input type="text" required value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
                <label className="label">Full Name</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newMemberTask} onChange={(e) => setNewMemberTask(e.target.value)} />
                <label className="label">Assigned Task</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-10">
                <button type="button" onClick={() => setIsAddMemberOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. UPLOAD LICENSE MODAL */}
      {isUploadLicenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">Upload License</h2>
            <form onSubmit={submitUploadLicense}>
              <div className="uiverse-input-container">
                <input type="text" required value={newLicenseDoc} onChange={(e) => setNewLicenseDoc(e.target.value)} />
                <label className="label">Document Type/Name</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newLicenseHolder} onChange={(e) => setNewLicenseHolder(e.target.value)} />
                <label className="label">Holder Details (Name / ID)</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newLicenseExpiry} onChange={(e) => setNewLicenseExpiry(e.target.value)} />
                <label className="label">Expiry Date</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-10">
                <button type="button" onClick={() => setIsUploadLicenseOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. REGISTER MACHINE MODAL */}
      {isRegisterMachineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">Register Machine</h2>
            <form onSubmit={submitRegisterMachine}>
              <div className="uiverse-input-container">
                <input type="text" required value={newMachineName} onChange={(e) => setNewMachineName(e.target.value)} />
                <label className="label">Machine Name/Type</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newMachineOwnership} onChange={(e) => setNewMachineOwnership(e.target.value)} />
                <label className="label">Ownership (Owned/Rented)</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newMachineNextDue} onChange={(e) => setNewMachineNextDue(e.target.value)} />
                <label className="label">Next Service Due</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-10">
                <button type="button" onClick={() => setIsRegisterMachineOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. NEW LOG ENTRY MODAL */}
      {isNewLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">New Log Entry</h2>
            <form onSubmit={submitNewLog}>
              <div className="uiverse-input-container">
                <input type="text" required value={newLogDesc} onChange={(e) => setNewLogDesc(e.target.value)} />
                <label className="label">Activity Description</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newLogAuthor} onChange={(e) => setNewLogAuthor(e.target.value)} />
                <label className="label">Your Name</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-10">
                <button type="button" onClick={() => setIsNewLogOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Log Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. UPDATE STOCK MODAL */}
      {isUpdateStockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">Update Explosives Stock</h2>
            <form onSubmit={submitUpdateStock}>
              <div className="uiverse-input-container">
                <input type="text" required value={newExplosiveType} onChange={(e) => setNewExplosiveType(e.target.value)} />
                <label className="label">Explosive Type</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newExplosiveProcured} onChange={(e) => setNewExplosiveProcured(e.target.value)} />
                <label className="label">Total Procured (e.g. 1000 kg)</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newExplosiveUsed} onChange={(e) => setNewExplosiveUsed(e.target.value)} />
                <label className="label">Total Used (e.g. 200 kg)</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-10">
                <button type="button" onClick={() => setIsUpdateStockOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. ADD WORKER MODAL */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">Add Worker to Roster</h2>
            <form onSubmit={submitAddWorker}>
              <div className="uiverse-input-container">
                <input type="text" required value={newWorkerId} onChange={(e) => setNewWorkerId(e.target.value)} />
                <label className="label">Worker ID / Name</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newWorkerTraining} onChange={(e) => setNewWorkerTraining(e.target.value)} />
                <label className="label">Training (Complete/Missing)</label>
                <div className="underline"></div>
              </div>
              <div className="uiverse-input-container mt-8">
                <input type="text" required value={newWorkerPPE} onChange={(e) => setNewWorkerPPE(e.target.value)} />
                <label className="label">PPE (Yes/Pending)</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-10">
                <button type="button" onClick={() => setIsAddWorkerOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Add Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. NEW REQUEST MODAL */}
      {isNewRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">New Supervisor Request</h2>
            <form onSubmit={submitNewRequest}>
              <div className="uiverse-input-container">
                <input type="text" required value={newRequestTask} onChange={(e) => setNewRequestTask(e.target.value)} />
                <label className="label">Request Description</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-10">
                <button type="button" onClick={() => setIsNewRequestOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. HELP MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-lg shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-2 tracking-tight">Help & Support</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Find answers or contact the administrative team.</p>
            
            <div className="space-y-4 mb-8">
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider border-b border-neutral-100 dark:border-mine-800 pb-2">Common FAQs</h4>
              
              <div className="bg-neutral-50 dark:bg-mine-900/30 p-4 rounded-xl border border-neutral-100 dark:border-mine-800">
                <p className="font-bold text-sm text-mine-950 dark:text-white mb-1">How do I renew a license?</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Navigate to the 'Licenses &amp; Certs' tab, click 'Upload', and submit the updated document for admin approval.</p>
              </div>

              <div className="bg-neutral-50 dark:bg-mine-900/30 p-4 rounded-xl border border-neutral-100 dark:border-mine-800">
                <p className="font-bold text-sm text-mine-950 dark:text-white mb-1">My machinery shows 'Overdue'</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Please contact the maintenance bay to log a service record. The status will update once they sign off.</p>
              </div>
            </div>

            <form onSubmit={submitHelpMessage}>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-4 border-b border-neutral-100 dark:border-mine-800 pb-2">Contact Support</h4>
              <div className="uiverse-input-container">
                <input type="text" required value={helpMessage} onChange={(e) => setHelpMessage(e.target.value)} />
                <label className="label">How can we help you?</label>
                <div className="underline"></div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsHelpOpen(false)} className="px-4 py-2 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Close</button>
                <button type="submit" className="uiverse-btn !w-auto !px-6 !text-sm !h-10 !line-height-10 !m-0">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. CONFIRM DEACTIVATE MODAL */}
      {isConfirmDeactivateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200 text-center">
            <h2 className="text-xl font-bold text-mine-950 dark:text-white mb-2">Deactivate Account?</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">This will temporarily hide your profile and associated data until you sign in again.</p>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => { setIsConfirmDeactivateOpen(false); showToast("Account deactivated (Backend pending)"); }} className="px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-mine-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl text-sm font-semibold transition-colors">Yes, deactivate account</button>
              <button type="button" onClick={() => setIsConfirmDeactivateOpen(false)} className="px-4 py-3 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 11. CONFIRM DELETE MODAL */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-950 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-red-200 dark:border-red-900/50 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="font-bold text-xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-mine-950 dark:text-white mb-2">Delete Account?</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">This action is permanent and cannot be undone. All your data will be erased.</p>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => { setIsConfirmDeleteOpen(false); showToast("Account deleted (Backend pending)"); }} className="px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl text-sm font-semibold transition-colors">Yes, permanently delete</button>
              <button type="button" onClick={() => setIsConfirmDeleteOpen(false)} className="px-4 py-3 text-sm text-neutral-500 font-semibold hover:text-mine-950 dark:hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
