"""Build the site and copy it into the Next.js public/ folder.

usage: python site/publish.py
  1. runs domainsrc/build-domains.py (campuses, ports) and build.py (every page) into site/out/
  2. copies the pages, assets/ and img/ into public/; next.config.ts maps / and /products etc. to them
"""
import pathlib, shutil, subprocess, sys

SITE = pathlib.Path(__file__).parent
PUBLIC = SITE.parent / "public"

subprocess.run([sys.executable, str(SITE / "domainsrc" / "build-domains.py")], check=True)
subprocess.run([sys.executable, str(SITE / "build.py")], check=True)

out = SITE / "out"
for page in out.glob("*.html"):
    if page.name != "index.html":  # index.html is the artifact-only fragment of home
        shutil.copy2(page, PUBLIC / page.name)
for folder, src in (("assets", out / "assets"), ("img", SITE / "img")):
    shutil.rmtree(PUBLIC / folder, ignore_errors=True)
    shutil.copytree(src, PUBLIC / folder)
# keep public/ lean: pages load WebP, so JPEGs are dropped except the social-share image; internal notes are not published
OG = PUBLIC / "img" / "real" / "wall-corridor.jpg"
for f in (PUBLIC / "img").rglob("*"):
    if f.is_file() and ((f.suffix == ".jpg" and f != OG) or f.name.startswith("_")):
        f.unlink()
print("site copied to", PUBLIC)
