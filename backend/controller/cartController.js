import database from "../services/database.js";

export async function chkCart(req, res) {
  const email = req.user.email;
  console.log(`POST CART customer ${email} is requested`);
  
  if (!email) {
    return res.json({ error: true, errormessage: "Email is required" });
  }

  // หมายเหตุ: ในตารางใหม่ไม่มีคอลัมน์ cartCf แล้ว จึงดึงตะกร้าล่าสุดของ email นั้นแทน
 // ต้องมีคำว่า AND status = 'active' เพิ่มเข้ามาครับ
  const result = await database.query({
    text: `SELECT * FROM carts WHERE email = $1 AND status = 'active' ORDER BY cart_id DESC LIMIT 1`,
    values: [email],
  });

  if (result.rowCount > 0) {
    return res.json({ cartExist: true, cartId: result.rows[0].cart_id });
  } else {
    return res.json({ cartExist: false });
  }
}

export async function postCart(req, res) {
  console.log(`POST /CART is requested`);

  try {
    // แก้บรรทัดนี้: ดึง Email จาก req.user ที่ได้จาก Token
    const email = req.user.email; 

    // เนื่องจากด่าน auth.js เช็คให้แล้วว่าต้อง Login 
    // เราจึงไม่ต้องเขียน if (!email) เช็คซ้ำตรงนี้ก็ได้ครับ

    const result = await database.query({
      text: `INSERT INTO carts (email, created_at, updated_at)
             VALUES ($1, NOW(), NOW())
             RETURNING cart_id`,
      values: [email],
    });

    const theId = result.rows[0].cart_id;
    return res.json({ cartOK: true, messageAddCart: theId });

  } catch (err) {
    return res.json({ cartOK: false, messageAddCart: err.message });
  }
}

export async function postCartDtl(req, res) {
  console.log(`POST /CARTDETAIL is requested `);
  try {
    const cart_id = req.body.cart_id || req.body.cartId;
    const pdId = req.body.pdId;
    const pdPrice = req.body.pdPrice;
    const qty = Number(req.body.qty) || 1;

    if (cart_id == null || pdId == null || pdPrice == null) {
      return res.json({
        cartDtlOK: false,
        messageAddCartDtl: "CartID, ProductID, and Price are required",
      });
    }

    // 🚨 1. ด่านตรวจสต็อก: ไปเช็คจำนวนสินค้าในตาราง products ก่อน
    const productCheck = await database.query({
      text: `SELECT stock_qty, "pdName" FROM products WHERE "pdID" = $1`,
      values: [pdId],
    });

    if (productCheck.rowCount === 0) {
      return res.json({ cartDtlOK: false, messageAddCartDtl: "ไม่พบสินค้านี้ในระบบ" });
    }

    const currentStock = productCheck.rows[0].stock_qty;
    const productName = productCheck.rows[0].pdName;

    // เช็คว่าสต็อกเป็น 0 หรือไม่
    if (currentStock <= 0) {
      return res.json({ 
        cartDtlOK: false, 
        messageAddCartDtl: `ขออภัย สินค้า ${productName} หมดสต็อกแล้ว` 
      });
    }

    // 2. เช็คว่ามีสินค้านี้ในตะกร้าอยู่แล้วหรือไม่
    const pdResult = await database.query({
      text: `SELECT * FROM "cartDtl" ctd WHERE ctd.cart_id = $1 AND ctd."pdId" = $2`,
      values: [cart_id, pdId],
    });

    // 3. จัดการเพิ่มข้อมูล (ถ้ามีสต็อกพอ)
    if (pdResult.rowCount == 0) {
      // กรณียังไม่มีในตะกร้า
      if (qty > currentStock) {
        return res.json({
          cartDtlOK: false,
          messageAddCartDtl: `ไม่สามารถเพิ่มได้ สินค้า ${productName} มีเหลือเพียง ${currentStock} ชิ้น`
        });
      }
      try {
        await database.query({
          text: `INSERT INTO "cartDtl" (cart_id, "pdId", "qty", "price")
                 VALUES ($1,$2,$3,$4)`,
          values: [cart_id, pdId, qty, pdPrice],
        });
        return res.json({ cartDtlOK: true, messageAddCart: cart_id });
      } catch (err) {
        return res.json({ cartDtlOK: false, messageAddCartDtl: "INSERT DETAIL ERROR" });
      }
    } else {
      // กรณีมีในตะกร้าอยู่แล้ว จะบวกเพิ่มตาม qty ที่ส่งมา
      const newQty = pdResult.rows[0].qty + qty;
      
      if (newQty > currentStock) {
        return res.json({ 
          cartDtlOK: false, 
          messageAddCartDtl: `ไม่สามารถเพิ่มได้ สินค้า ${productName} มีเหลือเพียง ${currentStock} ชิ้น` 
        });
      }

      try {
        await database.query({
          text: `UPDATE "cartDtl" SET "qty" = $1
                 WHERE cart_id = $2 AND "pdId" = $3`,
          values: [newQty, cart_id, pdId],
        });
        return res.json({ cartDtlOK: true, messageAddCart: cart_id });
      } catch (err) {
        return res.json({ cartDtlOK: false, messageAddCartDtl: "UPDATE DETAIL ERROR" });
      }
    }
  } catch (err) {
    return res.json({ cartDtlOK: false, messageAddCartDtl: err.message });
  }
}

