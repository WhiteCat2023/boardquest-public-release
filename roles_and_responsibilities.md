# BoardQuest: Roles and Responsibilities Documentation

This document defines the governance structure, operational ownership, approval authorities, and accountability boundaries for all stakeholder roles within the **BoardQuest** ecosystem.

---

## 1. Role Definitions

### BoardQuest_SuperAdmin (Super Admin)
- **Ownership:** Owns the whole technical stack. They handle raw code, database tables, underlying infrastructure, and global system settings across Production, UAT, and Dev environments.
- **Approval:** They have total power of the administrative side. If someone needs access, an emergency bug needs fixing, or a new build goes live, they sign off on it.
- **Accountability:** Holds ultimate accountability for 99.9% platform availability, infrastructure security, database backup integrity, zero unvetted production deployments, disaster recovery, and comprehensive system audit log tracking across all microservices and client applications.

---

### BoardQuest_Dean (Dean / Academic Administrator)
- **Ownership:** Owns institutional academic policies, department-wide curriculum structures, faculty hierarchy, program-level competency benchmarks, and official review center institutional partnerships.
- **Approval:** Approves subject additions/deactivations, onboarding and privilege delegation of Team Leads and Faculty Instructors, institutional Review Center affiliations, cohort milestone policies, and formal student guidance/intervention escalations.
- **Accountability:** Held accountable for institutional licensure examination passing rates, compliance with academic regulatory standards (e.g., CHED, PRC Board of Medical Technology), cross-departmental curriculum fidelity, and timely resolution of flagged academic deficiencies.

---

### BoardQuest_TeamLead (Subject Team Lead / Department Head)
- **Ownership:** Owns subject domain curriculum verticals (e.g., Clinical Chemistry, Microbiology, Hematology, Immunohematology), question bank syllabus distribution, teacher task allocations, and subject-level learning modules.
- **Approval:** Serves as the primary content gatekeeper—reviews, approves, requests revisions on, or rejects examination questions submitted by Teachers; authorizes publication of items to the live student question bank, and signs off on module release schedules.
- **Accountability:** Held accountable for question bank domain coverage, Bloom's Taxonomy rigor, item difficulty balancing, zero tolerance for incorrect answer keys or inaccurate clinical rationales, meeting item quota deadlines, and monitoring domain-specific student mastery diagnostics.

---

### BoardQuest_Teacher (Faculty Instructor / Question Author)
- **Ownership:** Owns the authoring of board exam questions, distractors, clinical explanations, learning module notes, and direct academic advising records for assigned students.
- **Approval:** Verifies clinical accuracy, answer key validity, and proper category/topic classification before submitting items into the review queue; signs off on revisions requested by the Team Lead, and marks student guidance interventions as resolved.
- **Accountability:** Held accountable for producing original, high-yield examination questions aligned with board exam syllabi, meeting assigned item authoring quotas, resolving editorial feedback within established turnaround times, and providing documented academic mentorship to assigned struggling students.

---

### BoardQuest_ReviewCenter (Review Center Representative / External Partner)
- **Ownership:** Owns external review center institutional profile, enrolled reviewee candidate rosters, diagnostic simulation batches, examination schedules, and external assessment score registries.
- **Approval:** Approves candidate enrollment rosters, finalizes schedules for mock board diagnostic examinations, releases student score cards and batch ranking reports, and authorizes official exam result email dispatches.
- **Accountability:** Held accountable for the accuracy of candidate rosters, punctuality of diagnostic exam execution, secure handling of candidate personal data, and delivery of objective diagnostic analytics reflecting licensure exam readiness.

---

### BoardQuest_Student (Student / Examinee / Reviewee)
- **Ownership:** Owns their individual study routine, gamified quest progression, daily login streaks, inventory/avatar customizations, mock exam attempts, and self-directed topic mastery drills.
- **Approval:** Confirms submission of timed exams, quizzes, and self-assessment evaluations; consents to the sharing of diagnostic performance metrics with assigned faculty advisors and review center coordinators for academic monitoring.
- **Accountability:** Held accountable for academic integrity during all assessments, consistent participation in required diagnostic simulations, meeting target subject proficiency thresholds, and proactively engaging in guidance interventions when placed under academic watch.

---

## 2. RACI Governance Matrix

| Lifecycle / Operational Domain | Super Admin | Dean | Team Lead | Teacher | Review Center | Student |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **System Codebase, DB & Infrastructure** | **A / R** | I | I | I | I | I |
| **System Logs, Backups & Security Settings** | **A / R** | C | I | I | I | I |
| **Academic Hierarchy & Faculty Onboarding** | R | **A** | C | I | I | I |
| **Subject Offerings & Curriculum Design** | I | **A** | R | C | I | I |
| **Question Bank Authoring & Drafting** | I | I | C | **A / R** | I | I |
| **Question Bank Review, Approval & Publishing** | C | C | **A / R** | C | I | I |
| **Learning Modules & Study Content** | I | C | **A** | R | I | I |
| **Review Center Partnerships & Program Setup** | I | **A** | C | I | R | I |
| **Mock Board Diagnostics & Score Publishing** | I | I | C | I | **A / R** | I |
| **Student Guidance Assignment & Mentorship** | I | **A** | R | R | I | I |
| **Exam Taking, Quest Progression & Practice** | I | I | I | I | I | **A / R** |

*Legend: **A** = Accountable (Final Decision/Gatekeeper), **R** = Responsible (Doer/Executor), **C** = Consulted (Input Provider), **I** = Informed (Updated)*

---

## 3. Role-Based Feature Access Matrix

| Feature / Module | Super Admin | Dean | Team Lead | Teacher | Review Center | Student |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Infrastructure & Global Config** | Full | None | None | None | None | None |
| **Audit Logs Management** | Full | View | None | None | None | None |
| **User Management** | Full | Full (TL, T, RC) | Limited (T) | None | None | None |
| **Subject Management** | View | Full | View/Manage | View | None | View |
| **Question Bank Studio (Authoring)** | Full | Full | Full | Own Questions | None | Practice Only |
| **Question Bank Review & Approval Queue** | Full | Full | Full | None | None | None |
| **Student Performance Analytics** | Institutional | Departmental | Domain-level | Assigned Class | Cohort-only | Personal Only |
| **Guidance / Intervention Dispatch** | None | Initiate | Assign/Track | Execute/Log | None | Recipient |
| **Review Center Portal & Scoring** | Full | View/Manage | View | None | Full | View Own Score |
| **Gamified Quests, XP & Streaks** | None | View | View | View | None | Active Player |
