import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Handle testflight invite
    if ('email' in body && Object.keys(body).length === 1) {
      try {
        await prisma.waitlistEmail.create({
          data: { email: body.email }
        })

        return NextResponse.json({ 
          success: true,
          message: "You've been added to the waitlist! We'll send you an invite once the app is approved."
        })
      } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
          return NextResponse.json({ 
            success: true,
            message: "You're already on the waitlist! We'll send you an invite once the app is approved."
          })
        }
        throw error
      }
    }
    
    return NextResponse.json({ 
      success: false,
      message: "Invalid request"
    }, { status: 400 })

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      message: "An error occurred"
    }, { status: 500 })
  }
} 