<template>
  <div class="profile-container">
    <!-- Header Section -->
    <div class="profile-header">
      <div class="header-content">
        <div class="title-section">
          <div class="breadcrumb">
            <span class="breadcrumb-item">Account</span>
            <i class="fas fa-chevron-right"></i>
            <span class="breadcrumb-item active">Profile</span>
          </div>
          <h1 class="page-title">👤 Profile Settings</h1>
          <p class="page-subtitle">Manage your account information and preferences</p>
        </div>
        <div class="profile-stats">
          <div class="stat-card">
            <div class="stat-icon">
              📅
            </div>
            <div class="stat-info">
              <span class="stat-label">Member since</span>
              <span class="stat-value">{{ formatDate(userData.created_at) }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              🛡️
            </div>
            <div class="stat-info">
              <span class="stat-label">Account Status</span>
              <span class="stat-value verified">✅ Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-body">
      <!-- Main Content -->
      <div class="profile-main">
        <!-- Profile Info Card -->
        <div class="profile-card">
          <div class="card-header">
            <div class="header-left">
              <div class="avatar-section">
                <div class="user-avatar large">
                  <div class="avatar-image">
                    <img v-if="userData.avatar_url" :src="userData.avatar_url" alt="Profile" />
                    <span v-else class="avatar-initial">{{ userData.username?.charAt(0)?.toUpperCase() }}</span>
                  </div>
                  <button class="avatar-upload-btn" @click="triggerFileUpload">
                    📷
                  </button>
                  <input 
                    ref="avatarInput" 
                    type="file" 
                    accept="image/*" 
                    style="display: none"
                    @change="handleAvatarUpload"
                  />
                </div>
                <div class="user-info">
                  <h2 class="username">@{{ userData.username || 'User' }}</h2>
                  <p class="user-id">ID: {{ userData.id }}</p>
                  <div class="user-badges">
                    <span class="badge verified">
                      <div class="status-dot"></div>
                      Verified
                    </span>
                    <span v-if="userData.role === 'admin'" class="badge admin">
                      👑 Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="header-right">
              <div class="balance-display">
                <div class="balance-label">Current Balance</div>
                <div class="balance-amount">
                  <span class="currency">GHS</span>
                  <span class="amount">{{ formatAmount(userData.balance) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs-container">
          <div class="tabs-nav">
            <button 
              v-for="tab in tabs" 
              :key="tab.key"
              class="tab-btn"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'personal'" class="tab-panel">
            <div class="form-card">
              <div class="card-header">
                <h3 class="card-title">
                  👤 Personal Information
                </h3>
                <button 
                  v-if="!editMode.personal" 
                  @click="enableEdit('personal')"
                  class="edit-btn"
                >
                  ✏️ Edit
                </button>
              </div>
              <div class="card-content">
                <form @submit.prevent="savePersonalInfo">
                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label">
                        👤 Username
                      </label>
                      <input
                        type="text"
                        v-model="formData.personal.username"
                        class="form-input"
                        :disabled="!editMode.personal"
                        placeholder="Enter username"
                      />
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        📧 Email
                      </label>
                      <input
                        type="email"
                        v-model="formData.personal.email"
                        class="form-input"
                        :disabled="!editMode.personal"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        📱 Phone Number
                      </label>
                      <input
                        type="tel"
                        v-model="formData.personal.phone_number"
                        class="form-input"
                        :disabled="!editMode.personal"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div v-if="editMode.personal" class="form-actions">
                    <button 
                      type="button" 
                      @click="cancelEdit('personal')"
                      class="btn btn-secondary"
                    >
                      ❌ Cancel
                    </button>
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="isUpdating"
                    >
                      <span v-if="isUpdating">⏳ Saving...</span>
                      <span v-else>✅ Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Security Tab -->
          <div v-if="activeTab === 'security'" class="tab-panel">
            <div class="form-card">
              <div class="card-header">
                <h3 class="card-title">
                  🔒 Security Settings
                </h3>
              </div>
              <div class="card-content">
                <!-- Change Password -->
                <div class="security-section">
                  <h4 class="section-title">🔑 Change Password</h4>
                  <form @submit.prevent="changePassword">
                    <div class="form-group">
                      <label class="form-label">
                        🔒 Current Password
                      </label>
                      <input
                        type="password"
                        v-model="formData.security.current_password"
                        class="form-input"
                        placeholder="Enter current password"
                        autocomplete="current-password"
                      />
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        🔑 New Password
                      </label>
                      <input
                        type="password"
                        v-model="formData.security.new_password"
                        class="form-input"
                        placeholder="Enter new password"
                        autocomplete="new-password"
                      />
                    </div>

                    <div class="form-group">
                      <label class="form-label">
                        🔑 Confirm New Password
                      </label>
                      <input
                        type="password"
                        v-model="formData.security.confirm_password"
                        class="form-input"
                        placeholder="Confirm new password"
                        autocomplete="new-password"
                      />
                    </div>

                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="isUpdating || !canChangePassword"
                    >
                      <span v-if="isUpdating">⏳ Updating...</span>
                      <span v-else>🔄 Update Password</span>
                    </button>
                  </form>
                </div>

                <!-- Two-Factor Authentication -->
                <div class="security-section">
                  <h4 class="section-title">🔐 Two-Factor Authentication</h4>
                  <div class="security-option">
                    <div class="option-info">
                      <div class="option-title">📱 SMS Authentication</div>
                      <div class="option-description">
                        Receive verification codes via SMS
                      </div>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="userData.sms_2fa_enabled" @change="toggle2FA('sms')">
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="security-option">
                    <div class="option-info">
                      <div class="option-title">📧 Email Authentication</div>
                      <div class="option-description">
                        Receive verification codes via email
                      </div>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="userData.email_2fa_enabled" @change="toggle2FA('email')">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preferences Tab -->
          <div v-if="activeTab === 'preferences'" class="tab-panel">
            <div class="form-card">
              <div class="card-header">
                <h3 class="card-title">
                  ⚙️ Preferences
                </h3>
              </div>
              <div class="card-content">
                <div class="preferences-section">
                  <h4 class="section-title">🔔 Notifications</h4>
                  
                  <div class="preference-item">
                    <div class="preference-info">
                      <div class="preference-title">📧 Email Notifications</div>
                      <div class="preference-description">
                        Receive updates about deposits and account activity
                      </div>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="userData.email_notifications" @change="updatePreferences">
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="preference-item">
                    <div class="preference-info">
                      <div class="preference-title">📱 SMS Notifications</div>
                      <div class="preference-description">
                        Receive SMS alerts for important transactions
                      </div>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="userData.sms_notifications" @change="updatePreferences">
                      <span class="slider"></span>
                    </label>
                  </div>

                  <div class="preference-item">
                    <div class="preference-info">
                      <div class="preference-title">📢 Marketing Communications</div>
                      <div class="preference-description">
                        Receive promotional emails and updates
                      </div>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="userData.marketing_emails" @change="updatePreferences">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="preferences-section">
                  <h4 class="section-title">🎨 Display</h4>
                  
                  <div class="preference-item">
                    <div class="preference-info">
                      <div class="preference-title">💰 Currency Display</div>
                      <div class="preference-description">
                        Choose your preferred currency format
                      </div>
                    </div>
                    <select class="form-select" v-model="userData.preferred_currency" @change="updatePreferences">
                      <option value="GHS">Ghana Cedi (GHS)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>

                  <div class="preference-item">
                    <div class="preference-info">
                      <div class="preference-title">🌍 Language</div>
                      <div class="preference-description">
                        Choose your preferred language
                      </div>
                    </div>
                    <select class="form-select" v-model="userData.language" @change="updatePreferences">
                      <option value="en">English</option>
                      <option value="tw">Twi</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Messages -->
        <transition name="fade">
          <div v-if="successMessage" class="status-alert success">
            <div class="alert-icon">🎉</div>
            <div class="alert-content">
              <h5>Success!</h5>
              <p>{{ successMessage }}</p>
            </div>
            <button @click="dismissSuccess" class="alert-close">×</button>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="errorMessage" class="status-alert error">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <h5>Error</h5>
              <p>{{ errorMessage }}</p>
            </div>
            <button @click="dismissError" class="alert-close">×</button>
          </div>
        </transition>
      </div>

      <!-- Sidebar -->
      <div class="profile-sidebar">
        <!-- Quick Actions -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">
              ⚡ Quick Actions
            </h4>
          </div>
          <div class="card-content">
            <div class="action-buttons">
              <button class="action-btn" @click="$router.push('/deposit')">
                <span class="btn-icon">💰</span>
                <span>Make Deposit</span>
              </button>
              <button class="action-btn" @click="$router.push('/deposits')">
                <span class="btn-icon">📊</span>
                <span>View History</span>
              </button>
              <button class="action-btn" @click="downloadData">
                <span class="btn-icon">📥</span>
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Account Security -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">
              🛡️ Security Score
            </h4>
          </div>
          <div class="card-content">
            <div class="security-score">
              <div class="score-circle" :class="securityScoreClass">
                <span class="score-value">{{ securityScore }}%</span>
              </div>
              <div class="score-details">
                <div class="score-item" :class="{ completed: userData.email_verified }">
                  📧 Email Verified
                </div>
                <div class="score-item" :class="{ completed: userData.phone_verified }">
                  📱 Phone Verified
                </div>
                <div class="score-item" :class="{ completed: userData.sms_2fa_enabled || userData.email_2fa_enabled }">
                  🔐 2FA Enabled
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Support -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">
              🆘 Need Help?
            </h4>
          </div>
          <div class="card-content">
            <div class="support-options">
              <button class="support-btn">
                💬 Live Chat
              </button>
              <button class="support-btn">
                📧 Email Support
              </button>
              <button class="support-btn">
                📚 Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth'

export default {
name: 'UserProfile',
data() {
  return {
    activeTab: 'personal',
    tabs: [
      { key: 'personal', label: 'Personal Info', icon: '👤' },
      { key: 'security', label: 'Security', icon: '🔒' },
      { key: 'preferences', label: 'Preferences', icon: '⚙️' }
    ],
    
    userData: {
      id: '',
      username: '',
      email: '',
      full_name: '',
      phone_number: '',
      address: '',
      balance: 0,
      avatar_url: '',
      created_at: '',
      role: 'user',
      email_verified: false,
      phone_verified: false,
      email_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
      sms_2fa_enabled: false,
      email_2fa_enabled: false,
      preferred_currency: 'GHS',
      language: 'en'
    },
    
    formData: {
      personal: {},
      security: {
        current_password: '',
        new_password: '',
        confirm_password: ''
      }
    },
    
    editMode: {
      personal: false,
      security: false
    },
    
    originalData: {},
    isUpdating: false,
    successMessage: '',
    errorMessage: ''
  }
},

computed: {
  canChangePassword() {
    const { current_password, new_password, confirm_password } = this.formData.security
    return current_password && 
           new_password && 
           confirm_password && 
           new_password === confirm_password &&
           new_password.length >= 6
  },
  
  securityScore() {
    let score = 0
    if (this.userData.email_verified) score += 25
    if (this.userData.phone_verified) score += 25
    if (this.userData.sms_2fa_enabled || this.userData.email_2fa_enabled) score += 35
    if (this.userData.full_name && this.userData.address) score += 15
    return score
  },
  
  securityScoreClass() {
    if (this.securityScore >= 80) return 'excellent'
    if (this.securityScore >= 60) return 'good'
    if (this.securityScore >= 40) return 'fair'
    return 'poor'
  }
},

methods: {
  async fetchUserData() {
    try {
      const response = await AuthService.getCurrentUser()
      this.userData = { ...this.userData, ...response }
      this.formData.personal = { ...response }
      this.originalData = { ...response }
    } catch (error) {
      console.error('Error fetching user data:', error)
      this.errorMessage = 'Failed to load profile data'
    }
  },
  
  enableEdit(section) {
    this.editMode[section] = true
    if (section === 'personal') {
      this.formData.personal = { ...this.userData }
    }
  },
  
  cancelEdit(section) {
    this.editMode[section] = false
    if (section === 'personal') {
      this.formData.personal = { ...this.originalData }
      this.userData = { ...this.originalData }
    }
  },
  
  async savePersonalInfo() {
    this.isUpdating = true
    this.errorMessage = ''
    
    try {
      const response = await AuthService.updateUser(this.userData.id, this.formData.personal)
      this.userData = { ...this.userData, ...response }
      this.originalData = { ...response }
      this.editMode.personal = false
      this.successMessage = 'Profile updated successfully!'
    } catch (error) {
      console.error('Error updating profile:', error)
      this.errorMessage = AuthService.formatErrorMessage(error)
    } finally {
      this.isUpdating = false
    }
  },
  
  async changePassword() {
    this.isUpdating = true
    this.errorMessage = ''
    
    try {
      await AuthService.apiClient.post('/user/change-password', {
        current_password: this.formData.security.current_password,
        new_password: this.formData.security.new_password
      })
      
      this.formData.security = {
        current_password: '',
        new_password: '',
        confirm_password: ''
      }
      this.successMessage = 'Password updated successfully!'
    } catch (error) {
      console.error('Error changing password:', error)
      this.errorMessage = AuthService.formatErrorMessage(error)
    } finally {
      this.isUpdating = false
    }
  },
  
  async toggle2FA(type) {
    try {
      const endpoint = type === 'sms' ? '/user/toggle-sms-2fa' : '/user/toggle-email-2fa'
      await AuthService.apiClient.post(endpoint)
      this.successMessage = `${type.toUpperCase()} 2FA ${this.userData[`${type}_2fa_enabled`] ? 'enabled' : 'disabled'} successfully!`
    } catch (error) {
      console.error('Error toggling 2FA:', error)
      this.errorMessage = AuthService.formatErrorMessage(error)
      // Revert the change
      this.userData[`${type}_2fa_enabled`] = !this.userData[`${type}_2fa_enabled`]
    }
  },
  
  async updatePreferences() {
    try {
      await AuthService.updateUser(this.userData.id, {
        email_notifications: this.userData.email_notifications,
        sms_notifications: this.userData.sms_notifications,
        marketing_emails: this.userData.marketing_emails,
        preferred_currency: this.userData.preferred_currency,
        language: this.userData.language
      })
      this.successMessage = 'Preferences updated successfully!'
    } catch (error) {
      console.error('Error updating preferences:', error)
      this.errorMessage = AuthService.formatErrorMessage(error)
    }
  },
  
  triggerFileUpload() {
    this.$refs.avatarInput.click()
  },
  
  async handleAvatarUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file'
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 5MB'
      return
    }
    
    try {
      this.isUpdating = true
      const uploadResponse = await AuthService.uploadFile(file)
      
      await AuthService.updateUser(this.userData.id, {
        avatar_url: uploadResponse.url
      })
      
      this.userData.avatar_url = uploadResponse.url
      this.successMessage = 'Profile picture updated successfully!'
    } catch (error) {
      console.error('Error uploading avatar:', error)
      this.errorMessage = AuthService.formatErrorMessage(error)
    } finally {
      this.isUpdating = false
    }
  },
  
  async downloadData() {
    try {
      const response = await AuthService.apiClient.get('/user/export-data', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `profile-data-${this.userData.username}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading data:', error)
      this.errorMessage = 'Failed to download data'
    }
  },
  
  formatAmount(amount) {
    return parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  },
  
  formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  },
  
  dismissSuccess() {
    this.successMessage = ''
  },
  
  dismissError() {
    this.errorMessage = ''
  }
},

mounted() {
  this.fetchUserData()
}
}
</script>

<style scoped>
* {
margin: 0;
padding: 0;
box-sizing: border-box;
}

.profile-container {
background: #0b0e11;
color: #ffffff;
min-height: 100vh;
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.profile-header {
background: #1e2329;
border-bottom: 1px solid #474d57;
padding: 20px 24px;
position: sticky;
top: 0;
z-index: 100;
backdrop-filter: blur(10px);
}

.header-content {
max-width: 1200px;
margin: 0 auto;
display: flex;
justify-content: space-between;
align-items: center;
}

.breadcrumb {
display: flex;
align-items: center;
gap: 8px;
margin-bottom: 8px;
font-size: 12px;
color: #848e9c;
}

.breadcrumb-item.active {
color: #f0b90b;
}

.page-title {
font-size: 28px;
font-weight: 600;
margin-bottom: 4px;
background: linear-gradient(135deg, #f0b90b, #f8d12f);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
}

.page-subtitle {
color: #848e9c;
font-size: 14px;
margin: 0;
}

.profile-stats {
display: flex;
gap: 16px;
}

.stat-card {
display: flex;
align-items: center;
gap: 12px;
background: #0b0e11;
padding: 12px 16px;
border-radius: 12px;
border: 1px solid #474d57;
}

.stat-icon {
width: 40px;
height: 40px;
background: linear-gradient(135deg, #f0b90b, #f8d12f);
border-radius: 10px;
display: flex;
align-items: center;
justify-content: center;
font-size: 20px;
}

.stat-info {
display: flex;
flex-direction: column;
}

.stat-label {
font-size: 12px;
color: #848e9c;
margin-bottom: 2px;
}

.stat-value {
font-size: 14px;
font-weight: 600;
color: #ffffff;
}

.stat-value.verified {
color: #03a66d;
}

/* Body */
.profile-body {
max-width: 1200px;
margin: 0 auto;
padding: 24px;
display: grid;
grid-template-columns: 1fr 320px;
gap: 24px;
}

/* Profile Card */
.profile-card {
background: linear-gradient(135deg, #1e2329 0%, #2b3139 100%);
border: 1px solid #f0b90b;
border-radius: 12px;
padding: 24px;
margin-bottom: 24px;
position: relative;
border: 3px solid #474d57;
}

.avatar-image img {
width: 100%;
height: 100%;
object-fit: cover;
}

.avatar-initial {
font-size: 32px;
font-weight: 700;
color: #000000;
}

.avatar-upload-btn {
position: absolute;
bottom: -5px;
right: -5px;
width: 32px;
height: 32px;
background: #f0b90b;
border: 2px solid #1e2329;
border-radius: 50%;
color: #000000;
cursor: pointer;
display: flex;
align-items: center;
justify-content: center;
font-size: 14px;
transition: all 0.2s;
}

.avatar-upload-btn:hover {
transform: scale(1.1);
background: #03a66d;
}

.user-info {
flex: 1;
}

.username {
font-size: 24px;
font-weight: 600;
margin-bottom: 4px;
color: #ffffff;
}

.user-id {
font-size: 12px;
color: #848e9c;
margin-bottom: 12px;
}

.user-badges {
display: flex;
gap: 8px;
}

.badge {
display: flex;
align-items: center;
gap: 4px;
padding: 4px 8px;
border-radius: 6px;
font-size: 12px;
font-weight: 500;
}

.badge.verified {
background: rgba(3, 166, 109, 0.1);
color: #03a66d;
}

.badge.admin {
background: rgba(240, 185, 11, 0.1);
color: #f0b90b;
}

.status-dot {
width: 6px;
height: 6px;
border-radius: 50%;
background: #03a66d;
animation: pulse 2s infinite;
}

@keyframes pulse {
0% { opacity: 1; }
50% { opacity: 0.5; }
100% { opacity: 1; }
}

.header-right {
text-align: right;
}

.balance-display {
display: flex;
flex-direction: column;
align-items: flex-end;
}

.balance-label {
font-size: 12px;
color: #848e9c;
margin-bottom: 4px;
}

.balance-amount {
display: flex;
align-items: baseline;
gap: 6px;
}

.currency {
font-size: 16px;
color: #f0b90b;
font-weight: 500;
}

.amount {
font-size: 24px;
font-weight: 700;
color: #ffffff;
letter-spacing: -0.02em;
}

/* Tabs */
.tabs-container {
margin-bottom: 24px;
}

.tabs-nav {
display: flex;
background: #0b0e11;
border: 1px solid #474d57;
border-radius: 12px;
padding: 4px;
gap: 4px;
}

.tab-btn {
flex: 1;
padding: 12px 16px;
background: transparent;
border: none;
border-radius: 8px;
color: #848e9c;
font-size: 14px;
font-weight: 500;
cursor: pointer;
transition: all 0.2s;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
}

.tab-btn:hover {
color: #ffffff;
background: #2b3139;
}

.tab-btn.active {
background: #f0b90b;
color: #000000;
box-shadow: 0 2px 8px rgba(240, 185, 11, 0.3);
}

.tab-icon {
font-size: 16px;
}

/* Tab Content */
.tab-content {
margin-bottom: 24px;
}

.tab-panel {
animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
from {
  opacity: 0;
  transform: translateY(20px);
}
to {
  opacity: 1;
  transform: translateY(0);
}
}

/* Form Card */
.form-card {
background: #1e2329;
border: 1px solid #474d57;
border-radius: 16px;
overflow: hidden;
}

.card-title {
display: flex;
align-items: center;
gap: 8px;
font-size: 18px;
font-weight: 600;
margin: 0;
color: #ffffff;
}

.edit-btn {
display: flex;
align-items: center;
gap: 6px;
background: #0b0e11;
border: 1px solid #474d57;
border-radius: 8px;
padding: 8px 12px;
color: #848e9c;
font-size: 12px;
cursor: pointer;
transition: all 0.2s;
}

.edit-btn:hover {
background: #2b3139;
color: #f0b90b;
border-color: #f0b90b;
}

.card-content {
padding: 24px;
}

/* Forms */
.form-grid {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 20px;
margin-bottom: 24px;
}

.form-group {
display: flex;
flex-direction: column;
}

.form-group.full-width {
grid-column: 1 / -1;
}

.form-label {
display: flex;
align-items: center;
gap: 8px;
font-size: 14px;
font-weight: 500;
margin-bottom: 8px;
color: #ffffff;
}

.form-input, .form-textarea, .form-select {
width: 100%;
padding: 12px 16px;
background: #0b0e11;
border: 1px solid #474d57;
border-radius: 8px;
color: #ffffff;
font-size: 14px;
outline: none;
transition: all 0.2s;
resize: none;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
border-color: #f0b90b;
box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.form-input:disabled, .form-textarea:disabled {
background: #474d57;
color: #848e9c;
cursor: not-allowed;
}

.form-input::placeholder, .form-textarea::placeholder {
color: #848e9c;
}

.form-actions {
display: flex;
gap: 12px;
justify-content: flex-end;
padding-top: 16px;
border-top: 1px solid #474d57;
}

.btn {
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
padding: 12px 20px;
border-radius: 8px;
font-size: 14px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s;
border: none;
min-width: 120px;
}

.btn-primary {
background: #f0b90b;
color: #000000;
}

.btn-primary:hover:not(:disabled) {
opacity: 0.9;
transform: translateY(-1px);
}

.btn-secondary {
background: #0b0e11;
color: #848e9c;
border: 1px solid #474d57;
}

.btn-secondary:hover {
background: #2b3139;
color: #ffffff;
}

.btn:disabled {
opacity: 0.5;
cursor: not-allowed;
transform: none;
}

/* Security Sections */
.security-section, .preferences-section {
margin-bottom: 32px;
padding-bottom: 24px;
border-bottom: 1px solid #474d57;
}

.security-section:last-child, .preferences-section:last-child {
border-bottom: none;
margin-bottom: 0;
}

.section-title {
font-size: 16px;
font-weight: 600;
margin-bottom: 16px;
color: #ffffff;
}

.security-option, .preference-item {
display: flex;
justify-content: space-between;
align-items: center;
padding: 16px 0;
border-bottom: 1px solid #474d57;
}

.security-option:last-child, .preference-item:last-child {
border-bottom: none;
}

.option-info, .preference-info {
flex: 1;
}

.option-title, .preference-title {
font-size: 14px;
font-weight: 500;
margin-bottom: 4px;
color: #ffffff;
}

.option-description, .preference-description {
font-size: 12px;
color: #848e9c;
line-height: 1.4;
}

/* Toggle Switch */
.toggle-switch {
position: relative;
display: inline-block;
width: 44px;
height: 24px;
}

.toggle-switch input {
opacity: 0;
width: 0;
height: 0;
}

.slider {
position: absolute;
cursor: pointer;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: #0b0e11;
border: 1px solid #474d57;
transition: 0.3s;
border-radius: 24px;
}

.slider::before {
position: absolute;
content: "";
height: 18px;
width: 18px;
left: 2px;
bottom: 2px;
background-color: #848e9c;
transition: 0.3s;
border-radius: 50%;
}

input:checked + .slider {
background-color: #f0b90b;
border-color: #f0b90b;
}

input:checked + .slider::before {
background-color: #000000;
transform: translateX(20px);
}

/* Status Alerts */
.status-alert {
display: flex;
align-items: flex-start;
gap: 12px;
padding: 16px;
border-radius: 12px;
margin-bottom: 16px;
position: relative;
}

.status-alert.success {
background: rgba(3, 166, 109, 0.1);
border: 1px solid rgba(3, 166, 109, 0.3);
}

.status-alert.error {
background: rgba(207, 48, 74, 0.1);
border: 1px solid rgba(207, 48, 74, 0.3);
}

.alert-icon {
font-size: 20px;
margin-top: 2px;
}

.alert-content {
flex: 1;
}

.alert-content h5 {
font-size: 14px;
font-weight: 600;
margin-bottom: 4px;
}

.status-alert.success .alert-content h5 {
color: #03a66d;
}

.status-alert.error .alert-content h5 {
color: #cf304a;
}

.alert-content p {
font-size: 12px;
color: #848e9c;
line-height: 1.5;
margin: 0;
}

.alert-close {
background: none;
border: none;
color: #848e9c;
cursor: pointer;
padding: 4px;
border-radius: 4px;
transition: all 0.2s;
}

.alert-close:hover {
background: #2b3139;
color: #ffffff;
}

/* Sidebar */
.profile-sidebar {
display: flex;
flex-direction: column;
gap: 24px;
}

.sidebar-card {
background: #1e2329;
border: 1px solid #474d57;
border-radius: 16px;
overflow: hidden;
}

.sidebar-card .card-header {
padding: 20px;
border-bottom: 1px solid #474d57;
}

.sidebar-card .card-content {
padding: 20px;
}

/* Action Buttons */
.action-buttons {
display: flex;
flex-direction: column;
gap: 8px;
}

.action-btn {
display: flex;
align-items: center;
gap: 12px;
width: 100%;
padding: 12px 16px;
background: #0b0e11;
border: 1px solid #474d57;
border-radius: 8px;
color: #848e9c;
font-size: 14px;
cursor: pointer;
transition: all 0.2s;
}

.action-btn:hover {
background: #2b3139;
border-color: #f0b90b;
color: #f0b90b;
transform: translateY(-1px);
}

.btn-icon {
font-size: 16px;
}

/* Security Score */
.security-score {
text-align: center;
}

.score-circle {
width: 80px;
height: 80px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
margin: 0 auto 16px;
position: relative;
border: 4px solid;
}

.score-circle.excellent {
border-color: #03a66d;
background: rgba(3, 166, 109, 0.1);
}

.score-circle.good {
border-color: #f0b90b;
background: rgba(240, 185, 11, 0.1);
}

.score-circle.fair {
border-color: #fa8c16;
background: rgba(250, 140, 22, 0.1);
}

.score-circle.poor {
border-color: #cf304a;
background: rgba(207, 48, 74, 0.1);
}

.score-value {
font-size: 18px;
font-weight: 700;
color: #ffffff;
}

.score-details {
display: flex;
flex-direction: column;
gap: 8px;
}

.score-item {
display: flex;
align-items: center;
gap: 8px;
font-size: 12px;
color: #848e9c;
}

.score-item.completed {
color: #03a66d;
}

/* Support Options */
.support-options {
display: flex;
flex-direction: column;
gap: 8px;
}

.support-btn {
display: flex;
align-items: center;
gap: 12px;
width: 100%;
padding: 12px 16px;
background: #0b0e11;
border: 1px solid #474d57;
border-radius: 8px;
color: #848e9c;
font-size: 14px;
cursor: pointer;
transition: all 0.2s;
}

.support-btn:hover {
background: #2b3139;
border-color: #f0b90b;
color: #f0b90b;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
opacity: 0;
transform: translateY(10px);
}

/* Responsive Design */
@media (max-width: 1024px) {
.profile-body {
  grid-template-columns: 1fr;
  gap: 20px;
}

.profile-sidebar {
  order: -1;
}

.sidebar-card {
  display: none;
}

.sidebar-card:first-child {
  display: block;
}
}

@media (max-width: 768px) {
.profile-body {
  padding: 16px;
}

.header-content {
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.profile-stats {
  width: 100%;
  justify-content: space-between;
}

.card-header {
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.avatar-section {
  flex-direction: column;
  text-align: center;
  gap: 16px;
}

.header-right {
  width: 100%;
  text-align: left;
}

.balance-display {
  align-items: flex-start;
}

.form-grid {
  grid-template-columns: 1fr;
  gap: 16px;
}

.form-actions {
  flex-direction: column;
}

.tabs-nav {
  flex-direction: column;
}
}

@media (max-width: 480px) {
.profile-header {
  padding: 16px;
}

.page-title {
  font-size: 24px;
}

.profile-card,
.sidebar-card,
.form-card {
  border-radius: 12px;
}

.card-content {
  padding: 16px;
}

.avatar-image {
  width: 64px;
  height: 64px;
}

.avatar-initial {
  font-size: 24px;
}

.username {
  font-size: 20px;
}

.amount {
  font-size: 20px;
}
}

/* Enhanced Visual Effects */
.profile-card,
.form-card,
.sidebar-card {
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
}

/* Hover Effects */
.action-btn:hover {
box-shadow: 0 4px 12px rgba(240, 185, 11, 0.15);
}

/* Enhanced Button States */
.btn-primary {
box-shadow: 0 4px 15px rgba(240, 185, 11, 0.3);
}

.btn-primary:hover:not(:disabled) {
box-shadow: 0 6px 20px rgba(240, 185, 11, 0.4);
}

.btn-primary:active {
transform: translateY(0);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
width: 6px;
}

::-webkit-scrollbar-track {
background: #0b0e11;
}

::-webkit-scrollbar-thumb {
background: #474d57;
border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
background: #f0b90b;
}

/* Focus States */
.btn:focus,
.action-btn:focus,
.support-btn:focus {
outline: 2px solid #f0b90b;
outline-offset: 2px;
}



.profile-card::before {
content: '';
position: absolute;
top: 0;
left: 0;
right: 0;
height: 2px;
background: linear-gradient(90deg, #f0b90b, #f8d12f, #f0b90b);
background-size: 200% 100%;
animation: shimmer 2s infinite;
}

@keyframes shimmer {
0% { background-position: -200% 0; }
100% { background-position: 200% 0; }
}

.card-header {
display: flex;
justify-content: space-between;
align-items: center;
}

.header-left {
flex: 1;
}

.avatar-section {
display: flex;
align-items: center;
gap: 20px;
}

.user-avatar.large {
position: relative;
}

.avatar-image {
width: 80px;
height: 80px;
border-radius: 50%;
background: linear-gradient(135deg, #f0b90b, #f8d12f);
display: flex;
align-items: center;
justify-content: center;
overflow: hidden;

}


</style>
