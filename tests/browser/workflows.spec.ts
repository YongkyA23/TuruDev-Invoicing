import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("complete invoicing workflow, snapshots, PDF, and responsive navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.getByLabel("Email address").fill("browser@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("browser-test-password-only");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Settings" })
    .click();
  await page.getByLabel("Business / team name *").fill("TuruDev Studio");
  await page.getByLabel("Business address").fill("Jakarta, Indonesia");
  await page.getByLabel("Bank name").fill("BCA");
  await page.getByLabel("Account name", { exact: true }).fill("TuruDev Studio");
  await page.getByLabel("Account number", { exact: true }).fill("1234567890");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toContainText("Settings saved");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Services" })
    .click();
  await page
    .getByRole("button", { name: "Add service", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Service name *").fill("Website Development");
  await dialog.getByLabel("Invoice description *").fill("Website Development");
  await dialog.getByLabel("Default price *").fill("5000000");
  await dialog.getByRole("button", { name: "Save service" }).click();
  await expect(
    page.getByRole("heading", { name: "Website Development" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Invoices", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Create invoice", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Add new client" }).click();
  await dialog.getByLabel("Client name *").fill("Sarah Wijaya");
  await dialog.getByLabel("Company", { exact: true }).fill("Acme Studio");
  await dialog.getByLabel("Email", { exact: true }).fill("sarah@example.com");
  await dialog
    .getByLabel("Address", { exact: true })
    .fill("Bandung, Indonesia");
  await dialog.getByRole("button", { name: "Save client" }).click();
  await expect(page.getByLabel("Select client *")).toHaveValue("1");
  await page.getByLabel("Add saved service").selectOption("1");
  await page.getByRole("button", { name: "Add custom item" }).click();
  await page.getByLabel("Item 2 description").fill("Monthly Maintenance");
  await page.getByLabel("Item 2 quantity").fill("2");
  await page.getByLabel("Item 2 price").fill("500000");
  await page.getByLabel("Item 2 unit").fill("month");
  await page.getByLabel("Discount type").selectOption("fixed");
  await page.getByLabel("Discount", { exact: true }).fill("500000");
  await page.getByLabel("Tax (%)", { exact: true }).fill("11");
  await expect(page.locator(".summary-total")).toContainText("6,105,000");
  await page.screenshot({
    path: "test-results/editor-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Preview invoice", exact: true })
    .first()
    .click();
  await expect(dialog.locator(".grand-total")).toContainText("6,105,000");
  await dialog.getByRole("button", { name: "Continue editing" }).click();
  await page
    .getByRole("button", { name: "Save draft", exact: true })
    .first()
    .click();
  await expect(page.locator(".invoice-paper")).toBeVisible();
  await expect(page.locator(".invoice-paper")).toContainText("Sarah Wijaya");
  await page.screenshot({
    path: "test-results/invoice-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^INV-\d{4}-001\.pdf$/);
  const path = await download.path();
  expect(readFileSync(path!).subarray(0, 5).toString()).toBe("%PDF-");
  await page.getByLabel("Update status").selectOption("Paid");
  await dialog.getByRole("button", { name: "Mark Paid" }).click();
  await expect(page.locator(".detail-toolbar .badge")).toHaveText("Paid");
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Edit invoice" }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Status", exact: true }),
  ).toHaveValue("Draft");
  await expect(page.getByLabel("Client name *")).toHaveValue("Sarah Wijaya");
  await page
    .getByRole("button", { name: "Save changes", exact: true })
    .first()
    .click();
  await expect(page.locator(".invoice-paper")).toContainText("002");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Clients" })
    .click();
  await page
    .getByRole("button", { name: "Edit Sarah Wijaya", exact: true })
    .click();
  await dialog.getByLabel("Client name *").fill("Renamed Client");
  await dialog.getByRole("button", { name: "Save client" }).click();
  await expect(
    page.getByRole("button", { name: "Edit Renamed Client" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Invoices", exact: true })
    .click();
  await page.getByLabel("Search invoices").fill("001");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Sarah Wijaya");
  await page.getByLabel("Filter by status").selectOption("Paid");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: /View INV-.*001/ }).click();
  await page.getByRole("button", { name: "Archive invoice" }).click();
  await dialog.getByRole("button", { name: "Archive invoice" }).click();
  await expect(
    page.getByRole("heading", { name: "Invoices", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Active invoices" }).click();
  await expect(page.locator("tbody")).toContainText("Archived");
  await page.getByRole("button", { name: /View INV-.*001/ }).click();
  await page.getByRole("button", { name: "Restore invoice" }).click();
  await expect(page.getByRole("status")).toContainText("Invoice restored");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Overview" })
    .click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Create invoice", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Create an invoice" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/editor-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  for (const width of [641, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  expect(errors).toEqual([]);
});
test("unsaved edits require confirmation and invalid login shows a useful error", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Email address").fill("browser@example.com");
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Incorrect email or password",
  );
  await page
    .getByLabel("Password", { exact: true })
    .fill("browser-test-password-only");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await page
    .getByRole("button", { name: "Create invoice", exact: true })
    .first()
    .click();
  await page.getByLabel("Invoice notes").fill("Unsaved changes");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Overview" })
    .click();
  const confirmDialog = page.getByRole("dialog");
  await expect(confirmDialog).toContainText(
    "You have unsaved changes. Leave this page?",
  );
  await confirmDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("heading", { name: "Create an invoice" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Overview" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Leave page" })
    .click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
});
