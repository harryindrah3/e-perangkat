# Genarator E-Perangkat

Independent static Vercel project, with an unpacked Manifest V3 Chrome companion.
Production target: `genarator-e-perangkat`, separate from `e-perangkat-online-a-f`.
Source lives on branch `generator-e-perangkat` in `harryindrah3/e-perangkat`.

## Why local Chrome

The current manual print uses Times New Roman and Arial installed on the user's
computer and order-local assets omitted by cloud synchronization. The previous
server renderer replaced font families after pagination and restricted PDF
pageRanges. This implementation uses the user's own Chrome `Page.printToPDF`,
original CSS and font installation. It never sets pageRanges or rewrites fonts.
It is a downloadable Chrome extension, not a server PDF implementation.

## Flow

The dashboard asks the extension for local order summaries. It never receives
full order payloads, signatures, student data or a cloud database credential.
The extension reads local storage on the exact original production origin.
It opens an ephemeral tab and provides an in-memory localStorage view for the
selected order before navigation. Database requests in that tab are blocked.
It waits for fonts/images and stable content, activates print media, runs
beforeprint hooks, and invokes native PDF output. A changed layout is rendered
again once. pdf-lib validates the resulting page count. Downloads are confirmed
complete; errors stop the queue and show an actionable message.

Only these original production URLs and generator origin are authorized by the
extension. No server data endpoint and no old Vercel project mutation is needed.
Closing/canceling a generation cleans up only the temporary tab. The source tab
remains available. Existing E-Perangkat synchronization runs normally if the
extension needs to open its portal for the user.

## Build and verification

`node --test tests/core.test.cjs` tests URL restrictions, class validation,
identity isolation, local image/calendar preservation and catalog completeness.

`python build.py` copies the catalog into the extension and builds its ZIP.
Deploy root-level web files and downloads/ to the new Vercel project. No npm
installation or build service is needed. The unpacked extension is installed
on the user's Chrome once. Extension origins must match the production alias.

## Validation boundary

Observed original manual preview on 2026-09-12: Bahasa Indonesia Fase C, class V,
semester I: 151 DOM pages; Times New Roman/Arial; portrait and landscape pages.
Unit tests and dashboard browser checks do not prove native extension PDF parity.
The user's Windows Chrome extension execution still needs a first real download
and visual comparison with their existing manual PDF. No claim of pixel-perfect
parity across operating systems or all 78 apps is made before that comparison.
Count checks detect incomplete output but do not detect every layout defect.

## Dependencies

Vendored pdf-lib 1.17.1 (MIT), license included, used only to read page counts.
No external scripts, font services, database credentials or paid rendering API.

## Original application preservation

Original source reference: b940c79937754127744cc8118cd1352ba2cd5c3a.
Original production observed: dpl_9o2EhbmxUQ9JMG5xPjLDFwv2z6FL.
No original branch, deployment, alias, database or application code is modified.
