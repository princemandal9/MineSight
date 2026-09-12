"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Bell, Mail, Command, Plus, ArrowUpRight,
  LayoutDashboard, FileText, Settings, HelpCircle, LogOut,
  HardHat, FileSignature, Truck, Bomb, MessageSquare, Video, User, Pencil, X,
  FileCheck, CheckCircle2,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { ChangeEmailModal } from "@/components/ChangeEmailModal";
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
// --- INITIAL DATA CONSTANTS ---

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "action_center", label: "Action Center", icon: Bell },
  { id: "compliance", label: "Statutory Compliance", icon: FileCheck },
  { id: "observations", label: "Observations", icon: CheckCircle2 },
  { id: "risk", label: "Risk Intelligence", icon: FileText },
  { id: "roster", label: "Worker Roster", icon: HardHat },
];

const generalItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "logout", label: "Logout", icon: LogOut },
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

const initialDailyStats = [
  { value: "3", label: "Blasting rounds fired today" },
  { value: "1,240 m²", label: "Area covered today" }
];

const initialDailyLogs = [
  { id: 1, author: "R. Sharma", time: "14:20", desc: "Round #3 fired, Zone B" },
  { id: 2, author: "R. Sharma", time: "11:05", desc: "Round #2 fired, Zone B" }
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

const initialNotifications: AppNotification[] = [];

const initialMessages: AppMessage[] = [
  { id: "m1", sender: "Admin Office", subject: "Urgent: License Verification", preview: "Please submit the updated Contract Labour License by Friday.", timestamp: "10:30 AM", read: false },
  { id: "m2", sender: "Site Supervisor", subject: "Shift Change Request", preview: "David Oshodi is requesting a shift change for next week.", timestamp: "Yesterday", read: false },
  { id: "m3", sender: "Maintenance Team", subject: "Excavator Service Complete", preview: "Hydraulic Excavator #3 has been serviced and is back on site.", timestamp: "Yesterday", read: true },
];


export default function ContractorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined" && !auth.isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  // --- COMPONENT STATES ---
  const [licenses, setLicenses] = useState(initialLicensesData);
  const [machinery, setMachinery] = useState(initialMachineryData);
  const [explosives, setExplosives] = useState(initialExplosivesData);
  const [workers, setWorkers] = useState(initialWorkerRosterData);

  const [dailyLogs, setDailyLogs] = useState(initialDailyLogs);
  const [obligations, setObligations] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [allObservations, setAllObservations] = useState<any[]>([]);
  const [complianceRate, setComplianceRate] = useState<number>(100);
  const [riskData, setRiskData] = useState<any>(null);

  const [isNewLogOpen, setIsNewLogOpen] = useState(false);

  // --- HEADER POPOVER STATES ---
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- NOTIFICATION STATES ---
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);

  // --- PROFILE & SETTINGS STATES ---
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    companyName?: string;
    taskType?: string;
    contractorId?: string;
    contractorCode?: string;
    contractorStatus?: string;
    rejectionReason?: string;
    createdAt?: string;
  } | null>(null);

  const [profileName, setProfileName] = useState("ABC Infra");
  const [profileDesignation, setProfileDesignation] = useState("Contractor / Lead Entity");
  const [profileCompany, setProfileCompany] = useState("ABC Infra Ltd.");
  const [profileLocation, setProfileLocation] = useState("Pit A, Sector 4");
  const [profileAddress, setProfileAddress] = useState("123 Mining Road, Industrial Area");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const [settingsEmail, setSettingsEmail] = useState("abc@minesight.com");
  const [settingsPhone, setSettingsPhone] = useState("+1 234 567 8900");
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
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
  const [newLogDesc, setNewLogDesc] = useState("");

  const closePopovers = () => {
    setIsNotifOpen(false);
    setIsProfileOpen(false);
  };

  const unreadNotifCount = appNotifications.filter(n => !n.read).length;
  const actionCenterCount = actionItems.filter(a => a.status === 'OPEN').length;

  const loadData = async () => {
    try {
      const token = auth.getToken();
      if (!token) return;
      
      const [obsRes, obsObligations, riskRes, complianceRes, licRes, machRes, expRes, workRes, logsRes] = await Promise.all([
        api.getObservations({ contractorId: currentUser?.contractorId || undefined }).catch(e => ({ data: [] })),
        api.getObligations({ contractorId: currentUser?.contractorId || undefined }).catch(e => ({ data: [] })),
        api.getContractorRisk(currentUser?.contractorId || "").catch(e => ({ data: null })),
        api.getComplianceReport().catch(e => ({ data: null })),
        api.getLicenses(token).catch(e => ({ data: [] })),
        api.getMachinery(token).catch(e => ({ data: [] })),
        api.getExplosives(token).catch(e => ({ data: [] })),
        api.getWorkers(token).catch(e => ({ data: [] })),
        api.getDailyLogs(token).catch(e => ({ data: [] }))
      ]);
      
      if (obsRes?.data) {
         setAllObservations(obsRes.data);
         setActionItems(obsRes.data.filter((o: any) => o.status !== "RESOLVED"));
      }
      if (obsObligations?.data) {
         setObligations(obsObligations.data);
      }
      if (riskRes?.data) {
         setRiskData(riskRes.data);
      }
      if (currentUser?.contractorId) {
        const myCompliance = complianceRes?.data?.contractorBreakdown?.find((c: any) => c.contractorId === currentUser.contractorId);
        setComplianceRate(myCompliance ? myCompliance.complianceRate : 100);
      }
      
      if (licRes?.data) {
        setLicenses(licRes.data.map((l: any) => ({
          id: l.id,
          document: `${l.documentType} - ${l.documentNumber}`,
          holder: l.holder,
          expiry: new Date(l.expiryDate).toLocaleDateString(),
          status: l.status,
          statusClass: l.status === "VALID" ? "bg-mine-100 text-mine-800" : "bg-red-50 text-red-600"
        })));
      }
      if (machRes?.data) {
        setMachinery(machRes.data.map((m: any) => ({
          id: m.id,
          machine: m.machineName,
          ownership: m.ownership,
          lastServiced: m.lastServiced ? new Date(m.lastServiced).toLocaleDateString() : "N/A",
          nextDue: m.nextDue ? new Date(m.nextDue).toLocaleDateString() : "N/A",
          status: m.status,
          statusClass: m.status === "ACTIVE" ? "bg-mine-100 text-mine-800" : "bg-red-50 text-red-600"
        })));
      }
      if (expRes?.data) {
        setExplosives(expRes.data.map((e: any) => ({
          id: e.id,
          type: e.explosiveType,
          procured: `${e.procured} ${e.unit}`,
          used: `${e.used} ${e.unit}`,
          remaining: `${e.remaining} ${e.unit}`
        })));
      }
      if (workRes?.data) {
        setWorkers(workRes.data.map((w: any) => ({
          id: w.workerCode,
          training: w.trainingStatus,
          trainingClass: w.trainingStatus === "COMPLETE" ? "bg-mine-100 text-mine-800" : "bg-red-50 text-red-600",
          ppe: w.ppeIssued ? "Yes" : "Pending",
          ppeClass: w.ppeIssued ? "bg-mine-100 text-mine-800" : "bg-amber-50 text-amber-600"
        })));
      }
      if (logsRes?.data) {
        setDailyLogs(logsRes.data.map((l: any) => ({
          id: l.id,
          author: l.loggedBy,
          time: new Date(l.timestamp).toLocaleString(),
          desc: l.logText
        })));
      }
      
    } catch (e) {
      console.error(e);
    }
  };

  const prevNotifCountRef = useRef<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentUser?.contractorId) {
      if (currentUser.contractorStatus !== "PENDING" && currentUser.contractorStatus !== "REJECTED") {
        loadData();
        fetchNotifications();

        interval = setInterval(async () => {
          try {
            const token = auth.getToken();
            if (!token) return;
            const res = await api.getNotifications(token);
            if (res.success) {
              const currentCount = res.data.length;
              if (currentCount > prevNotifCountRef.current && prevNotifCountRef.current > 0) {
                // A new notification arrived! Refresh data silently
                loadData();
              }
              prevNotifCountRef.current = currentCount;
              
              const mapped = res.data.map((n: any) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                severity: n.type === 'Safety' ? 'CRITICAL' : 'INFO',
                timestamp: new Date(n.createdAt).toLocaleDateString(),
                read: n.isRead,
                actionTab: n.referenceType === 'OBSERVATION' ? 'observations' : 'overview'
              }));
              setAppNotifications(mapped);
            }
          } catch (e) {
            console.error(e);
          }
        }, 10000); // Check every 10 seconds
      }
    }
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const token = auth.getToken();
      if (!token) return;
      const res = await api.getNotifications(token);
      if (res.success) {
        const mapped = res.data.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          severity: n.type === 'Safety' ? 'CRITICAL' : 'INFO',
          timestamp: new Date(n.createdAt).toLocaleDateString(),
          read: n.isRead,
          actionTab: n.referenceType === 'OBSERVATION' ? 'observations' : 'overview'
        }));
        prevNotifCountRef.current = res.data.length;
        setAppNotifications(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotifsRead = async () => {
    try {
      const token = auth.getToken();
      if (!token) return;
      await api.markAllNotificationsRead(token);
      setAppNotifications(appNotifications.map(n => ({ ...n, read: true })));
    } catch(e) {
      console.error(e);
    }
  };

  const markNotifRead = async (id: string) => {
    try {
      const token = auth.getToken();
      if (!token) return;
      await api.markNotificationRead(id, token);
      setAppNotifications(appNotifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Load logged in user details from session
    if (typeof window !== "undefined") {
      const rawUser = localStorage.getItem("minesight_auth_user");
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          setCurrentUser(user);
          if (user.name) setProfileName(user.name);
          if (user.email) setSettingsEmail(user.email);
          if (user.companyName) setProfileCompany(user.companyName);
        } catch (e) {
          console.error("Error reading auth user session:", e);
        }
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopovers();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    
    // Fetch obligations if user is logged in
    const fetchObligations = async () => {
      try {
        const rawUser = localStorage.getItem("minesight_auth_user");
        if (rawUser) {
          const user = JSON.parse(rawUser);
          if (user.contractorId) {
            const res = await api.getObligations({ contractorId: user.contractorId });
            setObligations(res.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load obligations", err);
      }
    };
    fetchObligations();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAction = async (actionName: string) => {
    closePopovers(); // Close popovers on any navigation
    switch (actionName) {
      case "New Log Entry":
        setIsNewLogOpen(true);
        break;
      case "Logout":
        try {
          const token = auth.getToken();
          if (token) {
            await api.logout(token);
          }
        } catch (e) {
          console.error("Logout error", e);
        }
        auth.clearSession();
        router.push("/");
        break;
      case "Export Data":
        try {
          const token = auth.getToken();
          if (!token) return;
          const res = await api.exportData(token);
          if (res.success && res.data) {
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'minesight-export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("Data exported successfully");
          } else {
            alert(res.error || "Failed to export data");
          }
        } catch (e) {
          console.error(e);
          alert("An error occurred while exporting data");
        }
        break;
      case "Import Data":
      case "User Profile":
      case "Profile":
        setActiveTab("profile");
        break;
      case "Settings":
        setActiveTab("settings");
        break;
      default:
        console.info(`[Unimplemented] ${actionName}`);
    }
  };

  // --- FORM SUBMIT HANDLERS ---
  const submitNewLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDesc) return;
    
    try {
      const token = auth.getToken();
      if (!token) return;
      
      const payload = {
        logText: newLogDesc
      };
      
      const res = await api.createDailyLog(payload, token);
      if (res.success && res.data) {
        showToast("Daily log recorded successfully");
        setIsNewLogOpen(false);
        setNewLogDesc("");
        loadData(); // reload to show the new log
      } else {
        alert("Failed to submit log.");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting log.");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleNotificationChange = (itemLabel: string, type: 'email' | 'sms', value: boolean, setter: any, state: any) => {
    setter({ ...state, [type]: value });
    showToast("Notification preferences updated");
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = auth.getToken();
      if (!token) return;
      const res = await api.updateProfile({ name: profileName, phone: settingsPhone }, token);
      if (res.success) {
        showToast("Profile updated successfully");
        setIsEditingProfile(false);
      } else {
        alert(res.error || "Failed to update profile");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      const token = auth.getToken();
      if (!token) return;
      const res = await api.changePassword({ currentPassword, newPassword }, token);
      if (res.success) {
        showToast("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(res.error || "Failed to update password");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  // ------------------------------------
  // TAB RENDERERS
  // ------------------------------------

  const renderActionCenter = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-white dark:bg-mine-900 p-6 rounded-[1.5rem] border border-neutral-100 dark:border-mine-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bell className="text-amber-500" size={24} />
              Action Center (Pending Correctives)
            </h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
              {actionCenterCount} Actions Required
            </span>
          </div>

          <div className="space-y-4">
            {actionItems.length === 0 ? (
              <div className="text-center py-10 text-neutral-500">
                You have no pending field actions. Great job!
              </div>
            ) : (
              actionItems.map((obs) => (
                <div key={obs.id} className="p-4 border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900 dark:bg-rose-900/60 dark:text-rose-200">
                          {obs.severity} · {obs.category}
                        </span>
                        <span className="font-mono text-xs text-neutral-500">{obs.observationCode}</span>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-mine-100">{obs.description}</p>
                      <div className="text-xs text-neutral-500 mt-1">
                        Reported by: {obs.supervisorName} | Zone: {obs.zone}
                      </div>
                    </div>
                    {obs.status === "OPEN" ? (
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded">ACTION REQUIRED</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">UNDER REVIEW</span>
                    )}
                  </div>

                  {obs.status === "OPEN" && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const action = (form.elements.namedItem("correctiveAction") as HTMLTextAreaElement).value;
                      const evidence = (form.elements.namedItem("evidenceUrl") as HTMLInputElement).value;
                      try {
                        const token = auth.getToken();
                        await api.submitEvidence(obs.id, { 
                          evidenceNotes: "Contractor responded via Action Center",
                          correctiveAction: action,
                          evidenceUrl: evidence,
                          submittedBy: currentUser?.name || "Contractor"
                        });
                        alert("Corrective action submitted!");
                        loadData();
                      } catch (err) {
                        alert("Failed to submit action.");
                      }
                    }} className="mt-4 pt-4 border-t border-rose-100 dark:border-rose-900/40 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-mine-300 mb-1">Corrective Action Taken</label>
                        <textarea name="correctiveAction" required placeholder="Describe what was done to fix this issue..." rows={2} className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-mine-700 bg-white dark:bg-mine-900" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-mine-300 mb-1">Evidence URL (Photo/Doc)</label>
                        <input name="evidenceUrl" type="url" placeholder="https://..." className="w-full px-3 py-2 text-sm rounded border border-neutral-300 dark:border-mine-700 bg-white dark:bg-mine-900" />
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition">
                          Submit Corrective Action
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">

      {/* Header */}
      <div className="flex items-center justify-between gap-6 mb-8 border-b border-neutral-100 dark:border-mine-800 pb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-mine-100 dark:bg-mine-800 border-4 border-white dark:border-mine-900 shadow-sm overflow-hidden flex items-center justify-center text-mine-800 dark:text-mine-100 font-bold text-2xl uppercase">
            {profileName ? profileName.substring(0, 2) : "US"}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white leading-tight">{profileName}</h2>
            <p className="text-mine-700 dark:text-mine-300 font-medium">{profileDesignation}</p>
          </div>
        </div>
        {!isEditingProfile && (
          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-mine-100 dark:bg-mine-800 dark:hover:bg-mine-700 text-neutral-600 dark:text-mine-300 transition-colors"
          >
            <Pencil size={18} />
          </button>
        )}
      </div>

      <form onSubmit={saveProfile} className="space-y-6">

        {/* Personal Information Card */}
        <div className="bg-white dark:bg-mine-900 p-6 rounded-[1.5rem] border border-neutral-100 dark:border-mine-800 shadow-sm relative">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider border-b border-neutral-100 dark:border-mine-800 pb-2 mb-6">Personal Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {isEditingProfile ? (
              <>
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
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-1">Full Name</p>
                  <p className="text-sm font-medium text-mine-950 dark:text-white">{profileName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-1">Designation / Role</p>
                  <p className="text-sm font-medium text-mine-950 dark:text-white">{profileDesignation}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Company Information Card */}
        <div className="bg-white dark:bg-mine-900 p-6 rounded-[1.5rem] border border-neutral-100 dark:border-mine-800 shadow-sm relative">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider border-b border-neutral-100 dark:border-mine-800 pb-2 mb-6">Company Information</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            {isEditingProfile ? (
              <>
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
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-neutral-500 mb-1">Company / Contractor Name</p>
                  <p className="text-sm font-medium text-mine-950 dark:text-white">{profileCompany}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-1">Work Location</p>
                  <p className="text-sm font-medium text-mine-950 dark:text-white">{profileLocation}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-500 mb-1">Company Address</p>
                  <p className="text-sm font-medium text-mine-950 dark:text-white">{profileAddress}</p>
                </div>
              </>
            )}
          </div>

          <div className="bg-neutral-50 dark:bg-mine-900/30 p-4 rounded-xl border border-neutral-100 dark:border-mine-800">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Account Information</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-700 dark:text-neutral-300">
              <div><p className="text-neutral-500 text-xs mb-1">Account Type</p><p className="font-medium text-mine-950 dark:text-white">Contractor</p></div>
              <div><p className="text-neutral-500 text-xs mb-1">Account ID</p><p className="font-medium text-mine-950 dark:text-white">{currentUser?.contractorCode || currentUser?.id?.substring(0, 8).toUpperCase() || "N/A"}</p></div>
              <div><p className="text-neutral-500 text-xs mb-1">Joined Date</p><p className="font-medium text-mine-950 dark:text-white">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Just now"}</p></div>
            </div>
          </div>
        </div>

        {isEditingProfile && (
          <div className="flex justify-end pt-4 gap-4">
            <button type="button" onClick={() => setIsEditingProfile(false)} className="px-6 py-3 border border-neutral-200 dark:border-mine-700 text-mine-700 dark:text-mine-300 hover:bg-neutral-50 dark:hover:bg-mine-800 rounded-xl font-bold transition-colors">
              Cancel
            </button>
            <button type="submit" className="uiverse-btn !w-auto !px-8">
              Save Profile
            </button>
          </div>
        )}
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
      <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-6 border-b border-neutral-100 dark:border-mine-800 pb-2">Account</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Email Address</p>
            <p className="font-medium text-mine-950 dark:text-white mb-3">{settingsEmail}</p>
            <button type="button" onClick={() => setIsChangeEmailOpen(true)} className="px-4 py-2 border border-neutral-200 dark:border-mine-700 text-mine-700 dark:text-mine-300 hover:bg-neutral-50 dark:hover:bg-mine-800 rounded-xl text-xs font-semibold transition-colors">Change Email</button>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Phone Number</p>
            <p className="font-medium text-mine-950 dark:text-white mb-3">{settingsPhone}</p>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS CARD */}
      <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800">
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
      <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800">
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

      {/* ACCOUNT MANAGEMENT */}
      <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-6 border-b border-neutral-100 dark:border-mine-800 pb-2">Account Management</h4>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-mine-950 dark:text-white">Export Account Data</p>
              <p className="text-xs text-neutral-500">Download your profile and account information.</p>
            </div>
            <button type="button" onClick={() => handleAction("Export Data")} className="uiverse-btn !w-auto !px-4 !h-8 !text-xs !line-height-8 !m-0 bg-white dark:bg-mine-900">Export Data</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderObservations = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-white dark:bg-mine-900 p-6 rounded-[1.5rem] border border-neutral-100 dark:border-mine-800 shadow-sm max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <CheckCircle2 className="text-mine-600" size={24} />
              All Observations
            </h2>
            <p className="text-sm text-neutral-500">History of observations reported by supervisors for your assigned zones.</p>
          </div>

          <div className="space-y-4">
            {allObservations.length === 0 ? (
              <div className="text-center py-10 text-neutral-500">No observations found.</div>
            ) : (
              allObservations.map((obs) => (
                <div key={obs.id} className="p-4 border border-neutral-200 dark:border-mine-700 rounded-xl space-y-3 bg-neutral-50 dark:bg-mine-950">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${obs.severity === 'CRITICAL' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'}`}>
                          {obs.severity} · {obs.category}
                        </span>
                        <span className="font-mono text-xs text-neutral-500">{obs.observationCode}</span>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-mine-100">{obs.description}</p>
                      <div className="text-xs text-neutral-500 mt-1">
                        Reported by: {obs.supervisorName} | Zone: {obs.zone}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${obs.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-700'}`}>
                      {obs.status}
                    </span>
                  </div>
                  {obs.correctiveAction && (
                    <div className="mt-2 text-xs border-t border-neutral-200 dark:border-mine-800 pt-2">
                      <span className="font-bold">Corrective Action: </span>{obs.correctiveAction}
                    </div>
                  )}
                  {obs.resolutionNotes && (
                    <div className="mt-1 text-xs">
                      <span className="font-bold">Resolution Notes: </span>{obs.resolutionNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRisk = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-white dark:bg-mine-900 p-6 rounded-[1.5rem] border border-neutral-100 dark:border-mine-800 shadow-sm max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <FileText className="text-mine-600" size={24} />
              Risk Intelligence
            </h2>
            <p className="text-sm text-neutral-500">Your AI-analyzed risk factors based on compliance, observations, and environment.</p>
          </div>
          
          {riskData ? (
            <div className="space-y-6">
              <div className="p-6 bg-neutral-50 dark:bg-mine-950 rounded-xl border border-neutral-200 dark:border-mine-700 text-center">
                <div className="text-4xl font-bold mb-2 capitalize">{riskData.riskLevel?.toLowerCase()} Risk</div>
                <div className="text-neutral-500 text-sm">Overall computed risk status</div>
              </div>
              <div>
                <h3 className="font-bold mb-4">Risk Drivers</h3>
                <ul className="space-y-3">
                  {riskData.factors?.length > 0 ? riskData.factors.map((factor: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ArrowUpRight size={16} className="mt-0.5 text-neutral-400 shrink-0" />
                      <span>{factor}</span>
                    </li>
                  )) : (
                    <li className="text-sm text-neutral-500">No active risk drivers found.</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-500">No risk data available yet.</div>
          )}
        </div>
      </div>
    );
  };

  const renderNotificationCenter = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-mine-900 rounded-3xl p-8 border border-neutral-100 dark:border-mine-900 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-mine-950 dark:text-white">Notification Center</h2>
          {unreadNotifCount > 0 && (
            <button onClick={markAllNotifsRead} className="uiverse-btn">Mark All as Read</button>
          )}
        </div>
        <div className="flex flex-col gap-4">
          {appNotifications.map(notif => (
            <div key={notif.id} className={`p-6 border rounded-2xl transition-all hover:shadow-md ${!notif.read ? 'bg-mine-50/50 border-mine-200 dark:bg-mine-900/20 dark:border-mine-800' : 'bg-white border-neutral-100 dark:bg-mine-900 dark:border-mine-900'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${notif.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
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
        {/* Compliance Rate */}
        <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 relative group overflow-hidden flex flex-col justify-between hover:border-mine-300 dark:hover:border-mine-700 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Compliance Rate</h3>
            <button
              disabled title="Feature coming soon" 
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-mine-800 flex items-center justify-center text-neutral-400 dark:text-mine-300 group-hover:bg-mine-100 dark:group-hover:bg-mine-800 group-hover:text-mine-800 dark:group-hover:text-white group-hover:border-mine-300 dark:group-hover:border-mine-700 transition-colors opacity-50 cursor-not-allowed"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <div>
            <div className="text-5xl font-medium text-mine-950 dark:text-white mb-4 tracking-tighter">{complianceRate.toFixed(1)}%</div>
            <div className="flex items-center gap-2 text-xs font-semibold text-mine-800 dark:text-mine-300">
              <span className={`text-neutral-400 dark:text-neutral-500 font-medium ${complianceRate < 90 ? 'text-red-500' : 'text-green-500'}`}>
                {complianceRate < 90 ? 'Requires attention' : 'Good standing'}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 relative group overflow-hidden flex flex-col justify-between hover:border-mine-300 dark:hover:border-mine-700 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Risk Level</h3>
            <button
              disabled title="Feature coming soon" 
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-mine-800 flex items-center justify-center text-neutral-400 dark:text-mine-300 group-hover:bg-mine-100 dark:group-hover:bg-mine-800 group-hover:text-mine-800 dark:group-hover:text-white group-hover:border-mine-300 dark:group-hover:border-mine-700 transition-colors opacity-50 cursor-not-allowed"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <div>
            <div className="text-5xl font-medium text-mine-950 dark:text-white mb-4 tracking-tighter capitalize">{riskData?.riskLevel?.toLowerCase() || 'Low'}</div>
            <div className="flex items-center gap-2 text-xs font-semibold text-mine-800 dark:text-mine-300">
              <span className="text-neutral-400 dark:text-neutral-500 font-medium">{riskData?.factors?.length || 0} active risk drivers</span>
            </div>
          </div>
        </div>

        {/* Open Actions */}
        <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 relative group overflow-hidden flex flex-col justify-between hover:border-mine-300 dark:hover:border-mine-700 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Open Actions</h3>
            <button
              onClick={() => setActiveTab("action_center")}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-mine-800 flex items-center justify-center text-neutral-400 dark:text-mine-300 group-hover:bg-mine-100 dark:group-hover:bg-mine-800 group-hover:text-mine-800 dark:group-hover:text-white group-hover:border-mine-300 dark:group-hover:border-mine-700 transition-colors"
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <div>
            <div className="text-5xl font-medium text-mine-950 dark:text-white mb-4 tracking-tighter">{actionCenterCount}</div>
            <div className="flex items-center gap-2 text-xs font-medium text-mine-800 dark:text-mine-300">
              <span className="text-neutral-400 dark:text-neutral-500">Requires correction</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Compliance & Risk Analytics Chart */}
        <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 col-span-1">
          <h3 className="text-mine-950 dark:text-white font-semibold mb-8 text-base">Compliance & Risk</h3>

          <div className="h-44 flex items-end justify-between px-2 gap-3 mb-4">
            <div className="w-full relative h-[60%] rounded-t-full opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
              style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #235347 3px, #235347 5px)' }}
              >
            </div>
            <div className="w-full relative h-[80%] bg-mine-800 dark:bg-mine-700 hover:bg-mine-700 dark:hover:bg-mine-600 transition-colors cursor-pointer rounded-t-full"
              ></div>
            <div className="w-full relative h-[65%] bg-mine-300 hover:bg-[#a5c7b0] transition-colors cursor-pointer rounded-t-full flex justify-center"
              >
              <div className="absolute -top-8 bg-white dark:bg-mine-800 shadow-sm border border-neutral-100 dark:border-mine-700 text-[10px] font-bold px-2.5 py-1 rounded-full text-mine-800 dark:text-white">74%</div>
            </div>
            <div className="w-full relative h-[100%] bg-mine-950 dark:bg-white hover:bg-mine-900 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-t-full"
              ></div>
            <div className="w-full relative h-[70%] rounded-t-full opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
              style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #235347 3px, #235347 5px)' }}
              >
            </div>
            <div className="w-full relative h-[50%] rounded-t-full opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
              style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #235347 3px, #235347 5px)' }}
              >
            </div>
            <div className="w-full relative h-[65%] rounded-t-full opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
              style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, #235347 3px, #235347 5px)' }}
              >
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

        {/* Governance Summary */}
        <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 col-span-1 flex flex-col">
          <h3 className="text-mine-950 dark:text-white font-semibold mb-6 text-base">Governance Summary</h3>
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="text-[32px] font-bold text-mine-900 dark:text-mine-100 mb-2 leading-tight">
              {complianceRate}%
            </h4>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium mb-8">Overall Compliance Score</p>
            
            <div className="space-y-4 mt-auto border-t border-neutral-100 dark:border-mine-800 pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Active Obligations</span>
                <span className="font-bold text-mine-900 dark:text-white">{obligations.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500 font-medium">Open Observations</span>
                <span className="font-bold text-mine-900 dark:text-white">{actionItems.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Actions List */}
        <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Priority Actions</h3>
            <button
              onClick={() => setActiveTab("action_center")}
              className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-mine-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-mine-100 dark:hover:bg-mine-800 hover:text-mine-800 dark:hover:text-white hover:border-mine-300 dark:hover:border-mine-700 transition-colors uppercase tracking-wide"
            >
              <ArrowUpRight size={12} /> View All
            </button>
          </div>

          <div className="space-y-5">
            {actionItems.slice(0, 4).map((action) => (
              <div
                key={action.id}
                onClick={() => setActiveTab("action_center")}
                className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 hover:bg-neutral-50 dark:hover:bg-mine-900/50 rounded-xl transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${action.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-mine-100 text-mine-600'}`}>
                  <Bell size={18} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-mine-950 dark:text-white leading-tight mb-0.5 group-hover:text-mine-700 dark:group-hover:text-mine-300 transition-colors">{action.category} Issue</h4>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Zone: {action.zone}</p>
                </div>
              </div>
            ))}
            {actionItems.length === 0 && (
              <div className="text-center text-sm text-neutral-500 mt-8">No open actions.</div>
            )}
          </div>
        </div>

      </div>

      {/* BOTTOM ROW (Recent Work Logs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-mine-950 dark:text-white font-semibold text-base">Recent Work Logs</h3>
            <button
              onClick={() => setActiveTab("daily_log")}
              className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-mine-800 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-mine-100 dark:hover:bg-mine-800 hover:text-mine-800 dark:hover:text-white hover:border-mine-300 dark:hover:border-mine-700 transition-colors uppercase tracking-wide"
            >
              <ArrowUpRight size={12} /> View All
            </button>
          </div>

          <div className="space-y-3">
            {dailyLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                onClick={() => setActiveTab("daily_log")}
                className="flex flex-col gap-1 p-3 hover:bg-neutral-50 dark:hover:bg-mine-900/50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-neutral-100 dark:hover:border-mine-800"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-mine-950 dark:text-white group-hover:text-mine-700 dark:group-hover:text-mine-300 transition-colors">{log.author}</h4>
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">{log.time}</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">{log.desc}</p>
              </div>
            ))}
            {dailyLogs.length === 0 && (
              <p className="text-sm text-neutral-500 py-4 text-center">No logs recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACCESS / OPERATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: "licenses", label: "Licenses & Certs", icon: FileSignature, desc: "Manage operational permits" },
          { id: "machinery", label: "Machinery Register", icon: Truck, desc: "Track heavy equipment" },
          { id: "daily_log", label: "Daily Work Log", icon: FileText, desc: "Submit daily shift reports" },
          { id: "explosives", label: "Explosives Stock", icon: Bomb, desc: "Monitor magazine inventory" },
        ].map((item) => (
          <div 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 flex flex-col justify-between group hover:border-mine-300 dark:hover:border-mine-700 hover:shadow-md transition-all cursor-pointer overflow-hidden relative"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-mine-50 dark:bg-mine-800/20 rounded-bl-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-mine-50 dark:bg-mine-800 text-mine-600 dark:text-mine-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon size={24} />
              </div>
              <div className="w-8 h-8 rounded-full border border-neutral-200 dark:border-mine-700 flex items-center justify-center text-neutral-400 group-hover:bg-mine-600 group-hover:border-mine-600 group-hover:text-white transition-colors">
                <ArrowUpRight size={18} />
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-mine-950 dark:text-white font-bold text-lg mb-1">{item.label}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLicenses = () => (
    <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Licenses & Certificates</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage and track compliance documents for your contract.</p>
        </div>
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
              <tr key={idx} className="transition-colors" >
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
    <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Machinery Register</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Track heavy equipment deployed at the site.</p>
        </div>
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
              <tr key={idx} className="transition-colors" >
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
    <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
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
          <div key={idx} className="bg-mine-50 dark:bg-mine-900/60 border border-mine-100 dark:border-mine-800 rounded-[1rem] p-5">
            <div className="text-3xl font-bold text-mine-800 dark:text-mine-100 mb-1 tracking-tight">{stat.value}</div>
            <div className="text-xs font-semibold text-mine-700 dark:text-mine-300 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-200 uppercase tracking-wider mb-2">Recent Logs</h4>
        {dailyLogs.map((log) => (
          <div key={log.id} className="p-4 bg-neutral-50/50 dark:bg-mine-900/40 border border-neutral-100 dark:border-mine-800 rounded-[1rem] transition-colors cursor-pointer" >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-mine-100 dark:bg-mine-800 text-mine-700 dark:text-mine-300 flex items-center justify-center shrink-0">
                <FileText size={14} />
              </div>
              <div>
                <p className="text-sm font-semibold text-mine-950 dark:text-white mb-1">{log.desc}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">{log.time} · {log.author}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExplosives = () => (
    <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Explosives Stock</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Monitor magazine stock and consumption logs.</p>
        </div>
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
              <tr key={idx} className="transition-colors" >
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
    <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1">Worker Roster</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage site workers and safety clearances.</p>
        </div>
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
              <tr key={idx} className="transition-colors" >
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

  const renderCompliance = () => {
    const currentUser = auth.getUser();
    const sessionToken = auth.getToken();

    const handleSubmitEvidence = async (id: string) => {
      const evidenceUrl = prompt("Enter evidence URL (e.g., https://demo.minesight.in/evidence.pdf):");
      if (!evidenceUrl) return;
      const notes = prompt("Enter supporting notes:");
      
      try {
        await api.submitComplianceEvidence(id, {
          evidenceUrl,
          evidenceNotes: notes || "Evidence submitted for supervisor verification",
          submittedBy: currentUser?.name || "Contractor"
        }, sessionToken || undefined);
        
        // Refresh obligations
        if (currentUser?.contractorId) {
          const res = await api.getObligations({ contractorId: currentUser.contractorId });
          setObligations(res.data || []);
        }
        showToast("Evidence submitted. Status: Pending Verification — awaiting supervisor review.");
      } catch (err: any) {
        alert("Failed to submit evidence: " + err.message);
      }
    };

    const statusColor = (s: string) => {
      if (s === 'COMPLIANT') return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
      if (s === 'DUE_SOON' || s === 'DUE_TODAY') return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
      if (s === 'OVERDUE') return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
      if (s === 'PENDING_VERIFICATION') return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      if (s === 'NON_COMPLIANT') return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      return 'bg-neutral-100 text-neutral-600 border-neutral-300';
    };

    return (
      <div className="bg-white dark:bg-mine-900 rounded-[1.5rem] p-6 shadow-sm border border-neutral-100 dark:border-mine-800 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-mine-950 dark:text-white font-semibold text-xl mb-1 flex items-center gap-2">
              <FileCheck className="text-purple-600" size={24} /> Statutory Compliance
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Track and fulfill your PS-26024 statutory obligations. Submit evidence for supervisor verification.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {obligations.length === 0 ? (
            <div className="text-center py-10 text-neutral-500">No statutory obligations found for your account.</div>
          ) : (
            obligations.map((ob: any) => (
              <div key={ob.id} className="p-4 border border-neutral-100 dark:border-mine-800 rounded-xl bg-neutral-50/50 dark:bg-mine-900/50 space-y-3">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex gap-2 items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor(ob.status)}`}>
                        {ob.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded">
                        {ob.domain}
                      </span>
                      {ob.frequency && (
                        <span className="text-[10px] text-neutral-400 uppercase">{ob.frequency}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-mine-950 dark:text-white leading-tight">{ob.title}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{ob.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400">
                      <span>Due: <strong className="text-neutral-600 dark:text-mine-300">{ob.dueDate ? new Date(ob.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : 'N/A'}</strong></span>
                      {ob.sourceReference && <span>Ref: <em>{ob.sourceReference}</em></span>}
                      {ob.zone && <span>Zone: {ob.zone}</span>}
                    </div>

                    {/* Rejection reason — so contractor knows why and can resubmit */}
                    {ob.status === 'NON_COMPLIANT' && ob.notes && (
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-400">
                        <span className="font-bold shrink-0">⚠ Rejected:</span>
                        <span>{ob.notes}</span>
                      </div>
                    )}

                    {ob.status === 'COMPLIANT' && ob.verifiedBy && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified by <strong>{ob.verifiedBy}</strong>
                        {ob.verifiedAt && <span className="text-neutral-400"> · {new Date(ob.verifiedAt).toLocaleDateString()}</span>}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col gap-2 min-w-[140px]">
                    {ob.status === 'COMPLIANT' ? (
                      <div className="text-center px-3 py-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 size={14} /> Verified
                      </div>
                    ) : ob.status === 'PENDING_VERIFICATION' ? (
                      <div className="text-center px-3 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-bold">
                        ⏳ Awaiting Supervisor Review
                      </div>
                    ) : (
                      // For OVERDUE, DUE_SOON, NON_COMPLIANT — allow (re)submission
                      <button 
                        onClick={() => handleSubmitEvidence(ob.id)}
                        className="uiverse-btn !w-full !px-3 !py-2 !h-auto !text-xs"
                      >
                        {ob.status === 'NON_COMPLIANT' ? '↻ Resubmit Evidence' : 'Submit Evidence'}
                      </button>
                    )}
                    {ob.evidenceUrl && (
                      <a href={ob.evidenceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-blue-400 text-center hover:underline">
                        View Submitted ↗
                      </a>
                    )}
                  </div>
                </div>

                {ob.evidenceNotes && ob.status === 'PENDING_VERIFICATION' && (
                  <div className="text-[11px] italic text-neutral-500 dark:text-mine-400 px-1">
                    Your submitted notes: "{ob.evidenceNotes}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };



  // ------------------------------------
  // MAIN COMPONENT RENDER
  // ------------------------------------

  if (currentUser?.contractorStatus === "PENDING") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral-50 dark:bg-mine-950 font-sans text-mine-950 dark:text-white">
        <div className="max-w-md w-full bg-white dark:bg-mine-900 rounded-3xl shadow-lg border border-neutral-200 dark:border-mine-800 p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-6">
            <HardHat size={32} />
          </div>
          <h1 className="text-2xl font-black mb-2">Registration Pending</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
            Your contractor registration has been submitted and is currently awaiting approval from the Mine Supervisor. 
            You will be notified once your account is activated.
          </p>
          <div className="p-4 bg-neutral-50 dark:bg-mine-950 rounded-xl border border-neutral-100 dark:border-mine-800 text-left space-y-2 mb-8">
            <p className="text-xs text-neutral-500">Contractor Name</p>
            <p className="font-bold">{currentUser?.name || "N/A"}</p>
            <p className="text-xs text-neutral-500 mt-2">Registration Code</p>
            <p className="font-mono font-medium">{currentUser?.contractorCode || "Pending Assignment"}</p>
          </div>
          <button 
            onClick={() => { auth.logout(); router.replace("/"); }}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-mine-950 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (currentUser?.contractorStatus === "REJECTED") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral-50 dark:bg-mine-950 font-sans text-mine-950 dark:text-white">
        <div className="max-w-md w-full bg-white dark:bg-mine-900 rounded-3xl shadow-lg border border-neutral-200 dark:border-mine-800 p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black mb-2">Registration Rejected</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-6 leading-relaxed">
            Your contractor registration was reviewed and rejected by the Mine Supervisor.
          </p>
          
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 text-left mb-8 flex items-start gap-3">
            <AlertTriangle className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">Reason for Rejection</p>
              <p className="text-sm text-rose-700 dark:text-rose-400">{currentUser?.rejectionReason || "No specific reason provided."}</p>
            </div>
          </div>

          <button 
            onClick={() => { auth.logout(); router.replace("/"); }}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-mine-950 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === item.id
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${activeTab === item.id
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
              disabled title="Feature coming soon" 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-neutral-100 dark:bg-mine-800 rounded text-xs text-neutral-400 dark:text-mine-300 font-bold border border-neutral-200 dark:border-mine-700 hover:bg-neutral-200 dark:hover:bg-mine-700 transition-colors opacity-50 cursor-not-allowed"
            >
              <Command size={12} /> F
            </button>
          </div>

          <div className="flex items-center gap-5 relative">

            {/* INVISIBLE OVERLAY TO CLOSE POPOVERS */}
            {(isNotifOpen || isProfileOpen) && (
              <div className="fixed inset-0 z-40" onClick={closePopovers}></div>
            )}

            <ThemeToggle />

            {/* NOTIFICATIONS POPOVER CONTAINER */}
            <div className="relative z-50">
              <button
                onClick={(e) => { e.stopPropagation(); setIsProfileOpen(false); setIsNotifOpen(!isNotifOpen); }}
                className={`relative p-2.5 rounded-full shadow-sm border border-neutral-200/50 dark:border-mine-800 transition-colors ${isNotifOpen ? 'bg-mine-100 dark:bg-mine-800 text-mine-800 dark:text-white' : 'bg-white dark:bg-mine-900 text-neutral-500 dark:text-mine-300 hover:text-mine-700 dark:hover:text-white'}`}
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-mine-900"></span>}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-mine-900 border border-neutral-200 dark:border-mine-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${notif.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
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
                onClick={(e) => { e.stopPropagation(); setIsNotifOpen(false); setIsProfileOpen(!isProfileOpen); }}
                className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity text-left"
              >
                <div className="w-10 h-10 rounded-full bg-mine-100 dark:bg-mine-800 border-2 border-white dark:border-mine-900 shadow-sm overflow-hidden flex items-center justify-center text-mine-800 dark:text-mine-100 font-bold uppercase">
                  {profileName ? profileName.substring(0, 2) : "US"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-mine-950 dark:text-white leading-none truncate max-w-[120px]">{profileName}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium truncate max-w-[120px]">{settingsEmail}</p>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-mine-900 border border-neutral-200 dark:border-mine-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 py-2">
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-mine-800 mb-2 sm:hidden">
                    <p className="text-sm font-bold text-mine-950 dark:text-white leading-none truncate">{profileName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium truncate">{settingsEmail}</p>
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
                  disabled title="Feature coming soon" 
                  className="uiverse-btn opacity-50 cursor-not-allowed"
                >
                  <Plus size={16} /> Add Project
                </button>
                <button
                  disabled title="Feature coming soon" 
                  className="uiverse-btn opacity-50 cursor-not-allowed"
                >
                  Import Data
                </button>
              </div>
            </div>
          )}

          {/* RENDER ACTIVE TAB CONTENT */}
          {activeTab === "overview" && renderOverview()}
          {activeTab === "action_center" && renderActionCenter()}
          {activeTab === "compliance" && renderCompliance()}
          {activeTab === "observations" && renderObservations()}
          {activeTab === "risk" && renderRisk()}
          {activeTab === "notification_center" && renderNotificationCenter()}
          {activeTab === "licenses" && renderLicenses()}
          {activeTab === "machinery" && renderMachinery()}
          {activeTab === "daily_log" && renderDailyLog()}
          {activeTab === "explosives" && renderExplosives()}
          {activeTab === "roster" && renderRoster()}
          {activeTab === "profile" && renderProfile()}
          {activeTab === "settings" && renderSettings()}

        </div>
      </main>

      {/* MODALS */}

      {/* 5. NEW LOG ENTRY MODAL */}
      {isNewLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-mine-900 p-8 rounded-[1.5rem] w-full max-w-sm shadow-xl border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-6 tracking-tight">New Log Entry</h2>
            <form onSubmit={submitNewLog}>
              <div className="uiverse-input-container">
                <input type="text" required value={newLogDesc} onChange={(e) => setNewLogDesc(e.target.value)} />
                <label className="label">Activity Description</label>
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

      {/* CHANGE EMAIL MODAL */}
      <ChangeEmailModal
        isOpen={isChangeEmailOpen}
        onClose={() => setIsChangeEmailOpen(false)}
        currentEmail={settingsEmail}
        onSuccess={(newEmail) => setSettingsEmail(newEmail)}
      />

    </div>
  );
}
