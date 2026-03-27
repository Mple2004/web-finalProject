import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:5500',
  withCredentials: true,
})

export default {
  // ─── MEMBER ───────────────────────────────────────
  async login(email, password) {
    // แก้: backend รับ loginName (req.body.loginName) ต้องส่ง loginName
    const res = await http.post('/members/login', { loginName: email, password })
    return res.data
  },

  async register(name, email, password) {
    const res = await http.post('/members', { name, email, password })
    return res.data
  },

  async getMe() {
    // แก้: เปลี่ยนจาก /members/detail ซึ่ง route ตอนนี้มีแล้ว
    const res = await http.get('/members/detail')
    return res.data
  },

  async logout() {
    await http.post('/members/logout')
  },

  // ─── PRODUCTS ─────────────────────────────────────
  async getProducts() {
    const res = await http.get('/products')
    return res.data
  },

  async getProductById(id) {
    const res = await http.get(`/products/${id}`)
    return res.data
  },

  async getProductsByCategory(category) {
    const res = await http.get(`/products/category/${category}`)
    return res.data
  },

  async getProductsBySubCategory(subcategory) {
    const res = await http.get(`/products/subcategory/${subcategory}`)
    return res.data
  },

  // ─── CART ─────────────────────────────────────────
  async chkCart() {
    const res = await http.post('/carts/chkcart', {})
    return res.data
  },

  async createCart() {
    const res = await http.post('/carts/addcart', {})
    return res.data
  },

  async addToCart(pdId, pdPrice, qty = 1) {
    const chk = await this.chkCart()
    let cartId = chk.cartExist ? chk.cartId : (await this.createCart()).messageAddCart

    const res = await http.post('/carts/addcartdtl', {
      cart_id: cartId,
      pdId,
      pdPrice,
      qty,
    })
    return { ...res.data, cartId }
  },

  async getCartDetail(cartId) {
    const res = await http.get(`/carts/getcartdtl/${cartId}`)
    return res.data
  },

  async getCartSum(cartId) {
    const res = await http.get(`/carts/sumcart/${cartId}`)
    return res.data
  },

  // ─── TRANSACTION ──────────────────────────────────
  async checkout(cartId, email) {
    const res = await http.post('/transaction/checkout', { cart_id: cartId, email })
    return res.data
  },

  async getOrderHistory(email) {
    const res = await http.post('/transaction/history', { email })
    return res.data
  },

  async getOrderDetail(cartId) {
    const res = await http.get(`/transaction/detail/${cartId}`)
    return res.data
  },
}