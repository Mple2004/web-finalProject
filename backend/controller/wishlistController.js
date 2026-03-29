import database from "../services/database.js";

export const toggleWishlist = async (req, res) => {
  const { email, pdId } = req.body

  if (!email || !pdId) {
    return res.status(400).json({ message: "Email and Product ID are required" })
  }

  try {
    const checkExist = await database.query({
      text: `SELECT * FROM wishlist WHERE email = $1 AND "productID" = $2`,
      values: [email, pdId],
    })

    if (checkExist.rowCount > 0) {
      await database.query({
        text: `DELETE FROM wishlist WHERE email = $1 AND "productID" = $2`,
        values: [email, pdId],
      })
      return res.status(200).json({ message: "Removed from wishlist", isLiked: false })
    } else {
      await database.query({
        text: `INSERT INTO wishlist (email, "productID") VALUES ($1, $2)`,
        values: [email, pdId],
      })
      return res.status(200).json({ message: "Added to wishlist", isLiked: true })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

export const getMyWishlist = async (req, res) => {
  const email = req.user.email
  console.log(`GET /wishlist for ${email}`)

  try {
    const result = await database.query({
      text: `
        SELECT p.* FROM wishlist w
        JOIN products p ON w."productID" = p."pdID"
        WHERE w.email = $1
        ORDER BY w."wishlistID" DESC
      `,
      values: [email],
    })
    res.status(200).json(result.rows)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}