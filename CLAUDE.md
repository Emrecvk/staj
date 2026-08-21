# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Çevik Elektronik — B2B electronic-component e-commerce with an RFQ (quotation) module. .NET 10 API + Next.js 16 storefront, PostgreSQL and Redis.

`PLANLAMA.md` is the authoritative design document. Code comments reference its section numbers (e.g. "PLANLAMA.md 5.3"). Read the referenced section before changing rules that cite it.

## Language convention

**Domain code is written in Turkish.** Namespaces, entities, properties, methods, service interfaces, DB columns, and API routes all use Turkish identifiers (`Katalog`, `Kimlik`, `Siparis`, `Teklif`, `Urun`, `SilindiMi`, `/api/Kimlik/giris`). Match this — do not introduce English names into domain or persistence code. Framework-facing and infrastructure identifiers stay English (`Program`, `PostToolUse`, `IServiceProvider`).

Comments and commit messages are Turkish; commit *subject lines* are English conventional-commit style (`feat:`, `fix:`, `ci:`, `chore:`).

Note the encoding hazard: several files have suffered mojibake on Turkish characters (`GelismiÅŸKimlikTestleri.cs` is a committed 3-byte BOM-only artifact of this). Write files as UTF-8 and avoid PowerShell `Set-Content` round-trips on source containing Turkish text.

## Commands

```bash
dotnet build Cevik.slnx -c Release
dotnet test tests/Cevik.BirimTestleri              # 79 unit tests, no dependencies
dotnet test tests/Cevik.EntegrasyonTestleri        # 65 integration tests, REQUIRES Docker
dotnet test Cevik.slnx                             # everything
```

Single test or subset:
```bash
dotnet test tests/Cevik.EntegrasyonTestleri --filter "FullyQualifiedName~SaglikKontrolu"
```

Frontend (from `frontend/`):
```bash
npm run dev
npm run build
npm run lint
```

Full stack:
```bash
docker compose up -d --build
```
Requires a `.env` at repo root. `docker-compose.yml` uses `${VAR:?message}` so it fails loudly on missing secrets rather than starting with blanks. Services: frontend :3000, API :5000, Postgres :5432, Redis :6379, PgAdmin :5050. API health at `/saglik`, Swagger at `/swagger`.

### Integration tests need Docker

`CevikUygulamaFabrikasi` spins up a real `postgres:17-alpine` via Testcontainers. If Docker Desktop is not running, **all 65 integration tests fail at once** with `Failed to connect to Docker endpoint` — this looks like catastrophic breakage but is just a stopped daemon. Check `docker info` before diagnosing.

Postgres is real because the code depends on Postgres-only behaviour: `ltree` category paths, trigram/`ILIKE` search, `jsonb`, and `xmin` concurrency tokens. The InMemory provider runs none of it and produces false green. Do not "simplify" these tests onto InMemory. Redis, by contrast, *is* swapped for `AddDistributedMemoryCache()` in the factory.

## Architecture

Four projects, dependencies strictly inward:

```
Cevik.Api ──────► Cevik.Uygulama ──► Cevik.Alan
    └──► Cevik.Altyapi ──┘
```

- **`Cevik.Alan`** — domain. Entities and pure business rules. **Zero package references.** Nothing framework-shaped belongs here.
- **`Cevik.Uygulama`** — application. Service interfaces (`Arayuzler/`), DTOs (`Dto/`), FluentValidation validators.
- **`Cevik.Altyapi`** — infrastructure. `DbContext`, EF configurations, migrations, service implementations, background services, seeding.
- **`Cevik.Api`** — controllers plus all composition in `Program.cs`.

Controllers stay thin: validate, delegate to an `I...Servisi`, return. Business logic belongs in `Cevik.Altyapi/*/Servisler/`; rules shared across features belong in `Cevik.Alan/Kurallar/`.

### Shared rules must not be duplicated

`Cevik.Alan/Kurallar/` holds rules deliberately lifted out of services because more than one caller needs identical behaviour — `SiparisMiktarKurali` (MOQ/MPQ/multiple) is consumed by add-to-cart, order creation, and quote-to-order conversion; `FiyatKademesiSecici`, `SiparisDurumMakinesi`, and `ParaHesabi` likewise. Copying one of these into a controller or service creates three divergent behaviours. Extend the rule in place.

## Invariants

These are load-bearing and have each been violated at least once already.

### Never read `builder.Configuration` at top level in `Program.cs`

Read configuration through `IOptions<T>` or `sp.GetRequiredService<IConfiguration>()` inside a factory lambda. Top-level reads execute before `WebApplicationFactory` applies test configuration, so the value silently differs between the component that reads it early and the one that reads it late.

