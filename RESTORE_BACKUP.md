# Pemulihan Source E-Perangkat

Backup ini berupa Git bundle lengkap agar 2.192 file dan riwayat commit tersimpan secara utuh tanpa duplikasi aset.

## Linux/macOS

```bash
cat backups/e-perangkat-source-2026-09-11.bundle.part-* > e-perangkat-source.bundle
sha256sum e-perangkat-source.bundle
git clone e-perangkat-source.bundle e-perangkat-restored
```

Checksum bundle yang benar:

```text
3fbc5936318cf413e720ca1e720d94ff581cfd79e96e1f3057b8e43e06e61a32
```

## Windows PowerShell

```powershell
$parts = Get-ChildItem backups/e-perangkat-source-2026-09-11.bundle.part-* | Sort-Object Name
$out = [System.IO.File]::Create("e-perangkat-source.bundle")
foreach ($part in $parts) {
  $bytes = [System.IO.File]::ReadAllBytes($part.FullName)
  $out.Write($bytes, 0, $bytes.Length)
}
$out.Close()
git clone e-perangkat-source.bundle e-perangkat-restored
```

Commit source di dalam bundle: `9b4157c339b228e3ab0c7eb5f17ff294938e38f5`.
