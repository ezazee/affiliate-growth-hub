import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// ================================
// GET: Ambil 1 order by orderNumber
// ================================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    // WAJIB await params (Next.js App Router terbaru)
    const { orderNumber } = await context.params

    const client = await clientPromise
    const db = client.db()

    const order = await db
      .collection('orders')
      .findOne({ orderNumber })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// ===================================
// PATCH: Update status order
// ===================================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    // WAJIB await params
    const { orderNumber } = await context.params
    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('orders').updateOne(
      { orderNumber },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Order ${orderNumber} status updated to ${status}`,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
