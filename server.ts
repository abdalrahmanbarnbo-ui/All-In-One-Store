import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";

// ==========================================
// 1. إعداد قاعدة البيانات (Prisma Singleton for Serverless)
// ==========================================
// هذا النمط يمنع Vercel من إنشاء اتصالات متعددة بقاعدة البيانات عند كل طلب
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET || "super-secure-secret-key-for-all-in-one-store";

const app = express();

// ==========================================
// 2. الإعدادات الأساسية (Middlewares)
// ==========================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// واجهة مصادقة الطلبات
interface AuthRequest extends Request {
  user?: any;
}

// 🛡️ التحقق من التوكن (JWT)
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// 🛡️ التحقق من صلاحيات الآدمن
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden. Super Admin access required." });
  }
  next();
};

// 🛡️ التحقق من البائع وحالة المتجر
const isApprovedVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "VENDOR") {
    return res.status(403).json({ error: "Access Denied. Vendors only." });
  }

  try {
    const vendorProfile = await prisma.vendorProfile.findFirst({
      where: { userId: req.user.userId },
    });

    if (!vendorProfile || !vendorProfile.isApproved) {
      return res.status(403).json({ error: "حسابك قيد المراجعة. لا يمكنك إدارة المتجر حتى تتم الموافقة." });
    }

    req.user.vendorProfileId = vendorProfile.id;
    next();
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ أثناء التحقق من حساب البائع." });
  }
};

// ==========================================
// 3. المسارات العامة (Public API)
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV, message: "All in One Store API is running on Vercel Serverless." });
});

app.get("/api/products", async (req, res) => {
  try {
    const { category, featured, vendorId, search } = req.query;
    let whereClause: any = {};

    if (category) whereClause.category = category as string;
    if (featured === "true") whereClause.isFeatured = true;
    if (vendorId) whereClause.vendorId = vendorId as string;

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { vendor: { select: { storeName: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب المنتجات" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { vendor: { select: { storeName: true } } },
    });
    if (!product) return res.status(404).json({ error: "المنتج غير موجود" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب تفاصيل المنتج" });
  }
});

app.get("/api/ads/active", async (req, res) => {
  try {
    const activeAds = await prisma.adRequest.findMany({
      where: {
        status: "APPROVED",
        expiresAt: { gt: new Date() },
      },
      include: { vendor: { select: { storeName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    res.json(activeAds);
  } catch (error) {
    res.status(500).json({ error: "فشل جلب الإعلانات" });
  }
});

// ==========================================
// 4. مسارات المصادقة (Auth API)
// ==========================================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role, storeName, activationCode } = req.body;

    if (!name || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({ error: "يرجى تعبئة جميع الحقول المطلوبة." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً." });

    const hashedPassword = await bcrypt.hash(password, 12);

    if (role === "VENDOR") {
      if (!storeName || !activationCode) {
        return res.status(400).json({ error: "اسم المتجر وكود التفعيل مطلوبان لحسابات البائعين." });
      }

      const result = await prisma.$transaction(async (tx) => {
        const codeRecord = await tx.activationCode.findUnique({ where: { code: activationCode } });
        if (!codeRecord || codeRecord.isUsed) throw new Error("كود التفعيل غير صالح أو تم استخدامه مسبقاً.");

        const user = await tx.user.create({
          data: { name, email, password: hashedPassword, phoneNumber, role },
        });

        const vendorProfile = await tx.vendorProfile.create({
          data: { storeName, userId: user.id },
        });

        await tx.activationCode.update({
          where: { id: codeRecord.id },
          data: { isUsed: true, usedByVendorId: vendorProfile.id },
        });

        return { user, vendorProfile };
      });

      return res.status(201).json({ message: "تم إنشاء حساب البائع بنجاح.", user: result.user });
    } else {
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, phoneNumber, role: "CUSTOMER" },
      });
      return res.status(201).json({ message: "تم إنشاء حساب المشتري بنجاح.", user: { id: user.id, name: user.name, email: user.email } });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message || "فشلت عملية التسجيل." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { vendorProfile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        vendorStatus: user.vendorProfile ? user.vendorProfile.isApproved : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "حدث خطأ داخلي في الخادم." });
  }
});

// ==========================================
// 5. مسارات الزبائن والطلبات (Customer API)
// ==========================================

app.post("/api/orders", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { items, total, paymentMethod, city, address, phone, receiptRef } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) return res.status(400).json({ error: "السلة فارغة!" });

    const formattedItems = await Promise.all(
      items.map(async (item: any) => {
        const realProductId = String(item.id).substring(0, 36);
        const dbProduct = await prisma.product.findUnique({ where: { id: realProductId } });
        return {
          title: item.title,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          vendorId: dbProduct ? dbProduct.vendorId : null,
        };
      })
    );

    const newOrder = await prisma.order.create({
      data: {
        total: parseFloat(total),
        paymentMethod,
        city,
        address,
        phone,
        userId,
        items: { create: formattedItems },
        payment: { create: { method: paymentMethod, status: "PENDING", receiptRef: receiptRef || null } },
      },
    });

    res.status(201).json({ message: "تم إنشاء الطلب بنجاح", order: newOrder });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب." });
  }
});

app.get("/api/orders/my-orders", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: { items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب الطلبات." });
  }
});

// ==========================================
// 6. مسارات البائعين (Vendor API)
// ==========================================

app.get("/api/vendor/settings", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: req.user.vendorProfileId } });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب الإعدادات" });
  }
});

