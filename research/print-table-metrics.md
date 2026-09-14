# Print table metrics repair

The latest screenshots have equal 207 page counts, but the first meeting page loses its final learning-stage row in print. The shared supervision runtime changes all meeting tables to 9.15pt and cell padding to 1.55mm 1.8mm only in print. The differentiation runtime additionally changes table size to 8.6pt and vertical padding to 2.1mm only in print. These run after preview pagination and invalidate its measurements.

Remove both print-only metric overrides, preserving existing screen styles. Serve the complete supervision runtime locally so all A–F routes use the repaired file instead of its remote loader. Keep previous paper dimensions and frozen page boundaries. No subject data changed.

Validation: both scripts parse with new Function; exact obsolete CSS blocks checked before replacement and absent afterwards. Production delivery must be checked after deployment. No browser/PDF renderer is available in this session; visual parity and all subject outputs are not yet verified.
