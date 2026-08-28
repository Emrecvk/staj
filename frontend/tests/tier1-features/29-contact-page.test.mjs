import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

describe("Feature 29: İletişim sayfası", () => {
  const sayfaUrl = new URL("../../src/app/iletisim/page.tsx", import.meta.url);
  const baslikKaynak = readFileSync(
    new URL("../../src/components/site-header.tsx", import.meta.url),
    "utf8",
  );
  const mobilKaynak = readFileSync(
    new URL("../../src/components/mega-menu/mobil-menu.tsx", import.meta.url),
    "utf8",
  );
  const footerKaynak = readFileSync(
    new URL("../../src/components/site-footer.tsx", import.meta.url),
    "utf8",
  );

  it("Test 29.1: /iletisim rotası gerçek bir sayfa olarak tanımlıdır", () => {
    assert.equal(existsSync(sayfaUrl), true);
    const sayfaKaynak = readFileSync(sayfaUrl, "utf8");
    assert.ok(sayfaKaynak.includes("export default async function IletisimPage"));
    assert.ok(sayfaKaynak.includes("getCategories()"));
  });

  it("Test 29.2: Masaüstü, mobil ve footer iletişim bağlantıları sayfaya gider", () => {
    for (const kaynak of [baslikKaynak, mobilKaynak, footerKaynak]) {
      assert.ok(kaynak.includes('href="/iletisim"'));
    }
  });

  it("Test 29.3: Sayfa telefon, e-posta ve adres kanallarını sunar", () => {
    const sayfaKaynak = readFileSync(sayfaUrl, "utf8");
    assert.ok(sayfaKaynak.includes("tel:08503044400"));
    assert.ok(sayfaKaynak.includes("destek@cevik.com.tr"));
    assert.ok(sayfaKaynak.includes("İMES Sanayi Sitesi"));
  });

  it("Test 29.4: Footer e-bülten formu başarı göstermeden önce gerçek API'ye kaydeder", () => {
    assert.ok(footerKaynak.includes('fetch("/api/icerik/e-bulten"'));
    assert.ok(footerKaynak.includes('method: "POST"'));
    assert.ok(footerKaynak.includes("if (!yanit.ok)"));
    assert.ok(footerKaynak.includes("setKaydedildi(true)"));
    assert.ok(footerKaynak.includes('role="alert"'));
  });
});
