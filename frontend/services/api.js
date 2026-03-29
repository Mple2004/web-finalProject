import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
})

export default {
  // ─── MEMBER ───────────────────────────────────────
  async login(email, password) {
    const res = await http.post('/members/login', { loginName: email, password })
    return res.data
  },

  async register(name, email, password) {
    const res = await http.post('/members', { name, email, password })
    return res.data
  },

  async getMe() {
    const res = await http.get('/members/detail')
    return res.data
  },

  async logout() {
    await http.post('/members/logout')
  },

  async updateProfile(email, formData) {
    const res = await http.put(`/admin/member/${encodeURIComponent(email)}/update`, formData)
    return res.data
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

  async searchProducts(query) {
    const res = await http.get(`/products/search/${encodeURIComponent(query)}`)
    return res.data
  },

  async getThreeProducts() {
    const res = await http.get('/products/three')
    return res.data
  },

  async getFilteredProducts(params) {
    const res = await http.get('/products/filter', { params })
    return res.data
  },

  async getProductRankings() {
    const res = await http.get('/products/rankings')
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
  async checkout(cartId) {
    const res = await http.post('/transaction/checkout', { cart_id: cartId })
    return res.data
  },

  async getOrderHistory() {
    const res = await http.get('/transaction/history')
    return res.data
  },

  async getOrderDetail(cartId) {
    const res = await http.get(`/transaction/detail/${cartId}`)
    return res.data
  },

  // ─── WISHLIST ─────────────────────────────────────
  async getWishlist() {
    const res = await http.get('/wishlist')
    return res.data
  },

  async toggleWishlist(pdId, email) {
    const res = await http.post('/wishlist/toggle', { pdId, email })
    return res.data
  },

  // ─── ADMIN ────────────────────────────────────────
  async getAdminDashboard() {
    const res = await http.get('/admin/dashboard')
    return res.data
  },

  async getAllOrders() {
    const res = await http.get('/admin/orders')
    return res.data
  },

  async updateOrderStatus(cartId, status) {
    const res = await http.put(`/admin/order/${cartId}/status`, { status })
    return res.data
  },

  async getAllMembers() {
    const res = await http.get('/admin/members')
    return res.data
  },

  async deleteMember(email) {
    const res = await http.delete(`/admin/member/${encodeURIComponent(email)}`)
    return res.data
  },

  async updateMember(email, data) {
    const res = await http.put(`/admin/member/${encodeURIComponent(email)}`, data)
    return res.data
  },

  async updateMemberWithFile(email, formData) {
    const res = await http.put(`/admin/member/${encodeURIComponent(email)}/update`, formData)
    return res.data
  },

  async getMemberOrders(email) {
    const res = await http.get(`/admin/member-orders/${encodeURIComponent(email)}`)
    return res.data
  },

  async createProduct(data, imageFiles = []) {
    const form = new FormData()
    for (const [k, v] of Object.entries(data)) {
      if (v !== null && v !== undefined && v !== '') form.append(k, v)
    }
    if (imageFiles[0]) form.append('image1', imageFiles[0])
    if (imageFiles[1]) form.append('image2', imageFiles[1])
    if (imageFiles[2]) form.append('image3', imageFiles[2])
    const res = await http.post('/products', form)
    return res.data
  },

  async updateProduct(id, data, imageFiles = [], keepImages = []) {
    const form = new FormData()
    for (const [k, v] of Object.entries(data)) {
      if (v !== null && v !== undefined && v !== '') form.append(k, v)
    }
    if (imageFiles[0]) form.append('image1', imageFiles[0])
    if (imageFiles[1]) form.append('image2', imageFiles[1])
    if (imageFiles[2]) form.append('image3', imageFiles[2])
    form.append('keepImage1', keepImages[0] ?? '')
    form.append('keepImage2', keepImages[1] ?? '')
    form.append('keepImage3', keepImages[2] ?? '')
    const res = await http.put(`/products/${id}`, form)
    return res.data
  },

  async deleteProduct(id) {
    const res = await http.delete(`/products/${id}`)
    return res.data
  },
}
