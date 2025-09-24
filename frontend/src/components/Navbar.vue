<template>
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Logo/Brand -->
        <div class="navbar-brand">
          <router-link to="/dashboard" class="brand-link">
            <div class="brand-logo">
              <span class="logo-icon">💰</span>
              <span class="logo-text">FundyPro</span>
            </div>
          </router-link>
        </div>
  
        <!-- Desktop Navigation -->
        <div class="navbar-nav desktop-nav">
          <router-link 
            v-for="item in navItems" 
            :key="item.name"
            :to="item.path" 
            class="nav-link"
            :class="{ 'active': $route.path === item.path }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </div>
  
        <!-- Right Side Actions -->
        <div class="navbar-actions">
          <!-- Balance Display -->
          <div class="balance-display" v-if="!isMobile">
            <div class="balance-info">
              <span class="balance-label">Balance</span>
              <div class="balance-amount">
                <span class="currency">GHS</span>
                <span class="amount">{{ formatBalance(userBalance) }}</span>
              </div>
            </div>
          </div>
  
          <!-- Notifications -->
          <div class="notification-wrapper">
            <button class="notification-btn" @click="toggleNotifications">
              <span class="notification-icon">🔔</span>
              <span class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
            </button>
            
            <!-- Notifications Dropdown -->
            <div class="notifications-dropdown" v-if="showNotifications" @click.stop>
              <div class="dropdown-header">
                <h3>Notifications</h3>
                <button class="mark-all-read" @click="markAllRead">Mark all read</button>
              </div>
              <div class="notifications-list">
                <div 
                  v-for="notification in notifications" 
                  :key="notification.id"
                  class="notification-item"
                  :class="{ 'unread': !notification.read }"
                >
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ notification.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- User Profile -->
          <div class="user-profile">
            <button class="profile-btn" @click="toggleUserMenu">
              <div class="user-avatar">
                <span class="avatar-text">{{ userInitials }}</span>
              </div>
              <div class="user-info" v-if="!isMobile">
                <span class="username">@{{ username }}</span>
                <span class="user-status">{{ userStatus }}</span>
              </div>
              <span class="dropdown-arrow">▼</span>
            </button>
  
            <!-- User Dropdown -->
            <div class="user-dropdown" v-if="showUserMenu" @click.stop>
              <div class="dropdown-user-info">
                <div class="user-avatar large">
                  <span class="avatar-text">{{ userInitials }}</span>
                </div>
                <div class="user-details">
                  <div class="username">@{{ username }}</div>
                  <div class="user-email">{{ userEmail }}</div>
                </div>
              </div>
              
              <div class="dropdown-divider"></div>
              
              <div class="dropdown-menu">
                <router-link to="/profile" class="dropdown-item">
                  <span class="item-icon">👤</span>
                  <span>Profile Settings</span>
                </router-link>
                <router-link to="/security" class="dropdown-item">
                  <span class="item-icon">🔒</span>
                  <span>Security</span>
                </router-link>
                <router-link to="/referrals" class="dropdown-item">
                  <span class="item-icon">👥</span>
                  <span>Referrals</span>
                </router-link>
                <router-link to="/help" class="dropdown-item">
                  <span class="item-icon">❓</span>
                  <span>Help Center</span>
                </router-link>
                
                <div class="dropdown-divider"></div>
                
                <button class="dropdown-item logout" @click="handleLogout">
                  <span class="item-icon">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
  
          <!-- Mobile Menu Toggle -->
          <button class="mobile-menu-toggle" @click="toggleMobileMenu" v-if="isMobile">
            <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
            <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
            <span class="hamburger-line" :class="{ active: showMobileMenu }"></span>
          </button>
        </div>
      </div>
  
      <!-- Mobile Navigation -->
      <div class="mobile-nav" :class="{ active: showMobileMenu }" v-if="isMobile">
        <!-- Mobile Balance -->
        <div class="mobile-balance">
          <div class="balance-info">
            <span class="balance-label">Available Balance</span>
            <div class="balance-amount">
              <span class="currency">GHS</span>
              <span class="amount">{{ formatBalance(userBalance) }}</span>
            </div>
          </div>
        </div>
  
        <!-- Mobile Nav Items -->
        <div class="mobile-nav-items">
          <router-link 
            v-for="item in navItems" 
            :key="item.name"
            :to="item.path" 
            class="mobile-nav-link"
            :class="{ 'active': $route.path === item.path }"
            @click="closeMobileMenu"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </router-link>
        </div>
      </div>
  
      <!-- Overlay for mobile menu -->
      <div class="mobile-overlay" v-if="showMobileMenu && isMobile" @click="closeMobileMenu"></div>
    </nav>
  </template>
  
  <script>
  import AuthService from '@/services/auth'
  
  export default {
    name: 'Navbar',
    data() {
      return {
        showNotifications: false,
        showUserMenu: false,
        showMobileMenu: false,
        isMobile: false,
        userBalance: 2547.83,
        
        
        navItems: [
          { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
          { name: 'Deposit', path: '/deposit', icon: '💰' },
          { name: 'Withdraw', path: '/withdraw', icon: '🏦' },
          { name: 'Investments', path: '/investments', icon: '📈' },
        ],
        
        notifications: [
          {
            id: 1,
            title: 'Investment Completed',
            message: 'Your Premium Plan investment has matured. Profit: GHS 1,250.00',
            time: '2 minutes ago',
            read: false
          },
          {
            id: 2,
            title: 'Daily Earnings',
            message: 'You earned GHS 85.50 from your active investments today',
            time: '1 hour ago',
            read: false
          },
          {
            id: 3,
            title: 'Withdrawal Approved',
            message: 'Your withdrawal request of GHS 500.00 has been approved',
            time: '3 hours ago',
            read: true
          },
          {
            id: 4,
            title: 'New Referral Bonus',
            message: 'You earned GHS 25.00 referral bonus from @user1234',
            time: '1 day ago',
            read: true
          }
        ]
      }
    },
    
    computed: {
      username() {
        return localStorage.getItem('username') || 'User'
      },
      
      userEmail() {
        return localStorage.getItem('user_email') || 'user@example.com'
      },
      
      userInitials() {
        const name = this.username
        return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name.charAt(0).toUpperCase()
      },
      
      userStatus() {
        return 'VIP Member' // Could be dynamic based on user level
      },
      
      unreadCount() {
        return this.notifications.filter(n => !n.read).length
      }
    },
    
    methods: {
      async fetchUserBalance() {
        try {
          const userResponse = await AuthService.getCurrentUser()
          if (userResponse && userResponse.balance !== undefined) {
            this.userBalance = userResponse.balance
          }
        } catch (error) {
          console.error('Error fetching balance:', error)
        }
      },
      
      formatBalance(amount) {
        return parseFloat(amount || 0).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      },
      
      toggleNotifications() {
        this.showNotifications = !this.showNotifications
        this.showUserMenu = false
      },
      
      toggleUserMenu() {
        this.showUserMenu = !this.showUserMenu
        this.showNotifications = false
      },
      
      toggleMobileMenu() {
        this.showMobileMenu = !this.showMobileMenu
      },
      
      closeMobileMenu() {
        this.showMobileMenu = false
      },
      
      markAllRead() {
        this.notifications.forEach(notification => {
          notification.read = true
        })
      },
      
      handleLogout() {
        AuthService.logout()
        this.$router.push('/login')
      },
      
      checkMobile() {
        this.isMobile = window.innerWidth <= 768
      },
      
      handleClickOutside(event) {
        if (!event.target.closest('.notification-wrapper')) {
          this.showNotifications = false
        }
        if (!event.target.closest('.user-profile')) {
          this.showUserMenu = false
        }
      }
    },
    
    mounted() {
      this.fetchUserBalance()
      this.checkMobile()
      window.addEventListener('resize', this.checkMobile)
      document.addEventListener('click', this.handleClickOutside)
      
      // Update balance periodically
      setInterval(() => {
        this.fetchUserBalance()
      }, 30000) // Every 30 seconds
    },
    
    beforeUnmount() {
      window.removeEventListener('resize', this.checkMobile)
      document.removeEventListener('click', this.handleClickOutside)
    }
  }
  </script>
  
  <style scoped>
  .navbar {
    background: #0b0e11;
    border-bottom: 1px solid #1e2329;
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(10px);
  }
  
  .navbar-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    height: 70px;
  }
  
  /* Brand */
  .navbar-brand {
    flex-shrink: 0;
  }
  
  .brand-link {
    text-decoration: none;
    color: inherit;
  }
  
  .brand-logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .logo-icon {
    font-size: 28px;
  }
  
  .logo-text {
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #f0b90b, #f8d12f);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  /* Desktop Navigation */
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 32px;
    flex: 1;
    justify-content: center;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    text-decoration: none;
    color: #848e9c;
    font-weight: 500;
    transition: all 0.2s;
    position: relative;
  }
  
  .nav-link:hover {
    color: #f0b90b;
    background: rgba(240, 185, 11, 0.1);
  }
  
  .nav-link.active {
    color: #f0b90b;
    background: rgba(240, 185, 11, 0.15);
  }
  
  .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: #f0b90b;
    border-radius: 50%;
  }
  
  .nav-icon {
    font-size: 16px;
  }
  
  .nav-text {
    font-size: 14px;
  }
  
  /* Navbar Actions */
  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  /* Balance Display */
  .balance-display {
    padding: 8px 16px;
    background: #1e2329;
    border-radius: 8px;
    border: 1px solid #474d57;
  }
  
  .balance-info .balance-label {
    font-size: 10px;
    color: #848e9c;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .balance-amount {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
  }
  
  .currency {
    font-size: 12px;
    color: #f0b90b;
    font-weight: 600;
  }
  
  .amount {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
  }
  
  /* Notifications */
  .notification-wrapper {
    position: relative;
  }
  
  .notification-btn {
    position: relative;
    background: #1e2329;
    border: 1px solid #474d57;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .notification-btn:hover {
    border-color: #f0b90b;
  }
  
  .notification-icon {
    font-size: 16px;
  }
  
  .notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #cf304a;
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
  }
  
  .notifications-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 350px;
    background: #1e2329;
    border: 1px solid #474d57;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    z-index: 1001;
  }
  
  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #474d57;
  }
  
  .dropdown-header h3 {
    color: #ffffff;
    font-size: 16px;
    margin: 0;
  }
  
  .mark-all-read {
    background: none;
    border: none;
    color: #f0b90b;
    font-size: 12px;
    cursor: pointer;
  }
  
  .notifications-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .notification-item {
    padding: 12px 16px;
    border-bottom: 1px solid #2b3139;
    transition: all 0.2s;
  }
  
  .notification-item:hover {
    background: #2b3139;
  }
  
  .notification-item.unread {
    background: rgba(240, 185, 11, 0.05);
    border-left: 3px solid #f0b90b;
  }
  
  .notification-title {
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .notification-message {
    color: #848e9c;
    font-size: 12px;
    line-height: 1.4;
    margin-bottom: 4px;
  }
  
  .notification-time {
    color: #6c757d;
    font-size: 11px;
  }
  
  /* User Profile */
  .user-profile {
    position: relative;
  }
  
  .profile-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #1e2329;
    border: 1px solid #474d57;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .profile-btn:hover {
    border-color: #f0b90b;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f0b90b, #f8d12f);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .user-avatar.large {
    width: 48px;
    height: 48px;
  }
  
  .avatar-text {
    color: #000000;
    font-weight: 700;
    font-size: 12px;
  }
  
  .large .avatar-text {
    font-size: 16px;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .username {
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
  }
  
  .user-status {
    color: #03a66d;
    font-size: 11px;
  }
  
  .dropdown-arrow {
    color: #848e9c;
    font-size: 10px;
    transition: transform 0.2s;
  }
  
  .user-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 280px;
    background: #1e2329;
    border: 1px solid #474d57;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    z-index: 1001;
  }
  
  .dropdown-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px;
  }
  
  .user-details .username {
    margin-bottom: 4px;
  }
  
  .user-email {
    color: #848e9c;
    font-size: 12px;
  }
  
  .dropdown-divider {
    height: 1px;
    background: #474d57;
    margin: 0 16px;
  }
  
  .dropdown-menu {
    padding: 8px 0;
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: #ffffff;
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .dropdown-item:hover {
    background: #2b3139;
  }
  
  .dropdown-item.logout {
    color: #cf304a;
  }
  
  .item-icon {
    font-size: 16px;
    width: 20px;
  }
  
  /* Mobile Menu Toggle */
  .mobile-menu-toggle {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
  }
  
  .hamburger-line {
    width: 20px;
    height: 2px;
    background: #ffffff;
    transition: all 0.3s;
  }
  
  .hamburger-line.active:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  
  .hamburger-line.active:nth-child(2) {
    opacity: 0;
  }
  
  .hamburger-line.active:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }
  
  /* Mobile Navigation */
  .mobile-nav {
    display: none;
    background: #1e2329;
    border-top: 1px solid #474d57;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.3s;
    z-index: 999;
  }
  
  .mobile-nav.active {
    display: block;
    transform: translateY(0);
    opacity: 1;
  }
  
  .mobile-balance {
    padding: 20px;
    border-bottom: 1px solid #474d57;
    text-align: center;
  }
  
  .mobile-nav-items {
    padding: 16px 0;
  }
  
  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    color: #848e9c;
    text-decoration: none;
    transition: all 0.2s;
  }
  
  .mobile-nav-link:hover,
  .mobile-nav-link.active {
    background: rgba(240, 185, 11, 0.1);
    color: #f0b90b;
  }
  
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }
  
  /* Hide desktop nav on mobile */
  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }
    
    .balance-display {
      display: none;
    }
    
    .user-info {
      display: none;
    }
    
    .navbar-container {
      padding: 0 16px;
    }
  }
  
  /* Hide mobile elements on desktop */
  @media (min-width: 769px) {
    .mobile-menu-toggle {
      display: none;
    }
  }
  </style>