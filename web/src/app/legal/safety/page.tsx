export default function SafetyPage() {
  return (
    <>
      <h1>Safety Protocols</h1>
      <p>
        Safety is at the centre of every CAGE operation. The following
        protocols apply to all flights conducted by CAGE staff, students, and
        partner pilots.
      </p>

      <h2>Pre-flight</h2>
      <ul>
        <li>A documented site survey must be completed before any flight.</li>
        <li>Airspace clearance and applicable NOTAMs must be checked.</li>
        <li>Weather must remain within the approved operating envelope for the aircraft and mission.</li>
        <li>The full digital pre-flight checklist must be completed in the CAGE platform.</li>
      </ul>

      <h2>During flight</h2>
      <ul>
        <li>Visual line of sight is maintained unless explicit BVLOS authorisation has been issued.</li>
        <li>Crew briefing and emergency procedures are confirmed before take-off.</li>
        <li>A pilot-in-command and visual observer are present for training operations.</li>
      </ul>

      <h2>Post-flight</h2>
      <ul>
        <li>The post-flight checklist is completed and submitted in the CAGE platform.</li>
        <li>Any anomaly, incident, or near-miss is reported within 24 hours.</li>
        <li>Maintenance findings are escalated to engineering before the next flight.</li>
      </ul>

      <h2>Incident reporting</h2>
      <p>
        Report any incident immediately to{" "}
        <a href="mailto:safety@cagemw.com">safety@cagemw.com</a>. Critical
        incidents are escalated to the relevant civil aviation authority as
        required by law.
      </p>
    </>
  );
}
