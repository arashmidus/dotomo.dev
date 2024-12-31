import { NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'
import axios from 'axios'
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
      } catch (dbError: any) {
        if (dbError.code === 'P2002') {
          return NextResponse.json({ 
            success: true,
            message: "You're already on the waitlist! We'll send you an invite once the app is approved."
          })
        }
        throw dbError
      }
    }
    
    // Handle support request
    if ('name' in body && 'email' in body && 'notes' in body) {
      const support = await prisma.support.create({
        data: {
          name: body.name,
          email: body.email,
          notes: body.notes,
        },
      })

      return NextResponse.json({ success: true, support })
    }

    throw new Error('Invalid request body')

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Request failed', details: error.message },
      { status: 500 }
    )
  }
} 