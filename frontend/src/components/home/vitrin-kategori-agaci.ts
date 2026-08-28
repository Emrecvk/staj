import type { Category } from "@/lib/api";

export interface VitrinKategoriDali {
  anahtar: string;
  ad: string;
  href: string;
  altlar: VitrinKategoriDali[];
}

function kategoriBaglantisi(kategoriId: number, aramaMetni?: string) {
  const parametreler = new URLSearchParams({ kategoriId: String(kategoriId) });
  if (aramaMetni) parametreler.set("aramaMetni", aramaMetni);
  return `/urunler?${parametreler.toString()}`;
}

function kategoriHaritasi(categories: Category[]) {
  const harita = new Map<string, Category>();

  const ekle = (kategori: Category) => {
    harita.set(kategori.slug, kategori);
    kategori.altKategoriler.forEach(ekle);
  };

  categories.forEach(ekle);
  return harita;
}

function gercekDal(
  kategori: Category,
  ad = kategori.ad,
  altlar = kategori.altKategoriler.map((altKategori) => gercekDal(altKategori)),
  anahtar = `kategori-${kategori.id}`,
  aramaMetni?: string,
): VitrinKategoriDali {
  return {
    anahtar,
    ad,
    href: kategoriBaglantisi(kategori.id, aramaMetni),
    altlar,
  };
}

function sanalDal(
  anahtar: string,
  ad: string,
  href: string,
  altlar: VitrinKategoriDali[],
): VitrinKategoriDali {
  return { anahtar, ad, href, altlar };
}

function mevcutDallar(...dallar: Array<VitrinKategoriDali | undefined>) {
  return dallar.filter((dal): dal is VitrinKategoriDali => Boolean(dal));
}

