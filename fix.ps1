$c = Get-Content c:/Users/ASUS/Desktop/Staj/src/Cevik.Altyapi/Kimlik/Servisler/KimlikServisi.cs -Raw -Encoding UTF8

$c = $c -replace 'if \(kullanici == null\) return true; // Enumeration engelleme', 'if (kullanici == null) return null; // Enumeration engelleme'
$c = $c -replace 'await _epostaServisi.EpostaGonderAsync\(kullanici.Eposta, "Şifre Sıfırlama Talebi", \$"Şifre sıfırlama kodunuz: \{token\}"\);\r?\n\s*return true;',"await _epostaServisi.EpostaGonderAsync(kullanici.Eposta, `"Şifre Sıfırlama Talebi`", `"$Şifre sıfırlama kodunuz: {token}`");`n        return token;"

$c = $c -replace 'if \(kullanici == null \|\| kullanici.EpostaDogrulandiMi\) return false;', 'if (kullanici == null || kullanici.EpostaDogrulandiMi) return null;'
$c = $c -replace 'await _epostaServisi.EpostaGonderAsync\(kullanici.Eposta, "E-Posta Doğrulama", \$"E-posta doğrulama kodunuz: \{token\}"\);\r?\n\s*return true;',"await _epostaServisi.EpostaGonderAsync(kullanici.Eposta, `"E-Posta Doğrulama`", `"$E-posta doğrulama kodunuz: {token}`");`n        return token;"

Set-Content c:/Users/ASUS/Desktop/Staj/src/Cevik.Altyapi/Kimlik/Servisler/KimlikServisi.cs $c -Encoding UTF8
