(() => {
  'use strict';

  const VERSION = '20260912-3';
  const DONE = 'epDifferentiationVersion';

  const SUBJECTS = {
    'bahasa-indonesia': { label: 'Bahasa Indonesia', family: 'language' },
    'bahasa-inggris': { label: 'Bahasa Inggris', family: 'language' },
    'bahasa-inggris-tingkat-lanjut': { label: 'Bahasa Inggris Tingkat Lanjut', family: 'language' },
    matematika: { label: 'Matematika', family: 'math' },
    'matematika-tingkat-lanjut': { label: 'Matematika Tingkat Lanjut', family: 'math' },
    ipas: { label: 'IPAS', family: 'science' },
    ipa: { label: 'IPA', family: 'science' },
    biologi: { label: 'Biologi', family: 'science' },
    fisika: { label: 'Fisika', family: 'science' },
    kimia: { label: 'Kimia', family: 'science' },
    ips: { label: 'IPS', family: 'social' },
    ekonomi: { label: 'Ekonomi', family: 'social' },
    geografi: { label: 'Geografi', family: 'social' },
    sejarah: { label: 'Sejarah', family: 'social' },
    sosiologi: { label: 'Sosiologi', family: 'social' },
    'pendidikan-pancasila': { label: 'Pendidikan Pancasila', family: 'values' },
    'pendidikan-agama-islam': { label: 'Pendidikan Agama Islam', family: 'religion' },
    pjok: { label: 'PJOK', family: 'pe' },
    'seni-rupa': { label: 'Seni Rupa', family: 'arts' },
    'seni-musik': { label: 'Seni Musik', family: 'arts' },
    'seni-budaya': { label: 'Seni Budaya', family: 'arts' },
    prakarya: { label: 'Prakarya', family: 'craft' },
    informatika: { label: 'In¶»§q«^