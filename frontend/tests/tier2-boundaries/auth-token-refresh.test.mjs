import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tokenYenilenmeliMi } from "../../src/lib/token-suresi.ts";
import { tokenYenilemeyiCagir } from "../../src/lib/oturum-ortak.ts";

function jwtUret(payload) {
  const govde = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `baslik.${govde}.imza`;
}

describe("Oturum yenileme sınırları", () => {
  it("eksik, bozuk ve süresi dolmuş access tokenı yeniler", () => {
    const simdi = 1_700_000_000_000;

    assert.equal(tokenYenilenmeliMi(undefined, 30, simdi), true);
    assert.equal(tokenYenilenmeliMi("bozuk-token", 30, simdi), true);
    assert.equal(tokenYenilenmeliMi(jwtUret({ exp: 1_699_999_999 }), 30, simdi), true);
    assert.equal(tokenYenilenmeliMi(jwtUret({ exp: 1_700_000_120 }), 30, simdi), false);
  });

  it("yalnız gerçekten eşzamanlı refresh çağrılarını tek uçuşta birleştirir", async () => {
    const asilFetch = globalThis.fetch;
    let istekSayisi = 0;
    let ilkIstegiTamamla;

    globalThis.fetch = async () => {
      istekSayisi++;
      if (istekSayisi === 1) {
        await new Promise((resolve) => { ilkIstegiTamamla = resolve; });
      }

      return {
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: `access-${istekSayisi}`,
          refreshToken: `refresh-${istekSayisi}`,
          kullaniciAdi: "Test",
          firmaMi: false,
          firmaId: null,
        }),
      };
    };

    try {
      const ilk = tokenYenilemeyiCagir("eski-refresh");
      const ikinci = tokenYenilemeyiCagir("eski-refresh");
      assert.equal(istekSayisi, 1);

      ilkIstegiTamamla();
      const [ilkSonuc, ikinciSonuc] = await Promise.all([ilk, ikinci]);
      assert.deepEqual(ikinciSonuc, ilkSonuc);

      await tokenYenilemeyiCagir("eski-refresh");
      assert.equal(istekSayisi, 2, "tamamlanan yanıt süreç belleğinde tutulmamalı");
    } finally {
      globalThis.fetch = asilFetch;
    }
  });
});
