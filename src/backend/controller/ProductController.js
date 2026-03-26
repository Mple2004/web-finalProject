import database from "../services/database.js";

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

    // Updated INSERT to match the columns in your image
    const q = `
      INSERT INTO products (
        "pdID", "pdName", "pdCategory", "pdSubCategory", 
        "pdBrand", "pdCountry", "pdSize", "pdPrice"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
    const values = [
      bodydata.pdID,
      bodydata.pdName,
      bodydata.pdCategory,
      bodydata.pdSubCategory,
      bodydata.pdBrand,
      bodydata.pdCountry,
      bodydata.pdSize,
      bodydata.pdPrice
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
    
    // Updated UPDATE to match the image schema
    const result = await database.query({
      text: `
      UPDATE products
      SET "pdName" = $1, 
          "pdCategory" = $2,
          "pdSubCategory" = $3,
          "pdBrand" = $4, 
          "pdCountry" = $5,
          "pdSize" = $6,
          "pdPrice" = $7
      WHERE "pdID" = $8
      RETURNING *
      `,
      values: [
        bodydata.pdName,
        bodydata.pdCategory,
        bodydata.pdSubCategory,
        bodydata.pdBrand,
        bodydata.pdCountry,
        bodydata.pdSize,
        bodydata.pdPrice,
        req.params.id,
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