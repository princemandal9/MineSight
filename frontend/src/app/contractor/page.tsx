"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertTriangle, XCircle, Clock, CheckCircle, Truck, Bomb, Pickaxe, Users, ChevronDown, ChevronUp } from "lucide-react";

type TaskType = "blasting" | "transport" | "excavation";

function ContractorProfileContent() {
  const searchParams = useSearchParams();
  const taskQuery = searchParams.get('task');
  const activeTask: TaskType = ["blasting", "transport", "excavation"].includes(taskQuery as string) ? (taskQuery as TaskType) : "blasting";

  const [showRoster, setShowRoster] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8faf8] text-mine-950 font-sans pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* HEADER */}
        <div className="bg-mine-900 text-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-mine-300 text-sm font-medium tracking-wide uppercase">Contractor Profile</p>
            <div className="bg-mine-800/50 text-mine-100 border border-mine-700/50 px-3 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5">
              {activeTask === 'blasting' && <Bomb size={12} />}
              {activeTask === 'transport' && <Truck size={12} />}
              {activeTask === 'excavation' && <Pickaxe size={12} />}
              {activeTask} Active
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">ABC Infrastructure</h1>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-mine-100">
            <span>Contract ID: <b className="text-white font-semibold">MA-CT-014</b></span>
            <span>Mine: <b className="text-white font-semibold">Mine Alpha</b></span>
            <span>Period: <b className="text-white font-semibold">Jan – Dec 2026</b></span>
          </div>
        </div>

        {/* LICENSES & CERTIFICATES */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-mine-900">Licenses & Certificates</h2>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-mine-100 text-mine-800">Compliance</span>
          </div>
          <div className="bg-white border border-mine-300/30 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-mine-50/50 text-neutral-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Holder / No.</th>
                    <th className="px-6 py-4">Expiry</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mine-300/20">
                  <tr className="hover:bg-mine-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-mine-900">Contract Labour License</td>
                    <td className="px-6 py-4 text-neutral-600">CL-2026-0417</td>
                    <td className="px-6 py-4 text-neutral-600">30 Nov 2026</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={14} /> Valid
                      </span>
                    </td>
                  </tr>
                  
                  {activeTask === 'blasting' && (
                    <>
                      <tr className="hover:bg-mine-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-mine-900">Blaster's Certificate (DGMS)</td>
                        <td className="px-6 py-4 text-neutral-600">R. Sharma — BC-11894</td>
                        <td className="px-6 py-4 text-neutral-600">12 Sep 2026</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <AlertTriangle size={14} /> 18 days left
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-mine-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-mine-900">Explosives License</td>
                        <td className="px-6 py-4 text-neutral-600">EXP-WB-2291</td>
                        <td className="px-6 py-4 text-neutral-600">05 Oct 2026</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={14} /> Valid
                          </span>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MACHINERY REGISTER */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-mine-900">Machinery Register</h2>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-mine-100 text-mine-800">Core</span>
          </div>
          <div className="bg-white border border-mine-300/30 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-mine-50/50 text-neutral-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Machine</th>
                    <th className="px-6 py-4">Ownership</th>
                    <th className="px-6 py-4">Last Serviced</th>
                    <th className="px-6 py-4">Next Due</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mine-300/20">
                  {(activeTask === 'blasting' || activeTask === 'excavation') && (
                    <>
                      <tr className="hover:bg-mine-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-mine-900">Hydraulic Excavator (x5)</td>
                        <td className="px-6 py-4 text-neutral-600">Owned</td>
                        <td className="px-6 py-4 text-neutral-600">02 Aug 2026</td>
                        <td className="px-6 py-4 text-neutral-600">02 Nov 2026</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={14} /> Active
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-mine-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-mine-900">Drilling Machine</td>
                        <td className="px-6 py-4 text-neutral-600">Owned</td>
                        <td className="px-6 py-4 text-neutral-600">14 Jul 2026</td>
                        <td className="px-6 py-4 text-neutral-600">14 Sep 2026</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                            <Clock size={14} /> Due Soon
                          </span>
                        </td>
                      </tr>
                    </>
                  )}
                  {activeTask === 'transport' && (
                    <>
                      <tr className="hover:bg-mine-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-mine-900">Dumper / Tipper (30–35T) x8</td>
                        <td className="px-6 py-4 text-neutral-600">Rented</td>
                        <td className="px-6 py-4 text-neutral-600">20 Aug 2026</td>
                        <td className="px-6 py-4 text-neutral-600">20 Nov 2026</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={14} /> Active
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-mine-50/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-mine-900">Water Tanker (x3)</td>
                        <td className="px-6 py-4 text-neutral-600">Owned</td>
                        <td className="px-6 py-4 text-neutral-600">10 Jun 2026</td>
                        <td className="px-6 py-4 text-red-600 font-semibold">10 Sep 2026</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            <XCircle size={14} /> Overdue
                          </span>
                        </td>
                      </tr>
                    </>
                  )}
                  {activeTask === 'excavation' && (
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-mine-900">Dozer (x2)</td>
                      <td className="px-6 py-4 text-neutral-600">Owned</td>
                      <td className="px-6 py-4 text-neutral-600">28 Jul 2026</td>
                      <td className="px-6 py-4 text-neutral-600">28 Oct 2026</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={14} /> Active
                        </span>
                      </td>
                    </tr>
                  )}
                  <tr className="hover:bg-mine-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-mine-900">Grader (x2)</td>
                    <td className="px-6 py-4 text-neutral-600">Owned</td>
                    <td className="px-6 py-4 text-neutral-600">15 Aug 2026</td>
                    <td className="px-6 py-4 text-neutral-600">15 Nov 2026</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DAILY WORK LOG */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-mine-900">Daily Work Log</h2>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">Contextual</span>
          </div>
          
          <div className="bg-white border border-mine-300/30 rounded-2xl p-6 shadow-sm">
            {activeTask === 'blasting' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-mine-50 rounded-xl p-4 border border-mine-100">
                    <div className="text-3xl font-black text-mine-800 mb-1">3</div>
                    <div className="text-sm text-mine-700 font-medium">Blasting rounds fired today</div>
                  </div>
                  <div className="bg-mine-50 rounded-xl p-4 border border-mine-100">
                    <div className="text-3xl font-black text-mine-800 mb-1">1,240 <span className="text-xl font-bold text-mine-700/70">m²</span></div>
                    <div className="text-sm text-mine-700 font-medium">Area covered today</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 pb-4 border-b border-mine-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-mine-100 flex items-center justify-center shrink-0 text-mine-700">
                      <Bomb size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-mine-900">Round #3 fired, Zone B</p>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5"><Clock size={12} /> 14:20 · Logged by R. Sharma</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pb-4 border-b border-mine-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-mine-100 flex items-center justify-center shrink-0 text-mine-700">
                      <Bomb size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-mine-900">Round #2 fired, Zone B</p>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5"><Clock size={12} /> 11:05 · Logged by R. Sharma</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTask === 'transport' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-mine-50 rounded-xl p-4 border border-mine-100">
                    <div className="text-3xl font-black text-mine-800 mb-1">412 <span className="text-xl font-bold text-mine-700/70">T</span></div>
                    <div className="text-sm text-mine-700 font-medium">Tonnage moved today</div>
                  </div>
                  <div className="bg-mine-50 rounded-xl p-4 border border-mine-100">
                    <div className="text-3xl font-black text-mine-800 mb-1">38</div>
                    <div className="text-sm text-mine-700 font-medium">Trips completed</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 pb-4 border-b border-mine-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-mine-100 flex items-center justify-center shrink-0 text-mine-700">
                      <Truck size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-mine-900">Trip #38 — Pit 2 to dump yard</p>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5"><Clock size={12} /> 15:40 · Dumper D-06</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pb-4 border-b border-mine-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-mine-100 flex items-center justify-center shrink-0 text-mine-700">
                      <Truck size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-mine-900">Trip #37 — Pit 2 to dump yard</p>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5"><Clock size={12} /> 15:05 · Dumper D-04</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTask === 'excavation' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-mine-50 rounded-xl p-4 border border-mine-100">
                    <div className="text-3xl font-black text-mine-800 mb-1">3,180 <span className="text-xl font-bold text-mine-700/70">m³</span></div>
                    <div className="text-sm text-mine-700 font-medium">Overburden removed today</div>
                  </div>
                  <div className="bg-mine-50 rounded-xl p-4 border border-mine-100">
                    <div className="text-3xl font-black text-mine-800 mb-1">68<span className="text-xl font-bold text-mine-700/70">%</span></div>
                    <div className="text-sm text-mine-700 font-medium">Task completion</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4 pb-4 border-b border-mine-100 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-mine-100 flex items-center justify-center shrink-0 text-mine-700">
                      <Pickaxe size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-mine-900">Bench 4 clearance completed</p>
                      <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5"><CheckCircle size={12} /> 16:00 · Verified by Site Supervisor</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* EXPLOSIVES STOCK — BLASTING ONLY */}
        {activeTask === 'blasting' && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-mine-900">Explosives Stock Register</h2>
              <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">Blasting Only</span>
            </div>
            <div className="bg-white border border-mine-300/30 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-mine-50/50 text-neutral-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Explosive Type</th>
                      <th className="px-6 py-4">Procured</th>
                      <th className="px-6 py-4">Used</th>
                      <th className="px-6 py-4">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mine-300/20">
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-mine-900">Site-mix emulsion</td>
                      <td className="px-6 py-4 text-neutral-600">2,400 kg</td>
                      <td className="px-6 py-4 text-neutral-600">2,180 kg</td>
                      <td className="px-6 py-4 font-bold text-mine-800">220 kg</td>
                    </tr>
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-mine-900">Detonators</td>
                      <td className="px-6 py-4 text-neutral-600">600 units</td>
                      <td className="px-6 py-4 text-neutral-600">540 units</td>
                      <td className="px-6 py-4 font-bold text-mine-800">60 units</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* WORKER ROSTER */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-mine-900">Worker Roster</h2>
            </div>
            <div className="bg-white border border-mine-300/30 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-mine-50/50 text-neutral-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Worker ID</th>
                      <th className="px-4 py-3">Training</th>
                      <th className="px-4 py-3">PPE Issued</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mine-300/20">
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-mine-900">#0114</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Complete</span></td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Yes</span></td>
                    </tr>
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-mine-900">#0115</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">Missing</span></td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Yes</span></td>
                    </tr>
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-mine-900">#0116</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Complete</span></td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* REQUESTS TO SUPERVISOR */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-mine-900">Requests to Supervisor</h2>
            </div>
            <div className="bg-white border border-mine-300/30 rounded-2xl p-4 shadow-sm max-h-64 overflow-y-auto">
              <div className="space-y-4">
                <div className="pb-4 border-b border-mine-100 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-mine-900 mb-1">Requesting water tanker refill, Zone B</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">Today, 09:12</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Open</span>
                  </div>
                </div>
                <div className="pb-4 border-b border-mine-100 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-mine-900 mb-1">Extension request — 2 days, weather delay</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">Yesterday</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Approved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEAM ROSTER TOGGLE (Moved to bottom) */}
        <div className="mt-10 pt-10 border-t border-mine-300/20 mb-8">
          <button 
            onClick={() => setShowRoster(!showRoster)}
            className="w-full bg-white border border-mine-300/30 hover:bg-mine-50 hover:border-mine-300 rounded-2xl p-5 shadow-sm transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-mine-100 flex items-center justify-center text-mine-700">
                <Users size={18} />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold text-mine-900 group-hover:text-mine-700 transition-colors">Team Roster & Roles</h2>
                <p className="text-xs text-neutral-500">View project managers, safety officers, and supervisors</p>
              </div>
            </div>
            <div className="text-mine-400 group-hover:text-mine-700 transition-colors">
              {showRoster ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {showRoster && (
            <div className="mt-3 bg-white border border-mine-300/30 rounded-2xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-2 fade-in duration-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-mine-50/50 text-neutral-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Designation</th>
                      <th className="px-6 py-4">Qty</th>
                      <th className="px-6 py-4">Certification Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mine-300/20">
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-mine-900">Project Manager</td>
                      <td className="px-6 py-4">1</td>
                      <td className="px-6 py-4 text-neutral-400">—</td>
                    </tr>
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-mine-900">Mining Engineer</td>
                      <td className="px-6 py-4">1</td>
                      <td className="px-6 py-4 text-mine-700 font-medium">DGMS competency cert</td>
                    </tr>
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-mine-900">Safety Officer</td>
                      <td className="px-6 py-4">1</td>
                      <td className="px-6 py-4 text-mine-700 font-medium">DGMS competency cert</td>
                    </tr>
                    <tr className="hover:bg-mine-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-mine-900">Site Supervisor</td>
                      <td className="px-6 py-4">3–4</td>
                      <td className="px-6 py-4 text-neutral-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ContractorProfile() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8faf8] flex flex-col items-center justify-center font-sans text-mine-950 font-bold">Loading...</div>}>
      <ContractorProfileContent />
    </Suspense>
  );
}