export async function sumCart(req, res) {
  console.log(`GET SumCart ${req.params.id} is requested `);
  try {
    const result = await database.query({
      text: `SELECT SUM(qty) AS qty, SUM(qty*price) AS money
             FROM "cartDtl" ctd
             WHERE ctd.cart_id = $1`,
      values: [req.params.id],
    });
    return res.json({
      id: req.params.id,
      qty: result.rows[0].qty || 0,
      money: result.rows[0].money || 0,
    });
  } catch(err) {
    return res.json({ error: err.message });
  }
}

export async function getCart(req, res) {
  console.log(`GET Cart is Requested`);
  try {
    const result = await database.query({
      text: `SELECT ct.*, SUM(ctd.qty) AS sqty, SUM(ctd.price*ctd.qty) AS sprice
             FROM carts ct 
             LEFT JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
             WHERE ct.cart_id = $1
             GROUP BY ct.cart_id`,
      values: [req.params.id],
    });
    return res.json(result.rows);
  } catch (err) {
    return res.json({ error: err.message });
  }
}

export async function getCartDtl(req, res) {
  console.log(`GET CartDtl is Requested`);
  try {
    const result = await database.query({
      text: `SELECT ROW_NUMBER() OVER (ORDER BY ctd."pdId") AS row_number,
                    ctd."pdId", 
                    pd."pdName", 
                    ctd.qty, 
                    ctd.price,
                    (ctd.qty * ctd.price) AS total_price -- เพิ่มการคำนวณราคารวมตรงนี้
             FROM "cartDtl" ctd 
             LEFT JOIN "products" pd ON ctd."pdId" = pd."pdID"  
             WHERE ctd.cart_id = $1
             ORDER BY ctd."pdId"`,
      values: [req.params.id],
    });
    return res.json(result.rows);
  } catch (err) {
    return res.json({ error: err.message });
  }
}

export async function getCartByCus(req, res) {
  console.log(`POST Cart By Customer is Requested`);
  try {
    const email = req.body.email || req.body.id; // ใช้ Email ตามตารางใหม่
    const result = await database.query({
      text: `SELECT ROW_NUMBER() OVER (ORDER BY ct.cart_id DESC) AS row_number,
                    ct.*, SUM(ctd.qty) AS sqty, SUM(ctd.price*ctd.qty) AS sprice
             FROM carts ct 
             LEFT JOIN "cartDtl" ctd ON ct.cart_id = ctd.cart_id
             WHERE ct.email = $1
             GROUP BY ct.cart_id
             ORDER BY ct.cart_id DESC`,
      values: [email],
    });
    return res.json(result.rows);
  } catch (err) {
    return res.json({ error: err.message });
  }
}