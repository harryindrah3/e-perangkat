# Preview/PDF pagination repair
Observed user example: Matematika Fase A, Kelas I, semester 2: preview 217 pages, saved PDF 262 pages, continuation rows overlap the footer and blank pages appear.
Confirmed source conflicts:
- assets/print.css changes the physical .page width/height to auto under print media.
- print-safe-pages.js previously called restorePages() and repaginated in beforeprint, so screen pagination was discarded and measured under print rules.
Changes: explicit portrait and landscape sheet dimensions in print, matching the preview; no continuation merging during beforeprint; defer pagination while the print dialog is active; suppress the final forced page break.
Validation: JavaScript syntax and lifecycle mock tests passed. Real PDF rendering/page-count comparison is still pending because no browser or execution environment is currently available. No claim of verified PDF parity.
Rollback production: dpl_EUcrWERF1RHZEtcPBBdVuBTUVH5F.
