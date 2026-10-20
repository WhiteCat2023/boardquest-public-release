import React from "react";
import { FileText, ShieldCheck } from "lucide-react";

export const TermsAndPrivacyContent: React.FC = () => {
  return (
    <div className="space-y-6 text-xs text-foreground/90 leading-relaxed pr-1">
      {/* Part 1: Terms & Conditions */}
      <div className="space-y-3.5">
        <div className="border-b border-border/60 pb-2">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <FileText className="size-3.5 text-primary" />
            Faculty Terms and Conditions of System Use
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Governing academic access, question authoring, module publishing,
            and evaluation integrity.
          </p>
        </div>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            1. Authorized Institutional Access
          </p>
          <p className="text-muted-foreground">
            Access to this portal is granted exclusively to appointed academic
            personnel (Deans, Team Leads, and Teachers). Access is
            non-transferable, and you may only access features and student
            cohorts assigned to your department.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            2. Credential Security & Password Integrity
          </p>
          <p className="text-muted-foreground">
            Upon first sign-in, all faculty members must replace provisional
            passwords with a strong, private credential. You are solely
            responsible for actions performed under your credentials. Multi-user
            credential sharing is strictly prohibited.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            3. Intellectual Property & Question Bank Confidentiality
          </p>
          <p className="text-muted-foreground">
            All examination items, learning modules, test keys, and curriculum
            artifacts created or uploaded into this portal remain the
            intellectual property of the institution. Downloading, distributing,
            screen-recording, or publishing examination items to external
            repositories or unauthorized commercial study platforms is an offense
            subject to disciplinary action.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            4. Academic Integrity & Accurate Evaluation
          </p>
          <p className="text-muted-foreground">
            Faculty must ensure rigorous fairness in student evaluations, quiz
            authoring, and review pacing. Tampering with scores, unauthorized
            quota falsification, or circumvention of review center guidelines
            constitutes academic dishonesty.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            5. Immutable Audit Trails
          </p>
          <p className="text-muted-foreground">
            For security and quality assurance, system activities—including
            question authoring, status approvals, guidance outreach, and module
            management—are logged with timestamps and IP addresses.
          </p>
        </section>
      </div>

      {/* Section Divider */}
      <div className="relative py-2 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/80" />
        </div>
        <span className="relative bg-card px-3 py-0.5 rounded-full text-[10px] font-semibold text-muted-foreground border border-border/80 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
          <ShieldCheck className="size-3 text-primary" />
          Data Privacy Act of 2012
        </span>
      </div>

      {/* Part 2: Data Privacy Act */}
      <div className="space-y-3.5">
        <div className="border-b border-border/60 pb-2">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" />
            Data Privacy Act of 2012 (Republic Act No. 10173) Notice
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Compliance standard with National Privacy Commission (NPC)
            regulations of the Philippines.
          </p>
        </div>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            1. Statutory Framework & Scope
          </p>
          <p className="text-muted-foreground">
            In compliance with Republic Act No. 10173 (DPA of 2012) and its
            Implementing Rules and Regulations, this institution ensures that
            all personal information and sensitive personal records of students
            and faculty are processed lawfully and securely.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            2. Core Principles: Transparency, Legitimate Purpose & Proportionality
          </p>
          <p className="text-muted-foreground">
            Data collected—such as student diagnostic quiz answers, pacing
            progress, outreach notes, and faculty workload—is used strictly for
            educational assessments, board examination preparation, and academic
            retention initiatives. No data is shared with unauthorized third
            parties.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            3. Faculty Confidentiality Obligation
          </p>
          <p className="text-muted-foreground">
            As an authorized personnel handling student performance logs,
            contact information, and academic diagnostics, you are legally bound
            to hold all information in strict confidence. Unauthorized disclosure,
            extraction, or informal sharing of student records constitutes a
            breach under RA 10173.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            4. Rights of Data Subjects
          </p>
          <p className="text-muted-foreground">
            Students and personnel possess the Right to be Informed, Right to
            Access, Right to Rectification, Right to Erasure or Blocking, and
            Right to File a Complaint before the National Privacy Commission in
            instances of privacy infringement.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            5. Breach Reporting & Statutory Penalties
          </p>
          <p className="text-muted-foreground">
            Violations of RA 10173 carry statutory criminal penalties, including
            imprisonment and fines under Section 25–34, alongside institutional
            administrative termination. Suspected breaches must be immediately
            escalated to the institution&apos;s Data Protection Officer (DPO).
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndPrivacyContent;
