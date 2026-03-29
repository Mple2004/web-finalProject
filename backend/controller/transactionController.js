import database from "../services/database.js";

// 1. ฟังก์ชันสำหรับยืนยันการชำระเงิน (Checkout)
export async function checkout(req, res) {
  console.log(`POST /transaction/checkout is requested`);
  const { cart_id, email } = req.body;

  try {
    // 1. เช็คก่อนว่าตะกร้านี้มีอยู่จริงและยังไม่จ่ายเงิน (เหมือนเดิม)
    const cartCheck = await database.query({
      text: `SELECT * FROM carts WHERE cart_id = $1 AND email = $2 AND status = 'active'`,
      values: [cart_id, email]
    });

    if (cartCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบตะกร้าที่รอชำระเงิน" });
    }

    // --- ส่วนที่เพิ่มใหม่: ดึงรายการสินค้าในตะกร้ามาเตรียมตัดสต็อก ---
    const itemsInCart = await database.query({
      text: `SELECT "pdId", qty FROM "cartDtl" WHERE cart_id = $1`,
      values: [cart_id]
    });

    // วนลูปเพื่อ UPDATE จำนวนสินค้าในตาราง products ทีละรายการ
    // ... โค้ดส่วนอื่นๆ ใน checkout ...

    // วนลูปเพื่อ UPDATE จำนวนสินค้าในสต็อก
    for (let item of itemsInCart.rows) {
      await database.query({
        text: `UPDATE products SET stock_qty = stock_qty - $1 WHERE "pdID" = $2`, 
        values: [item.qty, item.pdId]
      });
    }

// ... โค้ดส่วนอื่นๆ ...
    // -------------------------------------------------------

    // 2. เปลี่ยนสถานะตะกร้าเป็น 'paid' เพื่อปิดยอด (เหมือนเดิม)
    await database.query({
      text: `UPDATE carts SET status = 'paid', updated_at = NOW() WHERE cart_id = $1`,
      values: [cart_id]
    });

    return res.json({ 
      success: true, 
      message: "ชำระเงินและตัดสต็อกสินค้าเรียบร้อยแล้ว!" 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ฟังก์ชันดูรายละเอียดสินค้าข้างในตะกร้าที่จ่ายเงินแล้ว
export async function getOrderDetail(req, res) {
  const { cart_id } = req.params; // รับค่า cart_id จาก URL
  try {
    const result = await database.query({
      text: `SELECT ctd.*, pd."pdName", pd."pdPrice"
             FROM "cartDtl" ctd
             JOIN products pd ON ctd."pdId" = pd."pdID"
             WHERE ctd.cart_id = $1`,
      values: [cart_id]
    });
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบรายการสินค้าในตะกร้านี้" });
    }

    res.json({ success: true, items: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ในไฟล์ transactionController.js
export async function getOrderHistory(req, res) {
  // ดึง email จาก Token (เหมือนระบบ Wishlist ที่เราเพิ่งแก้ไป)
  const email = req.user.email; 

  try {
    const result = await database.query({
      text: `
        SELECT 
          ct.cart_id AS "orderId",
          ct.updated_at AS "date",
          ct.status,
          -- รวมชื่อสินค้าในตะกร้ามาเป็นข้อความเดียว (Comma-separated)
          STRING_AGG(p."pdName" || ' x' || ctd.qty, ', ') AS "items",
          -- คำนวณราคารวมของทั้งตะกร้า
          SUM(ctd.price * ctd.qty) AS "total"
        FROM carts ct
        JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
        JOIN products p ON ctd."pdId" = p."pdID"
        WHERE ct.email = $1 AND ct.status = 'paid'
        GROUP BY ct.cart_id
        ORDER BY ct.updated_at DESC
      `,
      values: [email]
    });
    
    return res.json({ success: true, history: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ในไฟล์ transactionController.js

export async function getAdminSalesSummary(req, res) {
  console.log(`GET /admin/sales-summary is requested`);
  
  // ตรวจสอบก่อนว่าเป็น Admin หรือไม่ (เช็คจาก Token)
  if (req.user.status !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }

  try {
    const result = await database.query({
      text: `
        SELECT 
          COUNT(ct.cart_id) AS "totalOrders",
          SUM(ctd.price * ctd.qty) AS "totalRevenue",
          COUNT(DISTINCT ct.email) AS "totalCustomers"
        FROM carts ct
        JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
        WHERE ct.status = 'paid'
      `
    });
    
    return res.json({ 
      success: true, 
      summary: result.rows[0] 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}