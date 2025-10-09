# Diyar Property Management System

A comprehensive AI-enhanced property management and CRM system built for Diyar Al Muharraq, Bahrain's largest real estate development company.

## 🏗️ System Overview

This application provides a complete property management solution with:

- **Property Portfolio Management** - Manage residential and commercial properties
- **AI-Enhanced CRM** - Intelligent lead scoring and recommendations
- **Sales Team Interface** - Bulk recommendations and campaign management
- **Rapid Buyer Registration** - Quick onboarding with AI-powered matching
- **Advanced Analytics** - Performance tracking and insights
- **Mobile-Responsive Design** - Works on all devices

## 🚀 Features

### Property Management
- Property listings with detailed information
- Image galleries and floor plans
- Lead matching and interest scoring
- Status tracking (Available, Reserved, Sold)
- Advanced filtering and search

### CRM & Lead Management
- Lead pipeline with drag-and-drop functionality
- AI-powered lead scoring (0-100%)
- Buyer segmentation (HNI, Investor, Retail)
- Activity tracking and notes
- Automated insights and recommendations

### Sales Team Tools
- Bulk recommendation campaigns
- Target segment selection
- Personalized message templates
- Campaign analytics and tracking
- AI-optimized send times

### Rapid Registration
- 60-second buyer registration
- AI-powered property matching
- Budget and preference analysis
- Instant recommendations
- Multi-language support (English/Arabic)

### Analytics Dashboard
- Lead performance over time
- Property interest scores
- Buyer segment distribution
- Conversion funnel analysis
- AI-powered insights

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Chart.js** for data visualization
- **React Hook Form** for form management
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

### Development Tools
- **Vite** for fast development
- **ESLint** for code quality
- **Prettier** for code formatting
- **TypeScript** for type safety

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd diyar-property-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Demo Credentials

**Sales Manager:**
- Email: admin@diyar.bh
- Password: password123

**Sales Representative:**
- Email: sales@diyar.bh
- Password: password123

## 🎯 Key Components

### 1. Dashboard
- Real-time statistics and KPIs
- Recent activity feed
- AI-powered insights panel
- Quick action buttons

### 2. Property Management
- Grid/list view of properties
- Advanced filtering options
- Property details with lead matching
- Bulk operations support

### 3. CRM Pipeline
- Visual lead pipeline
- Drag-and-drop status updates
- Lead scoring and insights
- Activity tracking

### 4. Bulk Recommendations
- Segment-based targeting
- Property selection interface
- Message template editor
- Campaign performance tracking

### 5. Registration Portal
- Multi-step registration form
- AI preference analysis
- Instant property matching
- Mobile-optimized design

## 🤖 AI Features

### Lead Scoring Algorithm
- Analyzes buyer behavior and preferences
- Considers budget, timeline, and engagement
- Provides 0-100% purchase probability score
- Updates in real-time based on interactions

### Property Matching
- Matches buyers to suitable properties
- Considers budget, preferences, and timeline
- Provides confidence scores for each match
- Learns from successful conversions

### Predictive Analytics
- Optimal contact timing recommendations
- Market trend analysis
- Performance forecasting
- Conversion probability predictions

## 📱 Mobile Experience

- **Responsive Design**: Works seamlessly on all devices
- **Touch-Friendly**: Optimized for mobile interactions
- **Fast Loading**: Optimized assets and lazy loading
- **Offline Support**: Basic functionality works offline

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Different permissions per role
- **Rate Limiting**: API protection against abuse
- **Data Validation**: Input sanitization and validation
- **CORS Protection**: Controlled cross-origin access

## 📊 Sample Data

The application comes with comprehensive sample data:

### Properties
- Al Bareh Villas (183-600 sqm)
- Suhail Commercial Plots
- Jeewan Luxury Villas
- Various property types and price ranges

### Leads
- HNI, Investor, and Retail buyer profiles
- Different stages in sales pipeline
- Realistic activity and note history
- AI insights and recommendations

## 🚀 Deployment

### Frontend Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting provider

### Backend Deployment
1. Set production environment variables
2. Deploy to your server (Heroku, AWS, DigitalOcean, etc.)
3. Update API endpoints in frontend configuration

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Core CRM functionality
- ✅ Property management
- ✅ Bulk recommendations
- ✅ Analytics dashboard

### Phase 2 (Future)
- 🔄 WhatsApp integration
- 🔄 Email automation
- 🔄 Document management
- 🔄 Advanced reporting

### Phase 3 (Future)
- 🔄 Mobile app (React Native)
- 🔄 Advanced AI features
- 🔄 Integration with property portals
- 🔄 Virtual property tours

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for Diyar Al Muharraq.

## 🏢 About Diyar Al Muharraq

Diyar Al Muharraq is Bahrain's largest real estate development company, specializing in creating integrated commercial and residential communities. The company focuses on:

- **Sustainable Development**: Environmentally conscious projects
- **Community Building**: Creating vibrant, livable spaces
- **Innovation**: Leveraging technology for better customer experience
- **Quality**: Premium construction and finishing standards

## 📞 Support

For technical support or questions:
- Email: support@diyar.bh
- Phone: +973 XXXX XXXX
- Website: https://www.diyar.bh

---

**Built with ❤️ for Diyar Al Muharraq**