app.put("/api/vendor/settings", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const { isManuallyClosed, openTime, closeTime, daysOff } = req.body;
    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: req.user.vendorProfileId },
      data: { isManuallyClosed: isManuallyClosed !== undefined ? isManuallyClosed : undefined, openTime, closeTime, daysOff },
    });
    res.json(updatedVendor);
  } catch (error) {
    res.status(500).json({ error: "فشل في تحديث الإعدادات" });
  }
});

app.get("/api/vendor/products", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { vendorId: req.user.vendorProfileId },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب المنتجات." });
  }
});

app.post("/api/vendor/products", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, discountedPrice, category, images, sizes } = req.body;
    const totalStock = sizes && sizes.length > 0 ? sizes.reduce((t: number, i: any) => t + parseInt(i.stock), 0) : 0;

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
        stock: totalStock,
        category: category || "عام",
        images: images || [],
        sizes: sizes || [],
        vendorId: req.user.vendorProfileId,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "فشل في إضافة المنتج." });
  }
});

app.put("/api/vendor/products/:id", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const { discountedPrice } = req.body;
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id, vendorId: req.user.vendorProfileId },
      data: { discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null },
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: "فشل في تحديث المنتج" });
  }
});

app.delete("/api/vendor/products/:id", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id, vendorId: req.user.vendorProfileId } });
    res.json({ message: "تم حذف المنتج بنجاح." });
  } catch (error) {
    res.status(500).json({ error: "فشل في حذف المنتج." });
  }
});

app.get("/api/vendor/ads", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const ads = await prisma.adRequest.findMany({
      where: { vendorId: req.user.vendorProfileId },
      orderBy: { createdAt: "desc" },
    });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب الإعلانات." });
  }
});

app.post("/api/vendor/ads", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const { title, imageUrl, duration } = req.body;
    const newAd = await prisma.adRequest.create({
      data: {
        title,
        imageUrl,
        duration: parseInt(duration) || 7,
        vendorId: req.user.vendorProfileId,
        status: "PENDING",
      },
    });
    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ error: "فشل إرسال الطلب." });
  }
});

app.delete("/api/vendor/ads/:id", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.adRequest.delete({ where: { id: req.params.id, vendorId: req.user.vendorProfileId } });
    res.json({ message: "تم حذف الإعلان" });
  } catch (error) {
    res.status(500).json({ error: "فشل حذف الإعلان" });
  }
});

app.get("/api/vendor/orders", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user.vendorProfileId;
    const orders = await prisma.order.findMany({
      where: { items: { some: { vendorId: vendorId } } },
      include: { user: { select: { name: true, email: true, phoneNumber: true } }, items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });

    const filteredOrders = orders.map((order) => ({
      ...order,
      items: order.items.filter((item: any) => item.vendorId === vendorId),
    }));

    res.json(filteredOrders);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب طلبات المتجر." });
  }
});
// إرسال طلب لتمييز المنتج (Best Choice)
  app.post("/api/vendor/products/:id/request-feature", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.id, vendorId: req.user.vendorProfileId } });
      if (!product) return res.status(404).json({ error: "المنتج غير موجود." });
      
      if (product.isFeatured) return res.status(400).json({ error: "المنتج مميز بالفعل." });
      if (product.featureRequest === "PENDING") return res.status(400).json({ error: "يوجد طلب قيد المراجعة لهذا المنتج." });

      const updatedProduct = await prisma.product.update({
        where: { id: req.params.id },
        data: { featureRequest: "PENDING" }
      });
      res.json({ message: "تم إرسال طلب التمييز للإدارة بنجاح.", product: updatedProduct });
    } catch (error) {
      res.status(500).json({ error: "فشل في إرسال الطلب." });
    }
  });
app.put("/api/vendor/orders/:id/status", authenticateToken, isApprovedVendor, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "فشل في تحديث الحالة." });
  }
});

// ==========================================
// 7. مسارات الآدمن (Admin API)
// ==========================================
// جلب المنتجات التي طلب أصحابها تمييزها، بالإضافة للمميزة حالياً (للآدمن)
// 1. جلب طلبات الزبون (لصفحة المشتري)
  app.get("/api/user/orders", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const orders = await prisma.order.findMany({
        where: { userId: req.user.id }, // يجلب طلبات هذا المستخدم فقط
        orderBy: { createdAt: "desc" }
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب الطلبات." });
    }
  }); 
