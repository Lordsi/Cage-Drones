export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>
        By accessing the CAGE platform or enrolling in any CAGE program, you
        agree to these Terms of Service. If you disagree, please discontinue use
        of the platform.
      </p>

      <h2>Use of the platform</h2>
      <ul>
        <li>You must provide accurate registration information and keep it current.</li>
        <li>Your account is personal — you are responsible for actions performed under it.</li>
        <li>Misuse, including unauthorised access, tampering with exam systems, or sharing assessment materials, may result in immediate termination.</li>
      </ul>

      <h2>Training programs</h2>
      <ul>
        <li>Fees, schedules, and course content are subject to change. Confirmed bookings receive notice of any material change.</li>
        <li>Certificates of completion are issued only on satisfactory completion of all assessment criteria.</li>
        <li>CAGE reserves the right to refuse or cancel training where weather, safety or operational conditions require it.</li>
      </ul>

      <h2>Drone operations</h2>
      <ul>
        <li>Pilots are responsible for ensuring their flights comply with all civil aviation and local-government regulations.</li>
        <li>Flight logs and checklists submitted through this platform form part of CAGE&apos;s aviation-safety record.</li>
      </ul>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, CAGE&apos;s aggregate liability
        relating to use of the platform is limited to the fees paid for the
        affected service in the preceding twelve months.
      </p>

      <p className="text-sm" style={{ color: "var(--muted)" }}>
        Last updated: {new Date().getFullYear()}.
      </p>
    </>
  );
}
