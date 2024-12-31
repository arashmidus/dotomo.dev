import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.notes) {
      return NextResponse.json({ 
        success: false,
        message: "Missing required fields"
      }, { status: 400 })
    }

    // Create support request
    const support = await prisma.support.create({
      data: {
        name: body.name,
        email: body.email,
        notes: body.notes
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Support request submitted successfully"
    })

  } catch (error) {
    console.error('Support request error:', error)
    return NextResponse.json({ 
      success: false,
      message: "Failed to submit support request"
    }, { status: 500 })
  }
} 