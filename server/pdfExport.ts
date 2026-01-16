import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as db from "./db";
import { jsPDF } from "jspdf";
import * as fs from "fs";
import * as path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const router = Router();

router.get("/plans/:id/pdf", async (req: Request, res: Response) => {
  try {
    const tripId = parseInt(req.params.id);
    if (isNaN(tripId)) {
      return res.status(400).json({ error: "معرف الخطة غير صالح" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
    }

    const token = authHeader.substring(7);
    let decoded: { userId: number };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch {
      return res.status(401).json({ error: "جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى" });
    }

    const user = await db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "المستخدم غير موجود" });
    }

    if (user.tier !== "professional") {
      return res.status(403).json({ 
        error: "تصدير PDF متاح فقط لمستخدمي الباقة الاحترافية",
        code: "TIER_REQUIRED"
      });
    }

    const trips = await db.getUserTrips(decoded.userId);
    const trip = trips.find((t: any) => t.id === tripId);
    
    if (!trip) {
      return res.status(404).json({ error: "الخطة غير موجودة أو ليست ملكك" });
    }

    const fontPath = path.join(__dirname, "assets", "fonts", "Amiri-Regular.ttf");
    const fontData = fs.readFileSync(fontPath).toString("base64");

    const plan = trip.plan as any;
    const cityName = plan?.destination || `رحلة #${trip.id}`;

    const doc = new jsPDF();
    const pageWidth = 210;
    const rightMargin = pageWidth - 20;
    let y = 25;

    doc.addFileToVFS("Amiri-Regular.ttf", fontData);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");

    doc.setFontSize(22);
    doc.text("خطة رحلة مرحال", rightMargin, y, { align: "right" });
    y += 12;

    doc.setFontSize(16);
    doc.text(cityName, rightMargin, y, { align: "right" });
    y += 15;

    doc.setFontSize(11);
    const daysText = trip.days === 1 ? "يوم واحد" : `${trip.days} أيام`;
    doc.text(`المدة: ${daysText}`, rightMargin, y, { align: "right" });
    y += 8;

    const dateStr = new Date(trip.createdAt).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`تاريخ الإنشاء: ${dateStr}`, rightMargin, y, { align: "right" });
    y += 15;

    if (plan?.accommodation) {
      doc.setFontSize(13);
      doc.text("الإقامة", rightMargin, y, { align: "right" });
      y += 8;
      doc.setFontSize(10);
      doc.text(plan.accommodation.name || "", rightMargin - 10, y, { align: "right" });
      y += 6;
      const classLabel = plan.accommodation.class === 'luxury' ? 'فاخر' : 
                         plan.accommodation.class === 'mid' ? 'متوسط' : 'اقتصادي';
      const priceInfo = plan.accommodation.priceRange ? ` | ${plan.accommodation.priceRange}` : '';
      doc.text(`${classLabel}${priceInfo}`, rightMargin - 10, y, { align: "right" });
      y += 15;
    } else if (plan?.noAccommodationMessage) {
      doc.setFontSize(13);
      doc.text("الإقامة", rightMargin, y, { align: "right" });
      y += 8;
      doc.setFontSize(10);
      doc.text(plan.noAccommodationMessage, rightMargin - 10, y, { align: "right" });
      y += 15;
    }

    doc.setFontSize(14);
    doc.text("برنامج الرحلة اليومي", rightMargin, y, { align: "right" });
    y += 12;

    const dayTitles = [
      "اليوم الأول", "اليوم الثاني", "اليوم الثالث", "اليوم الرابع", "اليوم الخامس",
      "اليوم السادس", "اليوم السابع", "اليوم الثامن", "اليوم التاسع", "اليوم العاشر",
    ];

    plan?.dailyPlan?.forEach((day: any, dayIdx: number) => {
      if (y > 250) {
        doc.addPage();
        doc.setFont("Amiri");
        y = 25;
      }

      doc.setFontSize(12);
      const dayTitle = day.title || dayTitles[dayIdx] || `اليوم ${dayIdx + 1}`;
      doc.text(dayTitle, rightMargin, y, { align: "right" });
      y += 9;

      doc.setFontSize(9);
      day.activities?.forEach((activity: any) => {
        if (y > 270) {
          doc.addPage();
          doc.setFont("Amiri");
          y = 25;
        }

        const timeStr = activity.time || "";
        const period = activity.period || "";
        const activityName = activity.activity || activity.name || "";

        doc.text(`${period} ${timeStr} - ${activityName}`, rightMargin - 5, y, { align: "right" });
        y += 6;

        if (activity.description) {
          const desc = activity.description.length > 70 
            ? activity.description.substring(0, 67) + "..." 
            : activity.description;
          doc.setTextColor(100);
          doc.text(desc, rightMargin - 10, y, { align: "right" });
          doc.setTextColor(0);
          y += 6;
        }
        y += 2;
      });
      y += 6;
    });

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("مرحال - رفيقك في السفر داخل السعودية", pageWidth / 2, 285, { align: "center" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="merhaal-trip-${trip.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الملف" });
  }
});

export { router as pdfExportRouter };
