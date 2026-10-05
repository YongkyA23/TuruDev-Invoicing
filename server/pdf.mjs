import PDFDocument from "pdfkit";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
const brandLogo = fileURLToPath(
  new URL("../public/turudev-logo.png", import.meta.url),
);
function drawBrandMark(doc, x, y) {
  doc.save();
  try {
    doc.roundedRect(x, y, 40, 40, 11).clip();
    doc.image(brandLogo, x - 43, y - 36.4, { width: 126, height: 126 });
  } finally {
    doc.restore();
  }
}
export function createPdf(invoice, response) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 48,
    bufferPages: true,
    info: { Title: `Invoice ${invoice.number}`, Author: invoice.business.name },
  });
  const regular = fileURLToPath(
    new URL("./fonts/DejaVuSans.ttf", import.meta.url),
  );
  const bold = fileURLToPath(
    new URL("./fonts/DejaVuSans-Bold.ttf", import.meta.url),
  );
  if (existsSync(regular)) {
    doc.registerFont("Body", regular);
    doc.registerFont("Strong", bold);
  } else {
    doc.registerFont("Body", "Helvetica");
    doc.registerFont("Strong", "Helvetica-Bold");
  }
  doc.pipe(response);
  const right = 547,
    width = 499;
  const money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
      minimumFractionDigits: invoice.currency === "IDR" ? 0 : 2,
    })
      .format(n)
      .replace("IDR", "Rp");
  const label = (s, x, y, w = width) =>
    doc
      .font("Strong")
      .fontSize(8)
      .fillColor("#64748b")
      .text(s, x, y, { width: w });
  const body = (s, x, y, w = width, size = 10) =>
    doc
      .font("Body")
      .fontSize(size)
      .fillColor("#26374e")
      .text(s || "", x, y, { width: w });
  const room = (h) => {
    if (doc.y + h > 770) {
      doc.addPage();
      doc.y = 48;
    }
  };
  let hasLogo = false;
  if (invoice.business.logo) {
    try {
      doc.image(
        Buffer.from(invoice.business.logo.split(",")[1], "base64"),
        48,
        48,
        { fit: [70, 44] },
      );
      hasLogo = true;
    } catch {
      /* Invalid image bytes never prevent invoice export. */
    }
  }
  if (
    !hasLogo &&
    invoice.business.name === "TuruDev" &&
    existsSync(brandLogo)
  ) {
    try {
      drawBrandMark(doc, 48, 48);
      hasLogo = true;
    } catch {
      /* A missing or invalid brand mark never prevents invoice export. */
    }
  }
  const top = hasLogo ? 105 : 48;
  doc
    .font("Strong")
    .fontSize(20)
    .fillColor("#2378bc")
    .text(invoice.business.name, 48, top, { width: 280 });
  body(
    [
      invoice.business.address,
      invoice.business.email,
      invoice.business.phone,
      invoice.business.website,
      invoice.business.taxId ? `Tax ID: ${invoice.business.taxId}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    48,
    doc.y + 10,
    270,
    9,
  );
  const companyBottom = doc.y;
  doc
    .font("Strong")
    .fontSize(28)
    .fillColor("#26374e")
    .text("INVOICE", 330, 48, { width: 217, align: "right" });
  body(invoice.number, 330, 88, 217);
  const metadataY = doc.y + 14;
  label("ISSUED", 330, metadataY + 2, 95);
  body(invoice.date, 430, metadataY, 117);
  label("DUE DATE", 330, metadataY + 23, 95);
  body(invoice.dueDate, 430, metadataY + 21, 117);
  label("STATUS", 330, metadataY + 44, 95);
  body(invoice.status, 430, metadataY + 42, 117);
  let y = Math.max(companyBottom + 28, metadataY + 76, 192);
  label("BILL TO", 48, y);
  y += 18;
  doc
    .font("Strong")
    .fontSize(13)
    .fillColor("#26374e")
    .text(invoice.client.name, 48, y, { width });
  y = doc.y + 5;
  body(
    [
      invoice.client.company,
      invoice.client.address,
      invoice.client.email,
      invoice.client.phone,
      invoice.client.taxId ? `Tax ID: ${invoice.client.taxId}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    48,
    y,
    width,
    9,
  );
  doc.y += 25;
  const header = () => {
    y = doc.y;
    doc.rect(48, y, width, 28).fill("#eaf3fb");
    label("DESCRIPTION", 58, y + 10, 250);
    label("QTY / UNIT", 317, y + 10, 75);
    label("PRICE", 398, y + 10, 70);
    label("AMOUNT", 474, y + 10, 68);
    doc.y = y + 38;
  };
  header();
  invoice.items.forEach((item, i) => {
    doc.font("Body").fontSize(9);
    const h = Math.max(
      33,
      doc.heightOfString(item.description, { width: 245 }) + 18,
    );
    if (doc.y + h > 755) {
      doc.addPage();
      doc.y = 48;
      header();
    }
    y = doc.y;
    body(item.description, 58, y, 245, 9);
    body(`${item.quantity} ${item.unit}`, 317, y, 74, 9);
    doc.text(money(item.price), 395, y, { width: 68, align: "right" });
    doc.text(money(invoice.totals.amounts[i]), 469, y, {
      width: 73,
      align: "right",
    });
    doc
      .moveTo(48, y + h - 8)
      .lineTo(right, y + h - 8)
      .strokeColor("#e1e8f0")
      .stroke();
    doc.y = y + h;
  });
  doc.y += 18;
  room(140);
  y = doc.y;
  for (const [name, value] of [
    ["Subtotal", invoice.totals.subtotal],
    ["Discount", -invoice.totals.discount],
    ["Tax", invoice.totals.tax],
  ]) {
    body(name, 320, y, 100, 10);
    doc.text(money(value), 415, y, { width: 132, align: "right" });
    y += 23;
  }
  doc.rect(310, y - 4, 237, 38).fill("#2378bc");
  doc
    .font("Strong")
    .fontSize(12)
    .fillColor("white")
    .text("Total", 322, y + 7, { width: 90 });
  doc.text(money(invoice.totals.total), 405, y + 7, {
    width: 130,
    align: "right",
  });
  doc.y = y + 62;
  const section = (title, text) => {
    if (!text) return;
    doc.font("Body").fontSize(9);
    room(doc.heightOfString(text, { width }) + 50);
    y = doc.y;
    label(title, 48, y);
    body(text, 48, y + 18, width, 9);
    doc.y += 22;
  };
  section(
    "PAYMENT INFORMATION",
    [
      invoice.payment.bank,
      invoice.payment.accountName,
      invoice.payment.accountNumber,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  section("NOTES", invoice.notes);
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc
      .font("Body")
      .fontSize(8)
      .fillColor("#64748b")
      .text(`${invoice.number}  |  ${i + 1} / ${pages.count}`, 48, 793, {
        width,
        align: "center",
        lineBreak: false,
      });
  }
  doc.end();
}
