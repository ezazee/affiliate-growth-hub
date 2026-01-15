import clientPromise from '@/lib/mongodb'

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  description: string
  imageUrl: string
  commissionType: 'percentage' | 'fixed'
  commissionValue: number
  category: string
  stock: number
  createdAt?: Date
}

export interface LandingSettings {
  heroTitle?: string
  heroDescription?: string
  aboutTitle?: string
  aboutDescription?: string
  aboutImage?: string
  footerDescription?: string
  instagramUrl?: string
  tiktokUrl?: string
  shopeeUrl?: string
  websiteUrl?: string
  whatsappNumber?: string
  email?: string
}

export async function getProducts(): Promise<Product[]> {
  try {
    const client = await clientPromise
    const db = client.db()
    
    const products = await db.collection('products')
      .find({ isActive: true })
      .project({
        _id: 1,
        name: 1,
        slug: 1,
        price: 1,
        description: 1,
        imageUrl: 1,
        commissionType: 1,
        commissionValue: 1,
        category: 1,
        stock: 1,
        createdAt: 1
      })
      .limit(20) // Limit to 20 products for performance
      .sort({ createdAt: -1 })
      .toArray()
    
    // Convert _id to id for frontend compatibility
    return products.map(product => ({
      ...product,
      id: product._id?.toString()
    })) as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getLandingSettings(): Promise<LandingSettings> {
  try {
    const client = await clientPromise
    const db = client.db()
    
    const settings = await db.collection('settings')
      .find({})
      .toArray()
    
    // Convert settings array to object
    const settingsObj: LandingSettings = {}
    settings.forEach(setting => {
      if (setting.name) {
        settingsObj[setting.name as keyof LandingSettings] = setting.value
      }
    })
    
    return settingsObj
  } catch (error) {
    console.error('Error fetching landing settings:', error)
    return {}
  }
}