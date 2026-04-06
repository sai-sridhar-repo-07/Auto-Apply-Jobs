import { chromium } from "playwright";
import { marked } from "marked";

export async function generateResumePdf(markdown: string): Promise<Buffer> {
  // Strip the "What was changed" section — it's for the candidate, not the PDF
  const cleanMarkdown = markdown
    .replace(/##\s*What was changed[\s\S]*$/i, "")
    .trim();

  const htmlBody = await marked(cleanMarkdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1a1a1a;
      background: #fff;
      padding: 36px 44px;
    }

    /* Name — first h1 */
    h1 {
      font-size: 22pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin-bottom: 4px;
    }

    /* Contact line — first <p> after h1 */
    h1 + p {
      font-size: 9.5pt;
      color: #475569;
      margin-bottom: 14px;
    }

    /* Section headers */
    h2 {
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #4f46e5;
      border-bottom: 1.5px solid #e0e7ff;
      padding-bottom: 3px;
      margin-top: 18px;
      margin-bottom: 9px;
    }

    /* Job title / company lines */
    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
      margin-top: 8px;
    }

    p {
      margin-bottom: 5px;
      color: #374151;
    }

    ul {
      margin-left: 16px;
      margin-bottom: 8px;
    }

    li {
      margin-bottom: 3px;
      color: #374151;
    }

    strong {
      font-weight: 600;
      color: #111827;
    }

    a {
      color: #4f46e5;
      text-decoration: none;
    }

    /* Tighten last element in each section */
    h2 + * { margin-top: 0; }

    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
