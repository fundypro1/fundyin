<template>
  <div class="admin-login">
    <!-- Background Pattern -->
    <div class="bg-pattern">
      <div class="grid-pattern"></div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- Main Container -->
    <div class="login-container">
      <!-- Left Side - Branding -->
      <div class="branding-section">
        <div class="brand-content">
          <div class="logo-wrapper">
            <div class="logo-circle">
              <span class="logo-text">A</span>
            </div>
            <h1 class="brand-name">Admin Panel</h1>
          </div>
          
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div>
                <h3>Secure Access</h3>
                <p>Enterprise-grade security for admin operations</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M19.4 15A1.65 1.65 0 0 0 21 13.34L20.13 12A1.65 1.65 0 0 0 21 10.66L19.4 9A1.65 1.65 0 0 0 17.66 7.4L16 6.87A1.65 1.65 0 0 0 14.66 8L13.34 8.87A1.65 1.65 0 0 0 10.66 8L9.4 7A1.65 1.65 0 0 0 7.4 9L6.87 10.66A1.65 1.65 0 0 0 8 12L8.87 13.34A1.65 1.65 0 0 0 8 14.66L9.4 16A1.65 1.65 0 0 0 10.66 17.6L12 18.13A1.65 1.65 0 0 0 13.34 16L14.66 15.13A1.65 1.65 0 0 0 17.6 15.4L19.4 15Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <h3>Real-time Control</h3>
                <p>Monitor and manage transactions instantly</p>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20A2 2 0 0 1 19 22H5A2 2 0 0 1 3 20V9Z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <h3>Dashboard</h3>
                <p>Comprehensive analytics and reporting tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="form-section">
        <div class="form-container">
          <!-- Header -->
          <div class="form-header">
            <h2>Admin Login</h2>
            <p>Access your administrative dashboard</p>
          </div>

          <!-- Alerts -->
          <div v-if="successMessage" class="alert success">
            <svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
              <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" fill="none"/>
            </svg>
            {{ successMessage }}
          </div>

          <div v-if="error" class="alert error">
            <svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="white" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="white" stroke-width="2"/>
            </svg>
            {{ error }}
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Username Field -->
            <div class="input-group">
              <label for="username">Username</label>
              <div class="input-wrapper">
                <input
                  id="username"
                  type="text"
                  v-model="credentials.username"
                  :class="{ 'error': validationErrors.username }"
                  placeholder="Enter admin username"
                  autocomplete="username"
                  required
                />
                <div class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M20 21V19A4 4 0 0 0 16 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
              </div>
              <span v-if="validationErrors.username" class="error-message">
                {{ validationErrors.username }}
              </span>
            </div>

            <!-- Password Field -->
            <div class="input-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="credentials.password"
                  :class="{ 'error': validationErrors.password }"
                  placeholder="Enter admin password"
                  autocomplete="current-password"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 19.74 16.74L9.9 4.24Z" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
              <span v-if="validationErrors.password" class="error-message">
                {{ validationErrors.password }}
              </span>
            </div>

            <!-- Remember Me -->
            <div class="form-options">
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="rememberMe" />
                <span class="checkbox-custom"></span>
                <span class="checkbox-label">Remember me for 30 days</span>
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="login-button"
              :disabled="loading || !isFormValid"
              :class="{ 'loading': loading }"
            >
              <span v-if="loading" class="button-spinner"></span>
              <svg v-if="!loading" class="button-icon" width="20" height="20" viewBox="0 0 24 24">
                <path d="M15 3H6A3 3 0 0 0 3 6V18A3 3 0 0 0 6 21H15" stroke="currentColor" stroke-width="2" fill="none"/>
                <polyline points="10,17 15,12 10,7" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ loading ? 'Authenticating...' : 'Sign In' }}
            </button>
          </form>
          <small>Already have an account? <router-link to="/admin/register4321" class="link">Sign up</router-link></small>

          <!-- Footer -->
          <div class="form-footer">
            <p class="security-text">
              <svg class="security-icon" width="16" height="16" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
                <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" stroke-width="2"/>
              </svg>
              Secured with enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth.js'

