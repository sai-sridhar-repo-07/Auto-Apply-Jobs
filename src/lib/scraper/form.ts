import { chromium } from "playwright";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "radio" | "checkbox" | "file" | "url" | "unknown";
  placeholder?: string;
  options?: string[];       // for select/radio/checkbox
  required: boolean;
  selector: string;         // CSS selector for copy-paste reference
}

export interface ScrapedForm {
  url: string;
  company: string | null;
  role: string | null;
  fields: FormField[];
  screenshot: string | null; // base64
  error?: string;
}

export async function scrapeApplicationForm(url: string): Promise<ScrapedForm> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try to extract company + role from page title / headings
    const title = await page.title();
    const h1 = await page.$eval("h1", (el) => el.textContent?.trim()).catch(() => null);

    // Take screenshot for reference
    const screenshotBuf = await page.screenshot({ fullPage: false });
    const screenshot = screenshotBuf.toString("base64");

    // Extract form fields
    const fields: FormField[] = await page.evaluate(() => {
      const results: FormField[] = [];
      const seen = new Set<string>();

      function getLabel(el: Element): string {
        // Try aria-label
        const ariaLabel = el.getAttribute("aria-label");
        if (ariaLabel) return ariaLabel.trim();

        // Try associated <label>
        const id = el.getAttribute("id");
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) return label.textContent?.trim() ?? "";
        }

        // Try parent label
        const parentLabel = el.closest("label");
        if (parentLabel) return parentLabel.textContent?.trim() ?? "";

        // Try closest element with data-label or aria-labelledby
        const labelledBy = el.getAttribute("aria-labelledby");
        if (labelledBy) {
          const labelEl = document.getElementById(labelledBy);
          if (labelEl) return labelEl.textContent?.trim() ?? "";
        }

        // Try preceding sibling text
        const prev = el.previousElementSibling;
        if (prev && ["LABEL", "SPAN", "P", "DIV"].includes(prev.tagName)) {
          return prev.textContent?.trim() ?? "";
        }

        // Try placeholder
        return (el as HTMLInputElement).placeholder ?? el.getAttribute("name") ?? "Unknown field";
      }

      function getSelectorDescription(el: Element): string {
        const name = el.getAttribute("name");
        const id = el.getAttribute("id");
        if (name) return `[name="${name}"]`;
        if (id) return `#${id}`;
        return el.tagName.toLowerCase();
      }

      function mapType(el: HTMLInputElement): FormField["type"] {
        const t = (el.type ?? "text").toLowerCase();
        if (t === "email") return "email";
        if (t === "tel") return "phone";
        if (t === "url") return "url";
        if (t === "file") return "file";
        if (t === "radio") return "radio";
        if (t === "checkbox") return "checkbox";
        return "text";
      }

      // Process inputs
      document.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button])").forEach((el) => {
        const input = el as HTMLInputElement;
        const label = getLabel(input);
        const key = label + input.type;
        if (seen.has(key) || !label || label.length < 2) return;
        seen.add(key);
        results.push({
          id: `field_${results.length}`,
          label,
          type: mapType(input),
          placeholder: input.placeholder || undefined,
          required: input.required,
          selector: getSelectorDescription(input),
        });
      });

      // Process textareas
      document.querySelectorAll("textarea").forEach((el) => {
        const label = getLabel(el);
        const key = "textarea_" + label;
        if (seen.has(key) || !label || label.length < 2) return;
        seen.add(key);
        results.push({
          id: `field_${results.length}`,
          label,
          type: "textarea",
          placeholder: el.placeholder || undefined,
          required: el.required,
          selector: getSelectorDescription(el),
        });
      });

      // Process selects
      document.querySelectorAll("select").forEach((el) => {
        const label = getLabel(el);
        const key = "select_" + label;
        if (seen.has(key) || !label || label.length < 2) return;
        seen.add(key);
        const options = Array.from(el.options)
          .map((o) => o.text.trim())
          .filter((o) => o && o !== "Select..." && o !== "-- Select --");
        results.push({
          id: `field_${results.length}`,
          label,
          type: "select",
          options,
          required: el.required,
          selector: getSelectorDescription(el),
        });
      });

      return results;
    });

    // Parse company / role from title or h1
    const rawText = h1 ?? title ?? "";
    const company = extractCompany(rawText, url);
    const role = extractRole(rawText, h1);

    await browser.close();

    return { url, company, role, fields, screenshot };
  } catch (err) {
    await browser.close();
    return {
      url,
      company: null,
      role: null,
      fields: [],
      screenshot: null,
      error: String(err),
    };
  }
}

function extractCompany(text: string, url: string): string | null {
  // Try to get from URL hostname
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      const name = parts[parts.length - 2];
      if (!["greenhouse", "lever", "ashby", "workday", "linkedin", "indeed"].includes(name)) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  } catch {}
  return null;
}

function extractRole(title: string, h1: string | null): string | null {
  const src = h1 ?? title;
  if (!src) return null;
  // Remove common suffixes like " at Company" or " | Company"
  return src.replace(/\s+(at|@|\||-).+$/, "").trim() || null;
}
