import re
import glob

with open('catalog.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I want to extract the table data.
# Each category inside catalog.html contains:
# <span class="acc-title">CATEGORY</span> and `<table class="product-table"> ... </table>` 
# I can regex search all those.

categories = re.findall(r'<span class="acc-title">\s*(.*?)\s*</span>.*?<table.*?>(.*?)</table>', html, flags=re.DOTALL)

# HTML template tailored for A4 Printing
print_html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Indibiotek - Complete Printed Catalog</title>
  <link href="https://fonts.googleapis.com/css2?family=Cabin:wght@600;700&family=Source+Sans+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --brand-teal: #53cfcf;
      --text-main: #222;
    }
    body {
      font-family: 'Source Sans Pro', sans-serif;
      color: var(--text-main);
      background: white;
      margin: 0;
      padding: 0;
    }
    
    /* A4 Print layout specifics */
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
      page-break-after: always;
    }
    .cover-page h1 { font-family: 'Cabin', sans-serif; font-size: 48pt; margin-bottom: 20px; color: #111; }
    .cover-page h2 { font-weight: 400; font-size: 24pt; color: #555; margin-bottom: 60px; }
    .cover-company { font-weight: 700; font-size: 16pt; letter-spacing: 0.1em; text-transform: uppercase; color: var(--brand-teal); }
    
    .category-section {
      page-break-before: auto;
      page-break-after: auto;
      margin-bottom: 40mm;
    }
    .category-title {
      font-family: 'Cabin', sans-serif;
      font-size: 20pt;
      color: var(--brand-teal);
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
      margin-top: 10mm;
      margin-bottom: 5mm;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th {
      font-family: 'Cabin', sans-serif;
      text-transform: uppercase;
      font-size: 9pt;
      color: white;
      background: #111;
      padding: 6px 10px;
      text-align: left;
    }
    td {
      padding: 6px 10px;
      border-bottom: 1px solid #ddd;
    }
    td:first-child { font-family: monospace; color: #666; width: 150px; }
    
    .pdf-image-page {
      page-break-before: always;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh; /* Make sure each image fills exactly 1 print page if constrained by css */
      margin: -15mm; /* Negate the @page margin so the image goes full bleed if needed */
    }
    .pdf-image-page img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .pdf-image-page {
        margin: 0;
      }
    }
  </style>
</head>
<body>

<div class="cover-page">
  <div class="cover-company">Indibiotek Private Limited</div>
  <h1>Product Catalog</h1>
  <h2>Life Sciences, Agri & Scientific Solutions</h2>
  <p style="margin-top:auto; font-size:12pt; color:#888;">Complete Reference Document</p>
</div>
"""

# Append tables
for cat_title, table_inner in categories:
    print_html += f"""
<div class="category-section">
  <h2 class="category-title">{cat_title}</h2>
  <table>
    {table_inner}
  </table>
</div>
"""

# Append images
import os
image_files = sorted(glob.glob("images/agri_pdf/page_*.jpg"))
for img in image_files:
    # Use relative path for HTML rendering since this runs in the same base dir
    print_html += f"""
<div class="pdf-image-page">
  <img src="{img}" alt="Agri Catalog Reference Page" />
</div>
"""

print_html += """
</body>
</html>
"""

with open("catalog_printable.html", "w", encoding="utf-8") as f:
    f.write(print_html)

print("Generated catalog_printable.html successfully!")
