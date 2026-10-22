import React from "react";
import { FileText, ShieldCheck } from "lucide-react";

export const TermsAndPrivacyContent: React.FC = () => {
  return (
    <div className="space-y-6 text-xs text-foreground/90 leading-relaxed pr-1">
      {/* Part 1: Review Center Partner Terms & Conditions */}
      <div className="space-y-3.5">
        <div className="border-b border-border/60 pb-2">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <FileText className="size-3.5 text-primary" />
            Review Center Partner Terms and Conditions of System Use
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Governing partner portal access, candidate score synchronization,
            mock examination records, and institutional collaboration.
          </p>
        </div>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            1. Authorized Review Center Partner Access
          </p>
          <p className="text-muted-foreground">
            Access to this portal is granted strictly to accredited partner
            review center representatives appointed to collaborate with the
            university. Access credentials are non-transferable and must only
            be utilized to oversee candidate batches, review schedules, and
            examination assessments officially endorsed under the institutional
            partnership agreement.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            2. Credential Security & Password Integrity
          </p>
          <p className="text-muted-foreground">
            Upon first sign-in, all review center representatives must replace
            provisional credentials with an encrypted permanent password. You
            are solely responsible for all submissions, score uploads, and
            schedule modifications made through your account. Multi-user
            credential sharing across unverified staff is strictly prohibited.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            3. Candidate & Student Data Protection & Confidentiality
          </p>
          <p className="text-muted-foreground">
            All candidate academic records, student numbers, diagnostic quiz
            ratings, and mock board performance metrics retrieved from or
            submitted to BoardQuest are confidential institutional data.
            Extracting, reselling, reproducing, or sharing student performance
            indicators with unauthorized third parties or for unauthorized
            promotional marketing is strictly forbidden.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            4. Assessment Accuracy & Evaluation Integrity
          </p>
          <p className="text-muted-foreground">
            Review center representatives must maintain absolute integrity when
            recording subject scores, mock board examination percentages, and
            attendance milestones. Deliberate misrepresentation, retroactive
            unauthorized tampering, or unauthorized alteration of student
            readiness metrics violates partnership covenants.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            5. Immutable Audit Trails & System Monitoring
          </p>
          <p className="text-muted-foreground">
            For academic verification and partner compliance, all actions taken
            within the portal—including candidate roster lookups, score
            submissions, schedule creations, and account modifications—are
            logged in audit ledgers with cryptographic timestamps and IP
            addresses.
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

      {/* Part 2: Data Privacy Act of 2012 Notice */}
      <div className="space-y-3.5">
        <div className="border-b border-border/60 pb-2">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-primary" />
            Data Privacy Act of 2012 (Republic Act No. 10173) Notice
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Compliance standard with the National Privacy Commission (NPC) of the
            Philippines for educational data processing.
          </p>
        </div>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            1. Statutory Framework & Processing Scope
          </p>
          <p className="text-muted-foreground">
            In compliance with Republic Act No. 10173 (DPA of 2012) and its
            Implementing Rules and Regulations, all student candidate personal
            information and diagnostic assessment data processed through the
            Review Center Portal are treated with high-standard security controls.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            2. Core Principles: Transparency, Legitimate Purpose & Proportionality
          </p>
          <p className="text-muted-foreground">
            Candidate information—including identification details, discipline
            mock scores, and cohort passing rate analytics—is processed solely
            for the legitimate purpose of tracking board examination readiness,
            curriculum alignment, and targeted academic remediation.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            3. Partner Representative Confidentiality Undertaking
          </p>
          <p className="text-muted-foreground">
            As a partner representative granted access to examinee data, you are
            bound by professional and statutory non-disclosure obligations. You
            must safeguard student identities and ensure all physical and digital
            transcripts conform to secure handling guidelines under RA 10173.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            4. Rights of Data Subjects
          </p>
          <p className="text-muted-foreground">
            Students and examinees maintain statutory rights under RA 10173,
            including the Right to be Informed, Right to Access, Right to
            Rectification of inaccurate performance logs, and Right to file a
            complaint before the National Privacy Commission.
          </p>
        </section>

        <section className="space-y-1">
          <p className="font-semibold text-foreground">
            5. Incident Escalation & Statutory Penalties
          </p>
          <p className="text-muted-foreground">
            Any suspected security incident, unauthorized data disclosure, or
            credential compromise must be escalated immediately to the
            institution&apos;s Data Protection Officer (DPO). Unlawful processing
            or gross negligence carries statutory penalties under RA 10173,
            including civil liability, criminal fines, and imprisonment.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndPrivacyContent;
