<template>
  <main class="contact-page">

    <!-- Header -->
    <div class="page-header">
      <h1>📬 Contact Us</h1>
      <nav class="breadcrumbs">
        <router-link to="/" class="crumb-link">Home</router-link>
        <span class="material-symbols-outlined crumb-sep">chevron_right</span>
        <span class="crumb-current">Contact Us</span>
      </nav>
    </div>

    <div class="container">
      <div class="contact-grid">

        <!-- Contact Info -->
        <div class="info-col">
          <h2 class="section-title">Contact</h2>

          <div class="info-cards">
            <div class="info-card">
              <span class="material-symbols-outlined info-icon">location_on</span>
              <div>
                <div class="info-label">Address</div>
                <div class="info-value">199 Thung Sukhla, Si Racha<br>Chon Buri, Thailand 20230</div>
              </div>
            </div>

            <div class="info-card">
              <span class="material-symbols-outlined info-icon">call</span>
              <div>
                <div class="info-label">Phone</div>
                <div class="info-value"> 038 354 580</div>
              </div>
            </div>

            <div class="info-card">
              <span class="material-symbols-outlined info-icon">mail</span>
              <div>
                <div class="info-label">Email</div>
                <div class="info-value">hello@spiritandvine.com</div>
              </div>
            </div>

            <div class="info-card">
              <span class="material-symbols-outlined info-icon">schedule</span>
              <div>
                <div class="info-label">Hours</div>
                <div class="info-value">Mon – Sat: 10:00 – 21:00<br>Sun: 11:00 – 19:00</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="form-col">
          <div class="form-card">
            <h2 class="section-title">Send a Message</h2>

            <div v-if="sent" class="success-box">
              <span class="material-symbols-outlined">check_circle</span>
              Thank you! We'll get back to you within 24 hours.
            </div>

            <form v-else @submit.prevent="handleSubmit">
              <div class="field-row">
                <div class="field-group">
                  <label class="field-label">Name</label>
                  <input v-model="form.name" type="text" class="field-input" placeholder="Your name" required />
                </div>
                <div class="field-group">
                  <label class="field-label">Email</label>
                  <input v-model="form.email" type="email" class="field-input" placeholder="your@email.com" required />
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Subject</label>
                <select v-model="form.subject" class="field-input" required>
                  <option value="" disabled>Select a subject</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="shipping">Shipping & Delivery</option>
                  <option value="return">Returns & Refunds</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="field-group">
                <label class="field-label">Message</label>
                <textarea
                  v-model="form.message"
                  class="field-input field-textarea"
                  placeholder="Write your message here..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                {{ loading ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'

const loading = ref(false)
const sent = ref(false)

const form = reactive({ name: '', email: '', subject: '', message: '' })

function handleSubmit() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    sent.value = true
  }, 1200)
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--bg-dark);
  padding: 40px 20px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Header */
.page-header {
  max-width: 1100px;
  margin: 0 auto 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: var(--text-white);
}

/* Grid */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 32px;
  align-items: start;
}

@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr; }
}

/* Info Col */
.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-white);
  margin-bottom: 8px;
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
}

.info-icon {
  font-size: 22px;
  color: var(--primary);
  margin-top: 2px;
  flex-shrink: 0;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.info-value {
  color: var(--text-light);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Form Col */
.form-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 500px) {
  .field-row { grid-template-columns: 1fr; }
}

.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.field-input {
  width: 100%;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-white);
  padding: 10px 14px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.field-input:focus { border-color: var(--primary); }
.field-input option { background: #221a0e; }

.field-textarea {
  resize: vertical;
  min-height: 110px;
  font-family: inherit;
}

.submit-btn {
  width: 100%;
  background: var(--primary);
  color: #110d06;
  font-weight: 700;
  border: none;
  border-radius: var(--radius);
  padding: 12px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.submit-btn:hover:not(:disabled) { opacity: 0.85; }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinner — dark variant for primary button with dark text */
.btn-spinner { border-color: rgba(0,0,0,0.3); border-top-color: #110d06; }

/* Success */
.success-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(39, 174, 96, 0.12);
  border: 1px solid rgba(39, 174, 96, 0.35);
  border-radius: var(--radius);
  color: #2ecc71;
  padding: 18px 20px;
  font-size: 0.95rem;
}

/* Entrance animations */
.page-header { animation: fadeUp 0.5s ease both; }
.info-col    { animation: fadeUp 0.5s ease 0.1s both; }
.form-col    { animation: fadeUp 0.5s ease 0.2s both; }
.info-card   { animation: fadeUp 0.4s ease both; }
.info-card:nth-child(1) { animation-delay: 0.15s; }
.info-card:nth-child(2) { animation-delay: 0.25s; }
.info-card:nth-child(3) { animation-delay: 0.35s; }
.info-card:nth-child(4) { animation-delay: 0.45s; }
</style>
