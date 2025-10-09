import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'diyar-crm-secret-key-2024'

// Middleware
app.use(cors())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Mock Database
let users = [
  {
    id: '1',
    email: 'admin@diyar.bh',
    password: bcrypt.hashSync('password123', 10),
    name: 'Ahmed Al-Mansouri',
    role: 'admin',
    permissions: ['all']
  },
  {
    id: '2',
    email: 'sales@diyar.bh',
    password: bcrypt.hashSync('password123', 10),
    name: 'Sarah Johnson',
    role: 'sales_rep',
    permissions: ['leads', 'properties', 'bulk_recommendations']
  }
]

let properties = [
  {
    id: '1',
    title: 'Al Bareh Villa #12',
    project: 'Al Bareh',
    type: 'villa',
    status: 'available',
    price: 185000,
    currency: 'BHD',
    size: 183,
    bedrooms: 3,
    bathrooms: 2,
    location: 'Al Muharraq',
    description: 'Beautiful villa in the prestigious Al Bareh development',
    images: ['/property-1.jpg', '/property-1-2.jpg'],
    floorPlans: ['/floorplan-1.pdf'],
    amenities: ['Swimming Pool', 'Gym', 'Garden', 'Parking'],
    leadMatches: { total: 23, hni: 8, investor: 7, retail: 8 },
    interestScore: 94,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Suhail Commercial Plot #8',
    project: 'Suhail',
    type: 'commercial_plot',
    status: 'available',
    price: 125000,
    currency: 'BHD',
    size: 400,
    location: 'North Islands',
    description: 'Prime commercial plot in the new Suhail development',
    images: ['/property-2.jpg'],
    amenities: ['Commercial Zoning', 'High Traffic Area', 'Utilities Ready'],
    leadMatches: { total: 15, hni: 3, investor: 9, retail: 3 },
    interestScore: 78,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z'
  },
  {
    id: '3',
    title: 'Jeewan Villa #5',
    project: 'Jeewan',
    type: 'villa',
    status: 'available',
    price: 220000,
    currency: 'BHD',
    size: 250,
    bedrooms: 4,
    bathrooms: 3,
    location: 'Al Muharraq',
    description: 'Luxury villa with premium finishes and sea views',
    images: ['/property-3.jpg', '/property-3-2.jpg'],
    amenities: ['Sea View', 'Private Beach Access', 'Premium Finishes', 'Smart Home'],
    leadMatches: { total: 31, hni: 18, investor: 8, retail: 5 },
    interestScore: 85,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
]

let leads = [
  {
    id: '1',
    firstName: 'Mohammed',
    lastName: 'Al-Rashid',
    email: 'mohammed.rashid@email.com',
    phone: '+973 3334 5555',
    preferredLanguage: 'en',
    buyerType: 'hni',
    budget: { min: 500000, max: 1000000, currency: 'BHD' },
    propertyInterest: ['villa', 'commercial'],
    timeline: 'immediate',
    status: 'prospect',
    score: 94,
    source: 'website',
    assignedTo: '1',
    notes: [
      {
        id: '1',
        content: 'Very interested in Al Bareh project. Has viewed similar properties.',
        createdBy: '1',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ],
    activities: [
      {
        id: '1',
        type: 'call',
        description: 'Initial consultation call - very interested',
        completedAt: '2024-01-15T10:00:00Z',
        createdBy: '1',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ],
    aiInsights: {
      purchaseProbability: 89,
      recommendedActions: ['Schedule immediate site visit', 'Prepare investment analysis'],
      optimalContactTime: 'Tuesday 10:00 AM',
      matchingProperties: ['1', '3']
    },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+973 3334 6666',
    preferredLanguage: 'en',
    buyerType: 'investor',
    budget: { min: 100000, max: 300000, currency: 'BHD' },
    propertyInterest: ['commercial', 'plot'],
    timeline: '3-6_months',
    status: 'contacted',
    score: 73,
    source: 'referral',
    assignedTo: '2',
    notes: [],
    activities: [
      {
        id: '2',
        type: 'email',
        description: 'Sent commercial property portfolio',
        completedAt: '2024-01-14T14:00:00Z',
        createdBy: '2',
        createdAt: '2024-01-14T14:00:00Z'
      }
    ],
    aiInsights: {
      purchaseProbability: 67,
      recommendedActions: ['Send Suhail project details', 'Schedule meeting next week'],
      optimalContactTime: 'Wednesday 2:00 PM',
      matchingProperties: ['2']
    },
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T14:00:00Z'
  },
  {
    id: '3',
    firstName: 'Omar',
    lastName: 'Al-Mansouri',
    email: 'omar.mansouri@email.com',
    phone: '+973 3334 7777',
    preferredLanguage: 'ar',
    buyerType: 'retail',
    budget: { min: 150000, max: 250000, currency: 'BHD' },
    propertyInterest: ['villa'],
    timeline: '6-12_months',
    status: 'viewing',
    score: 81,
    source: 'social_media',
    assignedTo: '1',
    notes: [],
    activities: [
      {
        id: '3',
        type: 'site_visit',
        description: 'Scheduled site visit for Al Bareh villa',
        scheduledAt: '2024-01-20T10:00:00Z',
        createdBy: '1',
        createdAt: '2024-01-16T10:00:00Z'
      }
    ],
    aiInsights: {
      purchaseProbability: 78,
      recommendedActions: ['Prepare financing options', 'Follow up after site visit'],
      optimalContactTime: 'Saturday 11:00 AM',
      matchingProperties: ['1']
    },
    createdAt: '2024-01-13T09:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  }
]

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  )
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Diyar CRM API is running' })
})

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' })
    }

    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)
    const { password: _, ...userWithoutPassword } = user

    res.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const { password: _, ...userWithoutPassword } = user
  res.json({ user: userWithoutPassword })
})

