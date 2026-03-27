import database from "../services/database.js";

export const toggleWishlist = async (req, res) => {
  // 1. เปลี่ยนมารับค่า email และ pdId จาก Body (JSON) โดยตรง
  const { email, pdId } = req.body;

  console.log(`POST /wishlist/toggle - Email: ${email}, pdId: ${pdId}`);

  if (!email || !pdId) {
    return res.status(400).json({ message: "Email and Product ID are required" });
  }

  try {
    const checkExist = await database.query({
      text: `SELECT * FROM wishlist WHERE email = $1 AND "pdId" = $2`,
      values: [email, pdId],
    });

    if (checkExist.rowCount > 0) {
      await database.query({
        text: `DELETE FROM wishlist WHERE email = $1 AND "pdId" = $2`,
        values: [email, pdId],
      });
      return res.status(200).json({ message: "Removed from wishlist", isLiked: false });
    } else {
      await database.query({
        text: `INSERT INTO wishlist (email, "pdId") VALUES ($1, $2)`,
        values: [email, pdId],
      });
      return res.status(200).json({ message: "Added to wishlist", isLiked: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyWishlist = async (req, res) => {
  // 2. เปลี่ยนมารับค่า email จาก URL Parameter แทน (เพราะ GET ไม่มี Body)
  const email = req.params.email; 
  console.log(`GET /wishlist for ${email}`);

  try {
    const result = await database.query({
      text: `
        SELECT p.* FROM wishlist w
        JOIN products p ON w."pdId" = p."pdID"
        WHERE w.email = $1
        ORDER BY w.wl_id DESC
      `,
      values: [email],
    });
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};