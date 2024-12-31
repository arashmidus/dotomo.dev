import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create support request
    await prisma.support.create({
      data: {
        name: body.name,
        email: body.email,
        notes: body.notes,
      }
    })

    return NextResponse.json({ 
      success: true,
      message: "Support request submitted successfully"
    })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      message: "Failed to submit support request"
    }, { status: 500 })
  }
} 