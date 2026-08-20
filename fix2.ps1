$c = Get-Content c:/Users/ASUS/Desktop/Staj/src/Cevik.Api/Controllers/KimlikController.cs -Raw -Encoding UTF8

$c = $c -replace 'var sonuc = await _kimlikServisi.EpostaDogrulamaTalebiOlusturAsync\(userId\);', 'var token = await _kimlikServisi.EpostaDogrulamaTalebiOlusturAsync(userId);'
$c = $c -replace 'if \(sonuc\)', 'if (token != null)'
$c = $c -replace 'return Ok\(new \{ Mesaj = "Doğrulama e-postası gönderildi." \}\);', 'return Ok(new { Mesaj = "Doğrulama e-postası gönderildi.", DevToken = token });'
$c = $c -replace 'return Ok\(new \{ Mesaj = "DoÄŸrulama e-postasÄ± gÃ¶nderildi." \}\);', 'return Ok(new { Mesaj = "Doğrulama e-postası gönderildi.", DevToken = token });'

Set-Content c:/Users/ASUS/Desktop/Staj/src/Cevik.Api/Controllers/KimlikController.cs $c -Encoding UTF8

$c2 = Get-Content c:/Users/ASUS/Desktop/Staj/tests/Cevik.BirimTestleri/GelismişKimlikTestleri.cs -Raw -Encoding UTF8
$c2 = $c2 -replace 'new Moq.Mock<Cevik.Uygulama.Ortak.Arayuzler.IEpostaServisi>\(\)\.Object', 'null'
Set-Content c:/Users/ASUS/Desktop/Staj/tests/Cevik.BirimTestleri/GelismişKimlikTestleri.cs $c2 -Encoding UTF8
