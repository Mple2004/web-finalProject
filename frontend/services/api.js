import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:5500',
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
  async updateProfile(name, newPassword) {
  try {
    const res = await http.put('/members/profile', { 
      name: name, 
      newPassword: newPassword 
    })
    return res.data
  } catch (error) {
    console.error('Error updateProfile:', error)
    throw error
  }
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
    // ✅ ลบ email ออก — backend อ่านจาก Token เอง
    const res = await http.post('/transaction/checkout', { cart_id: cartId })
    return res.data
  },

  async getOrderHistory() {
    // ✅ เปลี่ยนจาก POST → GET และไม่ต้องส่ง email
    const res = await http.get('/transaction/history')
    return res.data
  },

  async getOrderDetail(cartId) {
    // ✅ เปลี่ยน path param ให้ตรงกับ backend (:cart_id)
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
    return res.data  // { message, isLiked: true/false }
  },

  // ─── ADMIN ─────────────────────────────────────────

  async dashboard(){
    try {
    const res = await http.get('/admin/dashboard')
    return res.data // จะได้ { success, summary, topProducts, stockAlerts }
    } catch (error) {
      console.error('Error dashboard:', error)
      throw error
    }
  },

  async getAllOrders() {
    try {
      const res = await http.get('/admin/orders')
      return res.data // จะได้ { success, orders }
    } catch (error) {
      console.error('Error getAllOrders:', error)
      throw error
    }
  },

  async updateOrderStatus(cartId, status) {
    try {
      const res = await http.put('/admin/orders/status', { cart_id: cartId, status })
      return res.data // จะได้ { success, members }
    } catch (error) {
      console.error('Error updateOrderStatus:', error)
      throw error
    }
  },

  async getAllMembers() {
    try {
      const res = await http.get('/admin/members')
      return res.data
    } catch (error) {
      console.error('Error getAllMembers:', error)
      throw error
    }
  },

  async updateMemberRole(memberId, newRole) {
    try {
      const res = await http.put('/admin/members/role', { member_id: memberId, new_role: newRole })
      return res.data
    } catch (error) {
      console.error('Error updateMemberRole:', error)
      throw error
    }
  },

  // ─── ADMIN PRODUCTS ────────────────────────────────
  async adminGetProducts() {
    const res = await http.get('/products')
    return res.data
  },

  async addProduct(data) {
    const res = await http.post('/products', data)
    return res.data
  },

  async updateProduct(pdID, data) {
    const res = await http.put(`/products/${pdID}`, data)
    return res.data
  },

  async deleteProduct(pdID) {
    const res = await http.delete(`/products/${pdID}`)
    return res.data
  },

  async deleteMember(email) {
    const res = await http.delete(`/admin/members/${email}`)
    return res.data
  },
  
}