// Property Routes
app.get('/api/properties', authenticateToken, (req, res) => {
  try {
    let filteredProperties = [...properties]

    // Apply filters
    const { project, type, status, search, priceRange } = req.query

    if (project) {
      filteredProperties = filteredProperties.filter(p => p.project === project)
    }

    if (type) {
      filteredProperties = filteredProperties.filter(p => p.type === type)
    }

    if (status) {
      filteredProperties = filteredProperties.filter(p => p.status === status)
    }

    if (search) {
      const searchLower = search.toString().toLowerCase()
      filteredProperties = filteredProperties.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.project.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower)
      )
    }

    if (priceRange && Array.isArray(priceRange) && priceRange.length === 2) {
      const [min, max] = priceRange.map(Number)
      filteredProperties = filteredProperties.filter(p => 
        p.price >= min && p.price <= max
      )
    }

    res.json({ properties: filteredProperties })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/properties/:id', authenticateToken, (req, res) => {
  try {
    const property = properties.find(p => p.id === req.params.id)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    res.json({ property })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/properties', authenticateToken, (req, res) => {
  try {
    const newProperty = {
      id: generateId(),
      ...req.body,
      leadMatches: { total: 0, hni: 0, investor: 0, retail: 0 },
      interestScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    properties.push(newProperty)
    res.status(201).json({ property: newProperty })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.put('/api/properties/:id', authenticateToken, (req, res) => {
  try {
    const index = properties.findIndex(p => p.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ message: 'Property not found' })
    }

    properties[index] = {
      ...properties[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    res.json({ property: properties[index] })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/api/properties/:id', authenticateToken, (req, res) => {
  try {
    const index = properties.findIndex(p => p.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ message: 'Property not found' })
    }

    properties.splice(index, 1)
    res.json({ message: 'Property deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Lead Routes
app.get('/api/leads', authenticateToken, (req, res) => {
  try {
    let filteredLeads = [...leads]

    // Apply filters
    const { status, buyerType, assignedTo, search, scoreRange } = req.query

    if (status) {
      filteredLeads = filteredLeads.filter(l => l.status === status)
    }

    if (buyerType) {
      filteredLeads = filteredLeads.filter(l => l.buyerType === buyerType)
    }

    if (assignedTo) {
      if (assignedTo === 'me') {
        filteredLeads = filteredLeads.filter(l => l.assignedTo === req.user.id)
      } else if (assignedTo === 'unassigned') {
        filteredLeads = filteredLeads.filter(l => !l.assignedTo)
      } else {
        filteredLeads = filteredLeads.filter(l => l.assignedTo === assignedTo)
      }
    }

    if (search) {
      const searchLower = search.toString().toLowerCase()
      filteredLeads = filteredLeads.filter(l => 
        `${l.firstName} ${l.lastName}`.toLowerCase().includes(searchLower) ||
        l.email.toLowerCase().includes(searchLower) ||
        l.phone.includes(search)
      )
    }

    if (scoreRange && Array.isArray(scoreRange) && scoreRange.length === 2) {
      const [min, max] = scoreRange.map(Number)
      filteredLeads = filteredLeads.filter(l => 
        l.score >= min && l.score <= max
      )
    }

    res.json({ leads: filteredLeads })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const lead = leads.find(l => l.id === req.params.id)
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    res.json({ lead })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/leads', authenticateToken, (req, res) => {
  try {
    const newLead = {
      id: generateId(),
      ...req.body,
      notes: [],
      activities: [],
      aiInsights: {
        purchaseProbability: Math.floor(Math.random() * 40) + 60,
        recommendedActions: ['Contact within 24 hours', 'Send property recommendations'],
        optimalContactTime: 'Tuesday 10:00 AM',
        matchingProperties: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    leads.push(newLead)
    res.status(201).json({ lead: newLead })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.put('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const index = leads.findIndex(l => l.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    leads[index] = {
      ...leads[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    res.json({ lead: leads[index] })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.patch('/api/leads/:id/status', authenticateToken, (req, res) => {
  try {
    const { status } = req.body
    const index = leads.findIndex(l => l.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    leads[index].status = status
    leads[index].updatedAt = new Date().toISOString()

    // Add activity for status change
    leads[index].activities.push({
      id: generateId(),
      type: 'follow_up',
      description: `Status changed to ${status}`,
      completedAt: new Date().toISOString(),
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    })

    res.json({ lead: leads[index] })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/leads/:id/notes', authenticateToken, (req, res) => {
  try {
    const { content } = req.body
    const index = leads.findIndex(l => l.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    const newNote = {
      id: generateId(),
      content,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    }

    leads[index].notes.push(newNote)
    leads[index].updatedAt = new Date().toISOString()

    res.json({ lead: leads[index] })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/leads/:id/activities', authenticateToken, (req, res) => {
  try {
    const activityData = req.body
    const index = leads.findIndex(l => l.id === req.params.id)
    
    if (index === -1) {
      return res.status(404).json({ message: 'Lead not found' })
    }

    const newActivity = {
      id: generateId(),
      ...activityData,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    }

    leads[index].activities.push(newActivity)
    leads[index].updatedAt = new Date().toISOString()

    res.json({ lead: leads[index] })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Bulk Recommendations
app.post('/api/leads/bulk-recommendations', authenticateToken, (req, res) => {
  try {
    const { leadIds, propertyIds, messageTemplate } = req.body

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: 'Lead IDs are required' })
    }

    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ message: 'Property IDs are required' })
    }

    if (!messageTemplate || !messageTemplate.trim()) {
      return res.status(400).json({ message: 'Message template is required' })
    }

    // Simulate sending emails/messages
    const sent = Math.max(leadIds.length - Math.floor(Math.random() * 3), 0)
    const failed = leadIds.length - sent

    // Add activities to leads
    leadIds.forEach(leadId => {
      const leadIndex = leads.findIndex(l => l.id === leadId)
      if (leadIndex !== -1) {
        leads[leadIndex].activities.push({
          id: generateId(),
          type: 'email',
          description: 'Bulk property recommendations sent',
          completedAt: new Date().toISOString(),
          createdBy: req.user.id,
          createdAt: new Date().toISOString()
        })
        leads[leadIndex].updatedAt = new Date().toISOString()
      }
    })

    res.json({
      sent,
      failed,
      details: []
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Diyar CRM Server running on port ${PORT}`)
  console.log(`📊 Dashboard: http://localhost:3000`)
  console.log(`🔗 API: http://localhost:${PORT}/api`)
  console.log(`💾 Demo Users:`)
  console.log(`   Admin: admin@diyar.bh / password123`)
  console.log(`   Sales: sales@diyar.bh / password123`)
})