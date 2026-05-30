export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        CAGE Drone Services & Training (&ldquo;CAGE&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to
        protecting the privacy of clients, students, instructors, and visitors. This
        policy describes the personal data we collect, how we use it, and the
        choices you have.
      </p>

      <h2>Data we collect</h2>
      <ul>
        <li>Contact details you submit through booking, quotation, training application or contact forms.</li>
        <li>Account information for portal users — name, email, role, profile preferences.</li>
        <li>Learning records — course enrollments, exam attempts, assignment submissions, grades, certificates.</li>
        <li>Flight operations data — flights you log, pre/post-flight checklists, instructor evaluations.</li>
        <li>Technical logs — IP address, browser metadata used to operate and secure the platform.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To deliver the services, training programs and certifications you request.</li>
        <li>To manage your account, communicate operational updates and respond to inquiries.</li>
        <li>To meet legal, regulatory and aviation-safety record-keeping obligations.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We do not sell personal data. Information may be shared with vetted
        service providers (e.g. email delivery, cloud hosting) under contractual
        confidentiality, or with regulators where legally required.
      </p>

      <h2>Retention</h2>
      <p>
        Training records and flight logs are retained for the period required by
        applicable civil aviation regulations. Marketing inquiries are kept for
        up to 24 months unless you request earlier deletion.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your personal
        data by emailing <a href="mailto:info@cagemw.com">info@cagemw.com</a>.
      </p>

      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Last updated: {new Date().getFullYear()}.
      </p>
    </>
  );
}
