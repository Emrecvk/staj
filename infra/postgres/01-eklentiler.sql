-- ÇEVİK Elektronik — PostgreSQL eklentileri
-- Bu betik container ilk ayaga kalktiginda otomatik calisir.

-- Urun kodu parcali arama: "STM32F1" yazinca STM32F103C8T6'yi bulmak icin.
-- LIKE '%...%' sorgusu ancak GIN + trigram index ile hizli olur.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Kategori agaci: "Elektronik Komponentler altindaki her sey" sorgusunu
-- recursive CTE yerine tek GiST index taramasina indirger (yol <@ '1.9').
CREATE EXTENSION IF NOT EXISTS ltree;

-- Turkce arama: "direnc" yazinca "direnç" bulunsun.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Buyuk/kucuk harf duyarsiz e-posta ve urun kodu alanlari icin.
CREATE EXTENSION IF NOT EXISTS citext;
