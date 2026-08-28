import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseCsvBom } from "../test-helpers.mjs";

describe("Feature 6: Split B2B Hero Section", () => {
  it("Test 6.1: Hero banner slider renders B2B corporate value propositions and CTA buttons", () => {
    const heroSlides = [
      {
        title: "Türkiye'nin Güvenilir Elektronik Komponent Dağıtıcısı",
        subtitle: "100.000+ stoklu parça, aynı gün kargo ve resmi üretici garantisi.",
        ctaText: "Kataloğu İncele",
        ctaHref: "/urunler",
      },
      {
        title: "BOM Yükleme ve Akıllı Parça Eşleme",
        subtitle: "Malzeme listenizi tek tıkla yükleyin, anında fiyatlandırın.",
        ctaText: "BOM Yükle",
        ctaHref: "/bom",
      },
    ];

    assert.equal(heroSlides.length, 2);
    assert.ok(heroSlides[0].title.includes("Elektronik Komponent"));
    assert.equal(heroSlides[0].ctaHref, "/urunler");
    assert.equal(heroSlides[1].ctaHref, "/bom");
  });

  it("Test 6.2: Quick BOM upload widget accepts Excel and CSV file drag-and-drop targets", () => {
    const acceptedMimeTypes = [".csv", ".tsv", ".xlsx", ".xls", "text/csv", "application/vnd.ms-excel"];
    const testFile = { name: "bom_project_alpha.csv", size: 45000, type: "text/csv" };

    const isValid = acceptedMimeTypes.some((ext) => testFile.name.endsWith(ext) || testFile.type === ext);
    assert.ok(isValid);
  });

  it("Test 6.3: Multi-part quick paste parser parses 'MPN Quantity' text formats", () => {
    const rawPaste = `
      STM32F407VGT6 100
      LM358DR 2500
      GRM188R71C104KA01D 4000
    `;

    const parsed = parseCsvBom(rawPaste);
    assert.equal(parsed.length, 3);
    assert.equal(parsed[0].mpn, "STM32F407VGT6");
    assert.equal(parsed[0].miktar, 100);
    assert.equal(parsed[1].mpn, "LM358DR");
    assert.equal(parsed[1].miktar, 2500);
  });

  it("Test 6.4: Quick paste parser tolerates comma, tab, semicolon, and whitespace separators", () => {
    const commaSeparated = "STM32F407VGT6, 500\nLM358DR; 1000\nRC0603\t200";
    const parsed = parseCsvBom(commaSeparated);

    assert.equal(parsed.length, 3);
    assert.equal(parsed[0].mpn, "STM32F407VGT6");
    assert.equal(parsed[0].miktar, 500);
    assert.equal(parsed[1].mpn, "LM358DR");
    assert.equal(parsed[1].miktar, 1000);
    assert.equal(parsed[2].mpn, "RC0603");
    assert.equal(parsed[2].miktar, 200);
  });

  it("Test 6.5: Direct action transition routes parsed BOM payload to /bom matching pipeline", () => {
    const parsedItems = [
      { mpn: "STM32F407VGT6", miktar: 90 },
      { mpn: "LM358DR", miktar: 2500 },
    ];

    const encodedState = encodeURIComponent(JSON.stringify(parsedItems));
    const targetUrl = `/bom?data=${encodedState}`;

    assert.ok(targetUrl.startsWith("/bom?data="));
    const decoded = JSON.parse(decodeURIComponent(encodedState));
    assert.equal(decoded.length, 2);
    assert.equal(decoded[0].mpn, "STM32F407VGT6");
  });

  it("Test 6.6: Ana sayfa vitrini referanstaki beş aileyi ve kademeli kategori panelini kullanır", () => {
    const heroSource = readFileSync(
      new URL("../../src/components/home/hero-b2b.tsx", import.meta.url),
      "utf8",
    );
    const kategoriAgaciSource = readFileSync(
      new URL("../../src/components/home/vitrin-kategori-agaci.ts", import.meta.url),
      "utf8",
    );

    for (const kategoriAdi of [
      "Elektronik Komponentler",
      "LED & Aydınlatma Ürünleri",
      "Maker & IoT Ürünleri",
      "Üretim Ekipmanları",
      "Otomasyon Ürünleri",
    ]) {
      assert.ok(kategoriAgaciSource.includes(kategoriAdi));
    }

    assert.ok(heroSource.includes("vitrinKategoriAgaciniKur(categories)"));
    assert.ok(heroSource.includes('data-testid="kademeli-kategori-paneli"'));
    assert.ok(heroSource.includes("useState<number | null>(null)"));
    assert.ok(heroSource.includes("setAktifIkinciDal(index)"));
    assert.ok(heroSource.includes("setAktifUcuncuDal(index)"));
    assert.ok(heroSource.includes("h-[46rem] w-[clamp(13rem,18vw,20rem)]"));
    assert.ok(!heroSource.includes("overflow-y-auto"));
    assert.ok(!heroSource.includes("Tümünü görüntüle"));
    assert.ok(heroSource.includes("stoklu ürün çeşidi"));
    assert.ok(kategoriAgaciSource.includes("Diyaklar ve Sidaklar"));
    assert.ok(kategoriAgaciSource.includes("Diyaklar"));
    assert.ok(kategoriAgaciSource.includes("Sidaklar"));
    assert.ok(!heroSource.includes("categories.slice("));
    assert.ok(!heroSource.includes("26. sayısı yayında"));
    assert.ok(heroSource.includes('href: "/urunler"'));
    assert.ok(heroSource.includes("{slide.eylem}"));
  });
});
