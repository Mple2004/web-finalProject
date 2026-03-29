import database from "../services/database.js";
import multer from "multer";

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "img_prod"),
  filename: (req, file, cb) => {
    const id = req.body.pdID || req.params.id;
    const ext = file.originalname.split('.').pop().toLowerCase();
    const slot = file.fieldname.replace('image', ''); // '1','2','3'
    cb(null, `${id}_${slot}.${ext}`);
  },
});

export const uploadProduct = multer({ storage: productStorage }).fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
]);

export const getAllProducts = async (req, res) => {
  console.log("GET /products");
  try {
    // Simplified: No need for sub-queries since categories and brands are in the same table
    const q = `SELECT * FROM products ORDER BY "pdID" ASC`;
    const result = await database.query(q);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getProductByBrandId = async (req, res) => {
  // Changed route logic to search by brand string instead of ID
  console.log("GET /products/brands/:brandName");
  try {
    const result = await database.query({
      text: `SELECT * FROM products WHERE "pdBrand" ILIKE $1`,
      values: [`%${req.params.id}%`], // Using ILIKE for partial text matching
    });
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

export const getProductById = async (req, res) => {
  console.log("GET /products/:id");
  try {
    const result = await database.query({
      text: `SELECT * FROM products WHERE "pdID" = $1`, // Updated to pdID
      values: [req.params.id],
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const postProduct = async (req, res) => {
  console.log("POST /product");
  try {
    const bodydata = req.body;

    if (!bodydata.pdName) {
      return res.status(422).json({ message: "error pdName is required" });
    }

    const chkRow = await database.query({
      text: `SELECT * FROM products WHERE "pdID" = $1`, // Updated to pdID
      values: [bodydata.pdID], 
    });

    if (chkRow.rowCount != 0) {
      return res.status(409).json({ message: `ERROR pdID ${bodydata.pdID} already exists` });
    }

    const base = `http://localhost:${process.env.PORT || 5000}/img_prod`;
    const pdImage  = req.files?.image1?.[0] ? `${base}/${req.files.image1[0].filename}` : null;
    const pdImage2 = req.files?.image2?.[0] ? `${base}/${req.files.image2[0].filename}` : null;
    const pdImage3 = req.files?.image3?.[0] ? `${base}/${req.files.image3[0].filename}` : null;

    const q = `
      INSERT INTO products (
        "pdID", "pdName", "pdCategory", "pdSubCategory",
        "pdBrand", "pdCountry", "pdSize", "pdPrice", "stock_qty",
        "pdImage", "pdImage2", "pdImage3"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
    `;
    const values = [
      bodydata.pdID, bodydata.pdName, bodydata.pdCategory, bodydata.pdSubCategory,
      bodydata.pdBrand, bodydata.pdCountry, bodydata.pdSize, bodydata.pdPrice,
      bodydata.stock_qty ?? 0, pdImage, pdImage2, pdImage3,
    ];
    
    const result = await database.query(q, values);
    const inserted = result.rows[0];
    
    inserted.message = "ok";
    res.status(201).json(inserted);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const putProduct = async (req, res) => {
  console.log("PUT /product/:id");
  try {
    const bodydata = req.body;
    
    const base = `http://localhost:${process.env.PORT || 5000}/img_prod`;
    // New file wins; otherwise use keepImage value (empty string → null = remove)
    const img1 = req.files?.image1?.[0] ? `${base}/${req.files.image1[0].filename}` : (req.body.keepImage1 !== undefined ? (req.body.keepImage1 || null) : null);
    const img2 = req.files?.image2?.[0] ? `${base}/${req.files.image2[0].filename}` : (req.body.keepImage2 !== undefined ? (req.body.keepImage2 || null) : null);
    const img3 = req.files?.image3?.[0] ? `${base}/${req.files.image3[0].filename}` : (req.body.keepImage3 !== undefined ? (req.body.keepImage3 || null) : null);

    const result = await database.query({
      text: `
      UPDATE products
      SET "pdName" = $1, "pdCategory" = $2, "pdSubCategory" = $3,
          "pdBrand" = $4, "pdCountry" = $5, "pdSize" = $6,
          "pdPrice" = $7, "stock_qty" = $8,
          "pdImage" = $9, "pdImage2" = $10, "pdImage3" = $11
      WHERE "pdID" = $12
      RETURNING *
      `,
      values: [
        bodydata.pdName, bodydata.pdCategory, bodydata.pdSubCategory,
        bodydata.pdBrand, bodydata.pdCountry, bodydata.pdSize,
        bodydata.pdPrice, bodydata.stock_qty ?? 0,
        img1, img2, img3, req.params.id,
      ],
    });

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `ERROR id ${req.params.id} is not found` });
    }
    
    const updated = result.rows[0];
    updated.message = "ok";
    res.status(200).json(updated); // Changed 201 to 200 for PUT
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  console.log("DELETE /product/:id");
  try {
    const result = await database.query({
      text: `DELETE FROM products WHERE "pdID" = $1`, // Updated to pdID
      values: [req.params.id],
    });

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `ERROR id ${req.params.id} is not found` });
    }
    res.status(204).end();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getThreeProducts = async (req, res) => {
  console.log("GET /3products");
  try {
    const q = `SELECT * FROM products ORDER BY "pdID" ASC OFFSET 0 LIMIT 3`;
    const result = await database.query(q);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getSearchProduct = async (req, res) => {
  console.log(`GET Search text=${req.params.id}`);
  try {
    // Cast pdID to text to allow ILIKE searching, and include brand/category search
    const result = await database.query({
      text: `
        SELECT * FROM products 
        WHERE "pdID"::text ILIKE $1 
           OR "pdName" ILIKE $1 
           OR "pdBrand" ILIKE $1
      `,
      values: [`%${req.params.id}%`],
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

// ฟังก์ชันค้นหาสินค้าแบบกรองหลายเงื่อนไข (Filter)
export const getFilteredProducts = async (req, res) => {
  console.log("GET /products/filter", req.query);
  try {
    // 1. รับค่าที่ส่งมาจาก Frontend ผ่าน Query Parameters
    // ตัวอย่าง URL: ?category=Whisky&country=Scotland&minPrice=500&maxPrice=2500
    const { category, subcategory, country, minPrice, maxPrice } = req.query;

    // 2. ตั้งต้นคำสั่ง SQL (1=1 คือเทคนิคให้ต่อ AND ได้ง่ายๆ)
    let text = `SELECT * FROM products WHERE 1=1`;
    let values = [];
    let paramIndex = 1;

    // 3. เช็คว่ามีค่าไหนส่งมาบ้าง ถ้ามีก็เอาไปต่อท้ายคำสั่ง SQL
    if (category) {
      text += ` AND "pdCategory" ILIKE $${paramIndex}`;
      values.push(`%${category}%`);
      paramIndex++;
    }

    if (subcategory) {
      text += ` AND "pdSubCategory" ILIKE $${paramIndex}`;
      values.push(`%${subcategory}%`);
      paramIndex++;
    }

    if (country) {
      text += ` AND "pdCountry" ILIKE $${paramIndex}`;
      values.push(`%${country}%`);
      paramIndex++;
    }

    if (minPrice) {
      text += ` AND "pdPrice" >= $${paramIndex}`;
      values.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      text += ` AND "pdPrice" <= $${paramIndex}`;
      values.push(maxPrice);
      paramIndex++;
    }

    // จัดเรียงตาม ID ปิดท้าย
    text += ` ORDER BY "pdID" ASC`;

    // 4. สั่งรัน SQL
    const result = await database.query({ text, values });
    res.status(200).json(result.rows);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductByCategory = async (req, res) => {
  console.log(`GET /products/category/${req.params.category}`);
  try {
    const result = await database.query({
      text: `SELECT * FROM products WHERE "pdCategory" ILIKE $1`,
      values: [`${req.params.category}`], 
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySubCategory = async (req, res) => {
  console.log(`GET /products/subcategory/${req.params.subcategory}`);
  try {
    const result = await database.query({
      text: `SELECT * FROM products WHERE "pdSubCategory" ILIKE $1`,
      values: [`${req.params.subcategory}`], 
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ค้นหาสินค้าตามประเทศ / ภูมิภาค (pdCountry)
export const getProductByCountry = async (req, res) => {
  console.log(`GET /products/country/${req.params.country}`);
  try {
    const result = await database.query({
      // ใช้ ILIKE เพื่อให้ค้นหาได้ทั้งพิมพ์เล็กพิมพ์ใหญ่
      text: `SELECT * FROM products WHERE "pdCountry" ILIKE $1`,
      values: [`${req.params.country}`], 
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ค้นหาสินค้าตามช่วงราคา (Price Range)
export const getProductRankings = async (req, res) => {
  try {
    const [soldRes, wishRes] = await Promise.all([
      database.query(`
        SELECT ctd."pdId" AS "pdID", SUM(ctd.qty) AS sold
        FROM "cartDtl" ctd
        JOIN carts ct ON ctd.cart_id = ct.cart_id
        WHERE ct.status IN ('paid', 'delivered')
        GROUP BY ctd."pdId"
      `),
      database.query(`
        SELECT "productID" AS "pdID", COUNT(*) AS "wishlistCount"
        FROM wishlist
        GROUP BY "productID"
      `),
    ]);
    const rankings = {};
    for (const r of soldRes.rows) {
      rankings[r.pdID] = { sold: Number(r.sold), wishlistCount: 0 };
    }
    for (const r of wishRes.rows) {
      if (!rankings[r.pdID]) rankings[r.pdID] = { sold: 0, wishlistCount: 0 };
      rankings[r.pdID].wishlistCount = Number(r.wishlistCount);
    }
    res.status(200).json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductByPriceRange = async (req, res) => {
  // รับค่า min และ max จาก Query String (?min=xxx&max=yyy)
  // ถ้าไม่ได้ส่งค่ามา จะตั้งค่าเริ่มต้นเป็น 0 ถึง 999,999
  const minPrice = req.query.min || 0; 
  const maxPrice = req.query.max || 999999; 

  console.log(`GET /products/price?min=${minPrice}&max=${maxPrice}`);
  
  try {
    const result = await database.query({
      // ใช้คำสั่ง >= และ <= เพื่อกรองราคา และสั่งเรียงลำดับจากถูกไปแพง (ORDER BY ASC)
      text: `SELECT * FROM products WHERE "pdPrice" >= $1 AND "pdPrice" <= $2 ORDER BY "pdPrice" ASC`,
      values: [minPrice, maxPrice], 
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};