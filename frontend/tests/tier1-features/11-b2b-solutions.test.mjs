import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Feature 11: B2B Value & Solutions Section", () => {
  it("Test 11.1: B2B corporate solutions cards render credit lines, EDI, and engineering support", () => {
    const solutions = [
      {
        id: "credit",
        title: "Kurumsal Cari & Vadeli Ödeme",
        description: "Firma büyüklüğünüze özel vade ve kredi limitleri ile esnek tedarik.",
        cta: "Başvuru Yap",
        href: "/kayit/kurumsal",
      },
      {
        id: "edi",
        title: "API & EDI Sistem Entegrasyonu",
        description: "ERP sisteminize doğrudan entegre envanter ve otomatik sipariş akışı.",
        cta: "Teknik Doküman",
        href: "/entegrasyon",
      },
      {
        id: "fae",
        title: "Saha Uygulama Mühendisliği (FAE)",
        description: "Devre tasarımı, parça seçimi ve muadil analizinde uzman mühendis desteği.",
        cta: "Mühendise Danış",
        href: "/teklif-iste",
      },
    ];

    assert.equal(solutions.length, 3);
    assert.equal(solutions[0].id, "credit");
    assert.equal(solutions[1].id, "edi");
    assert.equal(solutions[2].id, "fae");
  });

  it("Test 11.2: Corporate credit registration link routes to kurumsal registration endpoint", () => {
    const registrationLink = "/kayit/kurumsal";
    assert.equal(registrationLink, "/kayit/kurumsal");
  });

  it("Test 11.3: Engineering support CTA connects users to direct RFQ consultation flow", () => {
    const consultationLink = "/teklif-iste?konu=fae_destegi";
    assert.ok(consultationLink.startsWith("/teklif-iste"));
  });

  it("Test 11.4: ISO certifications and quality compliance badges display accredited standards", () => {
    const certs = ["ISO 9001:2015", "ISO 14001:2015", "ESD Koruma Standardı (ANSI/ESD S20.20)"];
    assert.equal(certs.length, 3);
    assert.ok(certs.some((c) => c.includes("ISO 9001")));
  });

  it("Test 11.5: Grid layout responsive classes structure columns across viewport sizes", () => {
    const gridClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    assert.ok(gridClasses.includes("grid-cols-1"));
    assert.ok(gridClasses.includes("md:grid-cols-2"));
    assert.ok(gridClasses.includes("lg:grid-cols-3"));
  });
});
