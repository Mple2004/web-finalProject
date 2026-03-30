import database from "../services/database.js";

// ตรวจสอบสิทธิ์ Admin (ใช้ซ้ำได้)
const checkAdmin = (req, res) => {
  if (req.user.status !== 'admin' && req.user.status !== 'ADMIN') {
    return res.status(403).json({ success: false, message: "Forbidden: Admin only" });
  }
  return true;
};

// ==========================================
// 📊 หน้า 1: Dashboard Overview
// ==========================================
export const getDashboardStats = async (req, res) => {
  if (checkAdmin(req, res) !== true) return;

  try {
    // 1. สรุปยอดขายรวม (Total Revenue & Total Units) เฉพาะบิลที่จ่ายแล้ว
    const salesSummary = await database.query(`
      SELECT 
        SUM(ctd.price * ctd.qty) AS "totalRevenue",
        SUM(ctd.qty) AS "totalUnits",
        COUNT(DISTINCT ct.cart_id) AS "totalOrders"
      FROM carts ct
      JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
      WHERE ct.status = 'paid' OR ct.status = 'Delivered'
    `);

    // 2. สินค้าขายดี 5 อันดับแรก (Top 5 Best-Selling)
    const topProducts = await database.query(`
      SELECT 
        p."pdID", p."pdName", p."pdCategory", 
        SUM(ctd.qty) as "soldQty", 
        SUM(ctd.qty * ctd.price) as "totalSales"
      FROM "cartDtl" ctd
      JOIN carts c ON ctd.cart_id = c.cart_id
      JOIN products p ON ctd."pdId" = p."pdID"
      WHERE c.status = 'paid' OR c.status = 'Delivered'
      GROUP BY p."pdID", p."pdName", p."pdCategory"
      ORDER BY "soldQty" DESC
      LIMIT 5
    `);

    // 3. แจ้งเตือนสต็อกใกล้หมด (Stock Alerts - ต่ำกว่า 10 ชิ้น)
    const stockAlerts = await database.query(`
      SELECT "pdID", "pdName", stock_qty 
      FROM products 
      WHERE stock_qty <= 10 
      ORDER BY stock_qty ASC
    `);

    res.json({
      success: true,
      summary: {
        totalRevenue: salesSummary.rows[0].totalRevenue || 0,
        totalUnits: salesSummary.rows[0].totalUnits || 0,
        totalOrders: salesSummary.rows[0].totalOrders || 0,
        lowStockCount: stockAlerts.rowCount
      },
      topProducts: topProducts.rows,
      stockAlerts: stockAlerts.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 📦 หน้า 2: Order Management
// ==========================================
export const getAllOrders = async (req, res) => {
  if (checkAdmin(req, res) !== true) return;

  try {
    // ดึงออเดอร์ทั้งหมด พร้อมจำนวนชิ้นและราคารวม
    const result = await database.query(`
      SELECT 
        c.cart_id AS "orderId",
        c.email AS "customer",
        c.updated_at AS "date",
        c.status,
        COALESCE(SUM(ctd.qty), 0) AS "items",
        COALESCE(SUM(ctd.qty * ctd.price), 0) AS "total"
      FROM carts c
      LEFT JOIN "cartDtl" ctd ON c.cart_id = ctd.cart_id
      WHERE c.status != 'active' -- ไม่เอาตะกร้าที่ยังไม่เช็คเอาท์
      GROUP BY c.cart_id, c.email, c.updated_at, c.status
      ORDER BY c.cart_id DESC
    `);
    res.json({ success: true, orders: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ฟังก์ชันอัปเดตสถานะ Order (เช่น paid -> Processing -> Delivered)
export const updateOrderStatus = async (req, res) => {
  if (checkAdmin(req, res) !== true) return;
  const { cart_id, status } = req.body;

  try {
    await database.query({
      text: `UPDATE carts SET status = $1, updated_at = NOW() WHERE cart_id = $2`,
      values: [status, cart_id]
    });
    res.json({ success: true, message: `อัปเดตสถานะเป็น ${status} สำเร็จ` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ฟังก์ชันสำหรับลบออเดอร์ 5.20am
export const deleteOrder = async (req, res) => {
  if (checkAdmin(req, res) !== true) return;
  
  const orderId = req.params.id;

  try {
    // 1. ต้องลบรายละเอียดสินค้าในตะกร้า (cartDtl) ก่อน ป้องกันปัญหา Foreign Key
    await database.query({
      text: `DELETE FROM "cartDtl" WHERE cart_id = $1`,
      values: [orderId]
    });

    // 2. จากนั้นลบหัวตะกร้า (carts) ทิ้ง
    await database.query({
      text: `DELETE FROM carts WHERE cart_id = $1`,
      values: [orderId]
    });

    res.json({ success: true, message: "ลบออเดอร์สำเร็จ" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ==========================================
// 👥 หน้า 4: Member Management
// ==========================================
export const getAllMembers = async (req, res) => {
  if (checkAdmin(req, res) !== true) return;

  try {
    const result = await database.query(`
      SELECT email, name, status 
      FROM "user" 
      ORDER BY 
        CASE WHEN status = 'admin' THEN 1 ELSE 2 END, 
        email ASC
    `);
    res.json({ success: true, members: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ฟังก์ชันลบสมาชิก
export const deleteMember = async (req, res) => {
  if (checkAdmin(req, res) !== true) return;
  const emailToDelete = req.params.email;

  try {
    await database.query({
      text: `DELETE FROM "user" WHERE email = $1`,
      values: [emailToDelete]
    });
    res.json({ success: true, message: "ลบสมาชิกสำเร็จ" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ฟังก์ชันสำหรับแอดมินแก้ไขข้อมูลสมาชิก
export const updateMemberByAdmin = async (req, res) => {
  if (checkAdmin(req, res) !== true) return;
  
  const targetEmail = req.params.email;
  const { name, status } = req.body;

  try {
    await database.query({
      text: `UPDATE "user" SET name = $1, status = $2 WHERE email = $3`,
      values: [name, status, targetEmail]
    });
    res.json({ success: true, message: "อัปเดตข้อมูลสมาชิกสำเร็จ" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};