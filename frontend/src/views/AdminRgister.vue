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
                <span class="logo-text">Fundy</span>
              </div>
              <h1 class="brand-name">Join Us</h1>
            </div>
  
            <div class="feature-list">
              <div class="feature-item">
                <div class="feature-icon">✅</div>
                <div>
                  <h3>Secure Registration</h3>
                  <p>Your data is always safe</p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <div>
                  <h3>Instant Access</h3>
                  <p>Start using Fundy right after signup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Right Side - Signup Form -->
        <div class="form-section">
          <div class="form-container">
            <!-- Header -->
            <div class="form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>
  
            <!-- Alerts -->
            <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
            <div v-if="error" class="alert error">{{ error }}</div>
  
            <!-- Signup Form -->
            <form @submit.prevent="handleSignup" class="login-form">
              <!-- Username -->
              <div class="input-group">
                <label for="username">Username</label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    v-model="user.username"
                    :class="{ error: validationErrors.username }"
                    placeholder="Enter your username"
                    @blur="validateUsername"
                    @input="clearFieldError('username')"
                    required
                  />
                </div>
                <small v-if="validationErrors.username" class="field-error">{{ validationErrors.username }}</small>
              </div>
  
              <!-- Email -->
              <div class="input-group">
                <label for="email">Email</label>
                <div class="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    v-model="user.email"
                    :class="{ error: validationErrors.email }"
                    placeholder="Enter your email"
                    @blur="validateEmail"
                    @input="clearFieldError('email')"
                    required
                  />
                </div>
                <small v-if="validationErrors.email" class="field-error">{{ validationErrors.email }}</small>
              </div>
  
             
              <!-- Password -->
              <div class="input-group">
                <label for="password">Password</label>
                <div class="input-wrapper">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="user.password"
                    :class="{ error: validationErrors.password }"
                    placeholder="Enter a strong password"
                    @blur="validatePassword"
                    @input="clearFieldError('password')"
                    required
                  />
                  <button
                    type="button"
                    class="password-toggle"
                    @click="togglePassword"
                  >
                    {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                  </button>
                </div>
                <small v-if="validationErrors.password" class="field-error">{{ validationErrors.password }}</small>
  
                <!-- Password strength -->
                <div v-if="user.password" class="password-strength">
                  <div class="strength-bar">
                    <div
                      class="strength-fill"
                      :class="passwordStrength.class"
                      :style="{ width: passwordStrength.width }"
                    ></div>
                  </div>
                  <span class="strength-text" :class="passwordStrength.class">
                    {{ passwordStrength.text }}
                  </span>
                </div>
              </div>
  
              <!-- Terms -->
              <div class="input-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    v-model="user.agreeToTerms"
                    @change="validateTerms"
                  />
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
                <small v-if="validationErrors.agreeToTerms" class="field-error">{{ validationErrors.agreeToTerms }}</small>
              </div>
  
              <!-- Submit -->
              <button
                type="submit"
                class="login-button"
                :disabled="loading || !isFormValid"
              >
                <span v-if="loading">Creating account...</span>
                <span v-else>Create Account</span>
              </button>
            </form>
  
            <!-- Footer -->
            <div class="form-footer">
              <small>Already have an account?
                <router-link to="/admin4321" class="link">Sign In</router-link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AuthService from '@/services/auth'
  
  export default {
    name: 'AdminRegister',
    data() {
      return {
        user: {
          username: '',
          email: '',
          password: '',
          agreeToTerms: false
        },
        loading: false,
        error: null,
        successMessage: null,
        showPassword: false,
        validationErrors: {}
      }
    },
    computed: {
      isFormValid() {
        return this.user.username && 
               this.user.email && 
               this.user.password && 
               this.user.agreeToTerms &&
               Object.keys(this.validationErrors).length === 0
      },
      passwordStrength() {
        const password = this.user.password
        if (!password) return { width: '0%', class: '', text: '' }
        
        let strength = 0
        if (password.length >= 8) strength++
        if (/[a-z]/.test(password)) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++
  
        const levels = [
          { width: '20%', class: 'very-weak', text: 'Very Weak' },
          { width: '40%', class: 'weak', text: 'Weak' },
          { width: '60%', class: 'fair', text: 'Fair' },
          { width: '80%', class: 'good', text: 'Good' },
          { width: '100%', class: 'strong', text: 'Strong' }
        ]
        return levels[strength - 1] || levels[0]
      }
    },
    methods: {
      async handleSignup() {
        this.loading = true
        this.error = null
        this.successMessage = null
  
        if (!this.validateForm()) {
          this.loading = false
          return
        }
  
        try {
          await AuthService.createAdmin({
            username: this.user.username,
            email: this.user.email,
            password: this.user.password
          })
          this.successMessage = 'Account created successfully! Redirecting to login...'
          setTimeout(() => this.$router.push('/admin4321?registered=true'), 500)
        } catch (err) {
          console.error('Signup error:', err)
          this.error = err.response?.data?.detail || 'Failed to create account. Please try again.'
        } finally {
          this.loading = false
        }
      },
      validateForm() {
        this.validationErrors = {}
        this.validateUsername()
        this.validateEmail()
        this.validatePassword()
        this.validateTerms()
        return Object.keys(this.validationErrors).length === 0
      },
      validateUsername() {
        if (!this.user.username) {
          this.validationErrors.username = 'Username is required'
        } else if (this.user.username.length < 3) {
          this.validationErrors.username = 'Must be at least 3 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(this.user.username)) {
          this.validationErrors.username = 'Only letters, numbers, underscores allowed'
        } else {
          delete this.validationErrors.username
        }
      },
      validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!this.user.email) {
          this.validationErrors.email = 'Email is required'
        } else if (!emailRegex.test(this.user.email)) {
          this.validationErrors.email = 'Invalid email format'
        } else {
          delete this.validationErrors.email
        }
      },
     
      validatePassword() {
        if (!this.user.password) {
          this.validationErrors.password = 'Password is required'
        } else if (this.user.password.length < 8) {
          this.validationErrors.password = 'At least 8 characters'
        } else {
          delete this.validationErrors.password
        }
      },
      validateTerms() {
        if (!this.user.agreeToTerms) {
          this.validationErrors.agreeToTerms = 'You must agree to the terms'
        } else {
          delete this.validationErrors.agreeToTerms
        }
      },
      clearFieldError(field) {
        delete this.validationErrors[field]
      },
      togglePassword() {
        this.showPassword = !this.showPassword
      }
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
    margin-bottom: 70px;
  }
  
  .logo-circle {
    width: 100px;
    height: 100px;
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
    color:white
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