app.get("/api/admin/feature-requests", authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { featureRequest: "PENDING" },
            { isFeatured: true }
          ]
        },
        include: { vendor: { select: { storeName: true } } },
        orderBy: { createdAt: "desc" }
      });
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "فشل في جلب طلبات التمييز." });
    }
  });

  // قبول أو رفض أو إزالة تمييز المنتج (للآدمن)
  app.put("/api/admin/products/:id/feature", authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { action } = req.body; // "APPROVE", "REJECT", "REMOVE"
      
      let updateData = {};
      if (action === "APPROVE") {
        updateData = { isFeatured: true, featureRequest: "NONE" };
      } else if (action === "REJECT") {
        updateData = { isFeatured: false, featureRequest: "REJECTED" };
      } else if (action === "REMOVE") {
        updateData = { isFeatured: false, featureRequest: "NONE" }; // إزالة منتج كان مميزاً
      } else {
        return res.status(400).json({ error: "إجراء غير صالح." });
      }

      const updatedProduct = await prisma.product.update({
        where: { id: req.params.id },
        data: updateData
      });
      
      res.json({ message: "تم تحديث حالة تمييز المنتج.", product: updatedProduct });
    } catch (error) {
      res.status(500).json({ error: "فشل في تحديث حالة التمييز." });
    }
  });

app.get("/api/admin/vendors", authenticateToken, isAdmin, async (req, res) => {
  try {
    const vendors = await prisma.vendorProfile.findMany({ include: { user: true } });
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب البائعين." });
  }
});

app.put("/api/admin/vendors/:id/approve", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const vendor = await prisma.vendorProfile.update({ where: { id: req.params.id }, data: { isApproved } });
    res.json({ message: "تم تحديث حالة البائع.", vendor });
  } catch (error) {
    res.status(500).json({ error: "فشل في تحديث حالة البائع." });
  }
});

app.get("/api/admin/activation-codes", authenticateToken, isAdmin, async (req, res) => {
  try {
    const codes = await prisma.activationCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { vendorProfile: { include: { user: true } } },
    });
    res.json(codes);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب الأكواد." });
  }
});
app.post("/api/products/:id/rate", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { rating } = req.body;
      const productId = req.params.id;
      const userId = req.user.id;

      if (rating < 1 || rating > 5) return res.status(400).json({ error: "تقييم غير صالح" });

      // حفظ أو تحديث التقييم في جدول المراجعات
      await prisma.review.upsert({
        where: { userId_productId: { userId, productId } },
        update: { rating },
        create: { rating, userId, productId }
      });

      // حساب المتوسط الحسابي الجديد لنجوم المنتج
      const allReviews = await prisma.review.findMany({ where: { productId } });
      const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

      // تحديث بيانات المنتج
      await prisma.product.update({
        where: { id: productId },
        data: { rating: avgRating, reviewsCount: allReviews.length }
      });

      res.json({ message: "شكراً لتقييمك!" });
    } catch (error) {
      res.status(500).json({ error: "فشل التقييم." });
    }
  });
app.post("/api/admin/activation-codes", authenticateToken, isAdmin, async (req, res) => {
  try {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `VEND-2026-${randomPart}`;
    const newCode = await prisma.activationCode.create({ data: { code } });
    res.status(201).json(newCode);
  } catch (error) {
    res.status(500).json({ error: "فشل في توليد كود جديد." });
  }
});

app.get("/api/admin/ads", authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const ads = await prisma.adRequest.findMany({
      include: { vendor: { select: { storeName: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب طلبات الإعلانات." });
  }
});

app.put("/api/admin/ads/:id/status", authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    let expiresAt: Date | null = null;

    if (status === "APPROVED") {
      const ad = await prisma.adRequest.findUnique({ where: { id: req.params.id } });
      if (ad && ad.duration) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + ad.duration);
      }
    }

    const updatedAd = await prisma.adRequest.update({
      where: { id: req.params.id },
      data: { status, expiresAt },
    });
    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ error: "فشل تحديث الإعلان." });
  }
});

app.delete("/api/admin/ads/:id", authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.adRequest.delete({ where: { id: req.params.id } });
    res.json({ message: "تم حذف الإعلان" });
  } catch (error) {
    res.status(500).json({ error: "فشل حذف الإعلان" });
  }
});

app.get("/api/admin/orders", authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true, phoneNumber: true } }, items: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب الطلبات." });
  }
});

app.put("/api/admin/orders/:id/status", authenticateToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "فشل في تحديث الحالة." });
  }
});

// ==========================================
// 8. تصدير التطبيق لمنصة Vercel Serverless
// ==========================================
// التعديل الأهم: قمنا بإزالة app.listen الدائم، واستبدلناه بالتصدير
export default app;

// تشغيل السيرفر محلياً فقط أثناء التطوير (لن يعمل على Vercel)
if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3000;
  
  import("vite").then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(PORT, () => console.log(`🚀 Local Server running on http://localhost:${PORT}`));
  });
}