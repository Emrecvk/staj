# ---------------------------------------------------------------------------
# ÇEVİK Elektronik API
# ---------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Merkezî paket yönetimi dosyaları restore'dan ÖNCE kopyalanmalı.
# Bunlar olmadan PackageReference'lar versiyonsuz kalır ve
# "dotnet restore" NU1604 ile patlar — önceki Dockerfile bu yüzden hiç derlenmiyordu.
COPY Directory.Build.props Directory.Packages.props ./

COPY src/Cevik.Api/Cevik.Api.csproj           src/Cevik.Api/
COPY src/Cevik.Altyapi/Cevik.Altyapi.csproj   src/Cevik.Altyapi/
COPY src/Cevik.Uygulama/Cevik.Uygulama.csproj src/Cevik.Uygulama/
COPY src/Cevik.Alan/Cevik.Alan.csproj         src/Cevik.Alan/

# Ayrı restore katmanı: kaynak kod değiştiğinde paketler yeniden indirilmez.
RUN dotnet restore src/Cevik.Api/Cevik.Api.csproj

COPY src/ src/
RUN dotnet publish src/Cevik.Api/Cevik.Api.csproj -c Release -o /app/publish --no-restore

# ---------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# aspnet imajinda wget/curl yoktur; compose healthcheck'i icin curl gerekli.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

# Root olarak çalıştırmıyoruz.
RUN useradd --uid 1001 --create-home cevik
USER cevik

COPY --from=build --chown=cevik:cevik /app/publish .

ENV ASPNETCORE_URLS=http://+:8080 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
EXPOSE 8080

ENTRYPOINT ["dotnet", "Cevik.Api.dll"]