`Program.cs` documents this at the top, and the DbContext registration does it correctly. **The health-check registration does not** — it reads the connection strings at top level, which is why `Saglik_Ucu_Ayakta_Doner` and `SaglikKontrolu_200OkVeHealthyDoner` currently return 503 and fail. This is a known open bug, not environmental flakiness.

### Do not bump `Microsoft.OpenApi` past 2.x

Pinned to 2.7.5 in `Directory.Packages.props` with an explanatory comment. Swashbuckle 10.2.3 compiles against Microsoft.OpenApi 2.x; with transitive pinning enabled, the central pin *overrides* Swashbuckle's own request. Raising it to 3.x **still builds cleanly** and then fails at runtime — `swagger.json` returns HTTP 500 with `MissingMethodException: IOpenApiRequestBody.get_Content()`. The compiler and CI's build step will not catch this. `Microsoft.AspNetCore.OpenApi` is deliberately absent for the same reason.

### Central package management

`ManagePackageVersionsCentrally` is on. Versions live only in `Directory.Packages.props`; `.csproj` files carry bare `<PackageReference Include="..." />` with no `Version` attribute.

### Soft delete is global

Everything derives from `VarlikTabani` (`OlusturmaTarihi`/`GuncellemeTarihi`/`SilindiMi`). `CevikDbContext.OnModelCreating` applies a `HasQueryFilter` on `SilindiMi` to every entity by reflection, and join tables without their own flag get filters derived from both parents. Products are never hard-deleted — order history must stay intact. Use `IgnoreQueryFilters()` consciously and only in admin paths.

Column naming is snake_case via `EFCore.NamingConventions` (`UseSnakeCaseNamingConvention()`); do not hand-name columns.

`UrunAmbalaji.Version` and `KullaniciRefreshToken.Version` are `xmin`-backed row-version tokens. Concurrent stock or token updates raise `DbUpdateConcurrencyException`, mapped to HTTP 409.

### Auth token handling

Refresh tokens are stored as SHA-256 hashes, never plaintext, with expiry, rotation via `YerineGecenTokenHash`, and an `AileId` session chain so a detected reuse revokes the whole family. Password-reset and email-verification tokens follow the same hash-and-expire pattern. Preserve these properties when touching `KimlikServisi`.

### Error responses

A single `UseExceptionHandler` maps exceptions to Problem Details: `IsKuraliIhlaliException` → 422, `KeyNotFoundException` → 404, `UnauthorizedAccessException` → 403, `DbUpdateConcurrencyException` → 409. `Detail` carries the exception only in Development. Throw the typed exception rather than returning an ad-hoc error from a controller.

Swagger and detailed EF errors are Development-only; `UseHttpsRedirection` is applied only outside Development because it breaks Swagger locally.

## Configuration and secrets

`appsettings.json` is committed with placeholders (`__JWT_ANAHTARI__`) and production CORS origins. `appsettings.Development.json` holds real local values and is **gitignored** — copy `appsettings.Development.example.json` to create it. `Jwt:Key` must be at least 32 characters or startup fails validation.

## Frontend

Next.js App Router, Tailwind v4, no component library — `lucide-react` for icons only. `src/lib/api.ts` is the single typed API client and mirrors backend DTO shapes; it resolves `API_INTERNAL_URL` (container-to-container) before `NEXT_PUBLIC_API_URL` (browser). Its `safeFetch` swallows errors and returns a fallback so a down API degrades to empty state instead of a crash.

`src/proxy.ts` is the route guard (Next.js middleware, exported as `proxy`). It is a cookie-presence check only — the admin branch inside it is commented out and does not gate `/yonetim`. Real authorization is server-side via the `YonetimErisimi` / `IcerikErisimi` / `SatisErisimi` policies. Never treat the frontend guard as a security boundary.

Brand tokens and logos live in `docs/marka/` (navy `#0F2740`, cyan `#00B4D8`).

## State of the tree

`npm run lint` currently fails with ~32 errors (`no-explicit-any`, `no-unused-vars`, `react/no-unescaped-entities`); `npm run build` passes. CI (`.github/workflows/ci.yml`) has no frontend step, so lint regressions are not caught there. CI also has no Redis service and does not fix the health-check bug above, so the two health tests fail there too.

`fix.ps1` and `fix2.ps1` at repo root are one-off scratch scripts that were committed by accident — do not treat them as tooling.

Dependabot's npm entry points at `/src/Cevik.UI`, which does not exist; the frontend is at `/frontend`, so npm updates never run.