// Üstteki beş ürün ailesi vitrinin sunum katmanıdır. Alt bağlantıların tamamı
// canlı katalogdaki kategori kimliklerine gider; böylece referans adları
// korunurken eski sabit ağacın boş sonuç sorunu geri gelmez.
export function vitrinKategoriAgaciniKur(categories: Category[]): VitrinKategoriDali[] {
  const harita = kategoriHaritasi(categories);
  const kategori = (slug: string) => harita.get(slug);

  const ayrik = kategori("ayrik-yari-iletkenler");
  const tristorkler = kategori("tristor-triyaklar");
  const diyotlar = kategori("diyotlar");
  const zenerler = kategori("zener-diyotlar");
  const gucModulleri = kategori("igbt-guc-modulleri");
  const montajDonanimlari = kategori("montaj-donanimlari");
  const mosfetler = kategori("mosfetler");
  const transistorkler = kategori("bipolar-transistorler");

  const gucYariIletkenleri = ayrik
    ? gercekDal(
        ayrik,
        "Güç Yarı İletkenleri",
        mevcutDallar(
          tristorkler
            ? gercekDal(
                tristorkler,
                "Diyaklar ve Sidaklar",
                [
                  gercekDal(tristorkler, "Diyaklar", [], "diyaklar"),
                  gercekDal(tristorkler, "Sidaklar", [], "sidaklar", "SIDAC"),
                ],
                "diyaklar-ve-sidaklar",
              )
            : undefined,
          diyotlar
            ? gercekDal(
                diyotlar,
                "Diyotlar, Modül Diyotlar ve Doğrultucular",
                mevcutDallar(
                  gercekDal(diyotlar, "Diyotlar", []),
                  zenerler ? gercekDal(zenerler, "Zener Diyotlar", []) : undefined,
                ),
                "diyotlar-ve-dogrultucular",
              )
            : undefined,
          gucModulleri ? gercekDal(gucModulleri, "Güç Modülleri", []) : undefined,
          montajDonanimlari
            ? gercekDal(montajDonanimlari, "Güç Yarı İletkeni Aksesuarları", [])
            : undefined,
          gucModulleri ? gercekDal(gucModulleri, "IGBTler", [], "igbtler") : undefined,
          mosfetler ? gercekDal(mosfetler, "Mosfetler", []) : undefined,
          transistorkler ? gercekDal(transistorkler, "Transistörler", []) : undefined,
          tristorkler
            ? gercekDal(tristorkler, "Tristörler", [], "tristorler", "THYRISTOR")
            : undefined,
          tristorkler ? gercekDal(tristorkler, "Triyaklar", [], "triyaklar", "TRIAC") : undefined,
        ),
        "guc-yari-iletkenleri",
      )
    : undefined;

  const yariIletkenler = kategori("yari-iletkenler");
  const gucYonetimi = kategori("guc-yonetimi");
  const devreKoruma = kategori("devre-koruma");
  const pasifler = kategori("pasif-komponentler");
  const sensorler = kategori("sensorler");
  const elektromekanik = kategori("elektromekanik");
  const ekranlar = kategori("lcd-oled-ekranlar");
  const optoelektronik = kategori("optoelektronik");
  const kabloKart = kategori("kablo-kart-konnektorler");
  const kartKart = kategori("kart-kart-konnektorler");
  const klemensler = kategori("pcb-klemensler");
  const arayuzKonnektorleri = kategori("arayuz-konnektorleri");
  const kablolar = kategori("kablo-baglanti");
  const bataryalar = kategori("piller-tutucular");
  const gucKaynaklari = kategori("guc-kaynaklari");
  const kablosuz = kategori("kablosuz-rf");

  const elektronikAltlar = mevcutDallar(
    gucYariIletkenleri,
    devreKoruma ? gercekDal(devreKoruma, "Devre Koruyucular") : undefined,
    pasifler ? gercekDal(pasifler, "Pasif Komponentler") : undefined,
    yariIletkenler
      ? gercekDal(
          yariIletkenler,
          "Entegre Devreler (IC'ler)",
          [
            ...yariIletkenler.altKategoriler.map((altKategori) => gercekDal(altKategori)),
            ...(gucYonetimi?.altKategoriler.map((altKategori) => gercekDal(altKategori)) ?? []),
          ],
          "entegre-devreler",
        )
      : undefined,
    sensorler ? gercekDal(sensorler, "Sensörler & Transdüserler") : undefined,
    elektromekanik ? gercekDal(elektromekanik, "Elektromekanik Komponentler") : undefined,
    ekranlar ? gercekDal(ekranlar, "TFT, LCD ve LED Ekranlar") : undefined,
    optoelektronik ? gercekDal(optoelektronik, "Optoelektronikler") : undefined,
    elektromekanik
      ? gercekDal(
          elektromekanik,
          "Konnektör ve Bağlantı Elemanları",
          mevcutDallar(
            kabloKart ? gercekDal(kabloKart) : undefined,
            kartKart ? gercekDal(kartKart) : undefined,
            klemensler ? gercekDal(klemensler) : undefined,
            arayuzKonnektorleri ? gercekDal(arayuzKonnektorleri) : undefined,
          ),
          "konnektor-ve-baglanti",
        )
      : undefined,
    kablolar ? gercekDal(kablolar, "Kablolar ve Teller") : undefined,
    bataryalar ? gercekDal(bataryalar, "Bataryalar") : undefined,
    gucKaynaklari ? gercekDal(gucKaynaklari, "Enerji & Güç Kaynakları") : undefined,
    kablosuz ? gercekDal(kablosuz, "RF & Kablosuz Çözümleri") : undefined,
  );

  const gelistirmeKartlari = kategori("gelistirme-kartlari");
  const termalMekanik = kategori("termal-mekanik");

  return [
    sanalDal("elektronik-komponentler", "Elektronik Komponentler", "/urunler", elektronikAltlar),
    sanalDal(
      "led-aydinlatma",
      "LED & Aydınlatma Ürünleri",
      optoelektronik ? kategoriBaglantisi(optoelektronik.id) : "/urunler",
      mevcutDallar(
        optoelektronik
          ? gercekDal(optoelektronik, "LED ve Optoelektronik Ürünleri")
          : undefined,
      ),
    ),
    sanalDal(
      "maker-iot",
      "Maker & IoT Ürünleri",
      gelistirmeKartlari ? kategoriBaglantisi(gelistirmeKartlari.id) : "/urunler",
      mevcutDallar(
        gelistirmeKartlari ? gercekDal(gelistirmeKartlari, "Maker ve Geliştirme Kartları") : undefined,
        kablosuz ? gercekDal(kablosuz, "Kablosuz ve IoT Modülleri") : undefined,
      ),
    ),
    sanalDal(
      "uretim-ekipmanlari",
      "Üretim Ekipmanları",
      termalMekanik ? kategoriBaglantisi(termalMekanik.id) : "/urunler",
      mevcutDallar(
        termalMekanik ? gercekDal(termalMekanik, "Termal ve Mekanik Ürünler") : undefined,
        kablolar ? gercekDal(kablolar, "Kablo ve Bağlantı Ekipmanları") : undefined,
      ),
    ),
    sanalDal(
      "otomasyon-urunleri",
      "Otomasyon Ürünleri",
      elektromekanik ? kategoriBaglantisi(elektromekanik.id) : "/urunler",
      mevcutDallar(
        elektromekanik ? gercekDal(elektromekanik, "Elektromekanik Ürünler") : undefined,
        sensorler ? gercekDal(sensorler, "Sensör ve Transdüserler") : undefined,
        gucKaynaklari ? gercekDal(gucKaynaklari, "Endüstriyel Güç Kaynakları") : undefined,
      ),
    ),
  ];
}