export default {
  name: 'AdminLogin',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      rememberMe: false,
      showPassword: false,
      loading: false,
      error: null,
      successMessage: null,
      validationErrors: {}
    }
  },
  computed: {
    isFormValid() {
      return this.credentials.username.length > 0 &&
             this.credentials.password.length >= 6 &&
             Object.keys(this.validationErrors).length === 0
    }
  },
  methods: {
    validateForm() {
      this.validationErrors = {}

      if (!this.credentials.username.trim()) {
        this.$set(this.validationErrors, 'username', 'Username is required')
      } else if (this.credentials.username.length < 3) {
        this.$set(this.validationErrors, 'username', 'Username must be at least 3 characters')
      }

      if (!this.credentials.password) {
        this.$set(this.validationErrors, 'password', 'Password is required')
      } else if (this.credentials.password.length < 6) {
        this.$set(this.validationErrors, 'password', 'Password must be at least 6 characters')
      }

      return Object.keys(this.validationErrors).length === 0
    },

    async handleLogin() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true
      this.error = null
      this.successMessage = null

      try {
        const response = await AuthService.loginAdmin({
          username: this.credentials.username.trim(),
          password: this.credentials.password
        })

        this.successMessage = "Authentication successful! Redirecting to dashboard..."

        // Store remember me preference
        if (this.rememberMe) {
          localStorage.setItem('remember_admin', 'true')
        }

        // Redirect after short delay
        setTimeout(() => {
          const redirectPath = this.$route.query.redirect || '/panel4321'
          this.$router.push(redirectPath)
        }, 1500)

      } catch (error) {
        console.error("Admin login error:", error)
        this.error = AuthService.formatErrorMessage(error)
        
        // Clear password on error
        this.credentials.password = ''
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    // Check if admin already logged in
    if (AuthService.isAdminAuthenticated()) {
      const redirectPath = this.$route.query.redirect || '/panel4321'
      this.$router.push(redirectPath)
      return
    }

    // Load remembered username
    const rememberedAdmin = localStorage.getItem('remember_admin')
    if (rememberedAdmin) {
      this.rememberMe = true
      const savedUsername = localStorage.getItem('admin_username')
      if (savedUsername) {
        this.credentials.username = savedUsername
      }
    }

    // Auto-focus username field
    this.$nextTick(() => {
      const usernameField = document.getElementById('username')
      if (usernameField) {
        usernameField.focus()
      }
    })
  }
}
</script>

<style scoped>
.admin-login {
  position: relative;
  min-height: 100vh;
  background: #0f0f0f;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  overflow: hidden;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
}

.login-container {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 100vh;
}

/* Branding Section */
.branding-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%);
  backdrop-filter: blur(10px);
}

.brand-content {
  max-width: 500px;
}

.logo-wrapper {
  text-align: center;
  margin-bottom: 60px;
}

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 12px 48px rgba(34, 197, 94, 0.5); }
}

.logo-text {
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.brand-name {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #ffffff, #a3a3a3);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-item h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #ffffff;
}

.feature-item p {
  font-size: 14px;
  color: #a3a3a3;
  margin: 0;
  line-height: 1.5;
}

/* Form Section */
.form-section {
  flex: 0 0 480px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #ffffff;
}

.form-header p {
  font-size: 14px;
  color: #a3a3a3;
  margin: 0;
}

/* Alerts */
.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.alert.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.alert.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.alert-icon {
  flex-shrink: 0;
}

/* Form Styling */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  height: 52px;
  padding: 16px 48px 16px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #22c55e;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.input-wrapper input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-wrapper input::placeholder {
  color: #666666;
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666666;
  pointer-events: none;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666666;
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #22c55e;
}

.error-message {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-wrapper input:checked + .checkbox-custom {
  background: #22c55e;
  border-color: #22c55e;
}

.checkbox-wrapper input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label {
  font-size: 14px;
  color: #a3a3a3;
}

.login-button {
  height: 52px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.login-button.loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.button-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.button-icon {
  flex-shrink: 0;
}

.form-footer {
  margin-top: 32px;
  text-align: center;
}

.security-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: #666666;
  margin: 0;
}

.security-icon {
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }
  
  .branding-section {
    flex: none;
    min-height: 40vh;
    padding: 40px 20px;
  }
  
  .form-section {
    flex: none;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 40px 20px;
  }
  
  .feature-list {
    display: none;
  }
}

@media (max-width: 640px) {
  .branding-section {
    padding: 20px;
    min-height: 30vh;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .form-container {
    max-width: none;
  }
  
  .brand-name {
    font-size: 24px;
  }
  
  .form-header h2 {
    font-size: 24px;
  }
}
</style>