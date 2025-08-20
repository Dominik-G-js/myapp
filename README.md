# MyApp — Nette demo

Krátká ukázková Nette aplikace (demo e-shop) připravená pro lokální vývoj.

Jak spustit lokálně

- Ujisti se, že máš nainstalovaný PHP >=8.1 a Composer.
- Spusť Apache (XAMPP) a nastav DocumentRoot na `www` nebo použij `php -S`.
- Z kořenového adresáře:
  ```powershell
  composer install
  ```

Demo obsahuje jednoduchý modul `Eshop` s `ProductPresenter` a daty v `data/products.php`.

Licence: MIT

# Ukázková Nette aplikace — jednoduchý e-shop modul

Tento repozitář obsahuje ukázkovou strukturu **modulu e-shop** pro Nette. Cílem je ukázat jednoduché presenters, šablony a vzorová data, která můžete importovat do existující Nette aplikace vytvořené pomocí `composer create-project nette/web-project myapp`.

- **Neinstaluje celý Nette framework** — místo toho najdete hotové soubory modulu, které zkopírujete do své aplikace.

Co je v repozitáři:

- `app/Modules/Eshop/` — presenters a šablony pro jednoduchý katalog produktů
- `data/products.sql` — vzorová SQL data (SQLite / MySQL friendly)
- `.gitignore` — základní ignorování

Rychlý postup jak použít:

1. Vytvořte nový Nette projekt (pokud ho ještě nemáte):

```bash
composer create-project nette/web-project myapp
cd myapp
```

2. Zkopírujte obsah adresáře `app/Modules/Eshop/` z tohoto repozitáře do `app/Modules/Eshop/` ve vašem projektu.

3. Importujte data (příklad pro SQLite):

```bash
sqlite3 var/database.sqlite < path/to/products.sql
```

4. Přidejte routing nebo presenter linky (např. `/eshop/product/list`).

5. Spusťte lokální server:

```bash
php -S 0.0.0.0:8000 -t www
```

Jak nahrát na GitHub:

1. Vytvořte nový repozitář na GitHubu (např. `nette-eshop-demo`).
2. V lokálním adresáři spusťte:

```bash
git init
git add .
git commit -m "Initial: Eshop module demo"
git branch -M main
git remote add origin git@github.com:USERNAME/nette-eshop-demo.git
git push -u origin main
```

Pokud chcete, mohu soubory upravit a přizpůsobit přímo v tomto workspace — dejte vědět, jestli chcete kompletní Nette projekt nebo jen modul pro vložení do existujícího projektu.

---

Autor: ukázka automaticky vytvořená asistentem


