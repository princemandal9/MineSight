# CLAUDE.md - MineSight Project Guidelines

## Project Overview
MineSight is an AI-powered Smart Governance & Compliance Monitoring System for Coal Mines (Smart India Hackathon 2026 MVP). 
It focuses on a 2-Role MVP: **Contractor** and **Supervisor**.

## Core MVP Scope (Strictly Stick to This)
1. **Contractor Portal:**
   - Digital License & Certificate Wallet (tracks expiry dates).
   - Digital Attendance Register (replaces paper registers).
   - Unresolved Action Center (displays supervisor safety remarks in red text).
2. **Supervisor Portal:**
   - Contractor Status Dashboard.
   - Quick Observation Logger (category, photo upload, severity tag, auto-locks warning on contractor profile).
   - Daily Yield & Environment Tracker (logs coal tonnage, monitors dust/effluent limits, triggers warning flags).
   - Closure Verification (verifies contractor proof, clears red alert, creates audit trail).

## AI Safety & Data Privacy Rules
- **No PII/Data Leaks:** Never expose sensitive operational data or personal credentials.
- **Deterministic AI Only:** Risk scores and alerts must be driven by actual logic and data inputs (e.g., expired dates, open remarks). No black-box hallucinations.
- **Role-Based Boundaries:** Enforce strict permission boundaries between Contractors and Supervisors.

## Coding & Token Efficiency Rules
- Keep components modular, lightweight, and clean.
- Do not add complex unrequested third-party libraries or wander into future scope features (like full IoT hardware integrations).
- Provide concise code snippets rather than overly verbose explanations.