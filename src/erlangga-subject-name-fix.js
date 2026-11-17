(()=>{"use strict";
const path=location.pathname;
const variants=[
  {needle:"E-Perangkat_bahasa-inggris-erlangga_Fase-B",canonical:"Bahasa Inggris",brand:"Bahasa Inggris Erlangga 路 Kelas III",heroFrom:"Perangkat B. Inggris",heroTo:"Perangkat Bahasa Inggris"},
  {needle:"E-Perangkat_pendidikan-agama-islam-erlangga_Fase-A",canonical:"Pendidikan Agama Islam dan Budi Pekerti",brand:"PAI BP Erlangga 路 Fase A",heroFrom:"Perangkat PAIBP",heroTo:"Perangkat Pendidikan Agama Islam dan Budi Pekerti"},
  {needle:"E-Perangkat_pendidikan-agama-islam-erlangga_Fase-B",canonical:"Pendidikan Agama Islam dan Budi Pekerti",brand:"PAI BP Erlangga 路 Fase B",heroFrom:"Perangkat PAIBP",heroTo:"Perangkat Pendidikan Agama Islam dan Budi Pekerti"},
  {needle:"E-Perangkat_pendidikan-agama-islam-erlangga_Fase-C",canonical:"Pendidikan Agama Islam dan Budi Pekerti",brand:"PAI BP Erlangga 路 Fase C",heroFrom:"Perangkat PAIBP",heroTo:"Perangkat Pendidikan Agama Islam dan Budi Pekerti"},
  {needle:"E-Perangkat_bahasa-indonesia-erlangga_Fase-B",canonical:"Bahasa Indonesia",brand:"Bahasa Indonesia Erlangga 路 Kelas III",heroFrom:"Perangkat B. Indonesia",heroTo:"Perangkat Bahasa Indonesia"},
  {needle:"E-Perangkat_ipas-erlangga_Fase-B",canonical:"Ilmu Pengetahuan Alam dan Sosial (IPAS)",brand:"IPAS Erlangga 路 Kelas III",heroFrom:"Perangkat IPAS",heroTo:"Perangkat Ilmu Pengetahuan Alam dan Sosial (IPAS)"},
  {needle:"E-Perangkat_matematika-erlangga_Fase-B",canonical:"Matematika",brand:"Matematika Erlangga 路痘玘