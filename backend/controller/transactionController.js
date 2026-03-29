import database from "../services/database.js";

export async function checkout(req, res) {
  console.log(`POST /transaction/checkout is requested`);
  const { cart_id } = req.body;
  const email = req.user.email;

  try {
    const cartCheck = await database.query({
      text: `SELECT * FROM carts WHERE cart_id = $1 AND email = $2 AND status = 'active'`,
      values: [cart_id, email]
    });

    if (cartCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบตะกร้าที่รอชำระเงิน" });
    }

    const itemsInCart = await database.query({
      text: `SELECT "pdId", qty FROM "cartDtl" WHERE cart_id = $1`,
      values: [cart_id]
    });

    for (let item of itemsInCart.rows) {
      await database.query({
        text: `UPDATE products SET stock_qty = stock_qty - $1 WHERE "pdID" = $2`,
        values: [item.qty, item.pdId]
      });
    }

    await database.query({
      text: `UPDATE carts SET status = 'paid', updated_at = NOW() WHERE cart_id = $1`,
      values: [cart_id]
    });

    return res.json({ success: true, message: "ชำระเงินเรียบร้อยแล้ว!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getOrderDetail(req, res) {
  const { cart_id } = req.params;
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

export async function getOrderHistory(req, res) {
  const email = req.user.email;
  try {
    const result = await database.query({
      text: `
        SELECT
          ct.cart_id AS "orderId",
          ct.updated_at AS "date",
          ct.status,
          STRING_AGG(p."pdName" || ' x' || ctd.qty, ', ') AS "items",
          SUM(ctd.price * ctd.qty) AS "total"
        FROM carts ct
        JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
        JOIN products p ON ctd."pdId" = p."pdID"
        WHERE ct.email = $1 AND ct.status IN ('paid', 'delivered')
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

export async function getAdminSalesSummary(req, res) {
  console.log(`GET /admin/sales-summary is requested`);

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
        WHERE ct.status IN ('paid', 'delivered')
      `
    });

    return res.json({ success: true, summary: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAdminDashboard(req, res) {
  if (req.user.status !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }
  try {
    const [summaryRes, topRes, lowStockRes, recentRes] = await Promise.all([
      database.query(`
        SELECT
          COUNT(DISTINCT ct.cart_id) AS "totalOrders",
          COALESCE(SUM(ctd.price * ctd.qty), 0) AS "totalRevenue",
          COALESCE(SUM(ctd.qty), 0) AS "totalItemsSold"
        FROM carts ct
        JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
        WHERE ct.status IN ('paid', 'delivered')
      `),
      database.query(`
        SELECT p."pdID", p."pdName", p."pdCategory",
          SUM(ctd.qty) AS "totalSold",
          SUM(ctd.price * ctd.qty) AS "revenue"
        FROM "cartDtl" ctd
        JOIN products p ON ctd."pdId" = p."pdID"
        JOIN carts ct ON ctd.cart_id = ct.cart_id
        WHERE ct.status IN ('paid', 'delivered')
        GROUP BY p."pdID"
        ORDER BY "totalSold" DESC
        LIMIT 5
      `),
      database.query(`
        SELECT "pdID", "pdName", "pdCategory", stock_qty
        FROM products WHERE stock_qty < 20 ORDER BY stock_qty ASC
      `),
      database.query(`
        SELECT ct.cart_id AS "orderId", ct.email,
          u.name, ct.updated_at AS "date", ct.status,
          SUM(ctd.price * ctd.qty) AS "total"
        FROM carts ct
        JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
        LEFT JOIN "user" u ON ct.email = u.email
        WHERE ct.status IN ('paid', 'delivered')
        GROUP BY ct.cart_id, u.name
        ORDER BY ct.updated_at DESC
        LIMIT 5
      `),
    ]);

    return res.json({
      success: true,
      summary: summaryRes.rows[0],
      topProducts: topRes.rows,
      lowStockProducts: lowStockRes.rows,
      recentOrders: recentRes.rows,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAllOrders(req, res) {
  if (req.user.status !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }
  try {
    const result = await database.query(`
      SELECT ct.cart_id AS "orderId", ct.email,
        u.name, ct.updated_at AS "date", ct.status,
        SUM(ctd.price * ctd.qty) AS "total",
        SUM(ctd.qty) AS "itemCount"
      FROM carts ct
      JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
      LEFT JOIN "user" u ON ct.email = u.email
      WHERE ct.status IN ('paid', 'delivered')
      GROUP BY ct.cart_id, u.name
      ORDER BY ct.updated_at DESC
    `);
    return res.json({ success: true, orders: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateOrderStatus(req, res) {
  if (req.user.status !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }
  const { cart_id } = req.params;
  const { status } = req.body;
  const allowed = ['paid', 'delivered'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
  }
  try {
    const result = await database.query({
      text: `UPDATE carts SET status = $1, updated_at = NOW() WHERE cart_id = $2 RETURNING cart_id, status`,
      values: [status, cart_id],
    });
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "ไม่พบออเดอร์นี้" });
    }
    return res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMemberOrders(req, res) {
  if (req.user.status !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }
  const { email } = req.params;
  try {
    const result = await database.query({
      text: `
        SELECT ct.cart_id AS "orderId", ct.updated_at AS "date", ct.status,
          SUM(ctd.price * ctd.qty) AS "total",
          JSON_AGG(JSON_BUILD_OBJECT(
            'pdName', p."pdName", 'qty', ctd.qty, 'price', ctd.price
          )) AS "products"
        FROM carts ct
        JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
        JOIN products p ON ctd."pdId" = p."pdID"
        WHERE ct.email = $1 AND ct.status IN ('paid', 'delivered')
        GROUP BY ct.cart_id
        ORDER BY ct.updated_at DESC
      `,
      values: [email],
    });
    return res.json({ success: true, orders: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}