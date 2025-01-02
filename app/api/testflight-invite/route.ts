import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    // Get environment variables
    const privateKey = process.env.APP_STORE_CONNECT_PRIVATE_KEY!.replace(/\\n/g, '\n')
    const keyId = process.env.APP_STORE_CONNECT_KEY_ID!
    const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID!
    const appId = "6739987388"
    const betaGroupId = "a0305cd6-078b-4fd1-92c7-d411e182d283"

    // Generate token
    const token = jwt.sign({
      iss: issuerId,
      exp: Math.floor(Date.now() / 1000) + 1200,
      aud: 'appstoreconnect-v1'
    }, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: keyId,
        typ: 'JWT'
      }
    })

    // First check if tester already exists
    const checkTesterResponse = await fetch(
      `https://api.appstoreconnect.apple.com/v1/betaTesters?filter[email]=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const checkTesterData = await checkTesterResponse.json()
    console.log('Check Tester Response:', checkTesterData)

    let betaTesterId
    let isExistingTester = false

    if (checkTesterData.data && checkTesterData.data.length > 0) {
      // Tester exists
      isExistingTester = true
      betaTesterId = checkTesterData.data[0].id
      console.log('Using existing tester ID:', betaTesterId)

      // Add tester to beta group if not already in it
      const addToGroupResponse = await fetch(
        `https://api.appstoreconnect.apple.com/v1/betaGroups/${betaGroupId}/relationships/betaTesters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: [{
            type: 'betaTesters',
            id: betaTesterId
          }]
        })
      })

      console.log('Add to Group Response:', await addToGroupResponse.text())
    } else {
      // Create new beta tester
      const createBetaTesterResponse = await fetch(
        'https://api.appstoreconnect.apple.com/v1/betaTesters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: 'betaTesters',
            attributes: {
              email: email,
              firstName: 'Beta',
              lastName: 'Tester'
            },
            relationships: {
              betaGroups: {
                data: [{
                  id: betaGroupId,
                  type: 'betaGroups'
                }]
              }
            }
          }
        })
      })

      const testerData = await createBetaTesterResponse.json()
      console.log('Beta Tester Creation Response:', testerData)

      if (!createBetaTesterResponse.ok) {
        throw new Error(`Failed to create beta tester: ${JSON.stringify(testerData)}`)
      }

      betaTesterId = testerData.data.id
    }

    // Try to send invitation
    let alreadyAccepted = false
    try {
      const sendInviteResponse = await fetch(
        'https://api.appstoreconnect.apple.com/v1/betaTesterInvitations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            type: 'betaTesterInvitations',
            relationships: {
              app: {
                data: {
                  id: appId,
                  type: 'apps'
                }
              },
              betaTester: {
                data: {
                  id: betaTesterId,
                  type: 'betaTesters'
                }
              }
            }
          }
        })
      })

      const inviteData = await sendInviteResponse.json()
      console.log('Invite Response:', inviteData)

      if (!sendInviteResponse.ok) {
        if (inviteData.errors?.[0]?.code?.includes('ALREADY_ACCEPTED')) {
          alreadyAccepted = true
        } else {
          throw new Error(`Failed to send invite: ${JSON.stringify(inviteData)}`)
        }
      }
    } catch (inviteError) {
      console.log('Invite error:', inviteError)
      if (!alreadyAccepted) {
        throw inviteError
      }
    }

    // Return appropriate message based on user status
    if (alreadyAccepted) {
      return NextResponse.json({ 
        success: true,
        message: 'You already have access to TestFlight. Please check your TestFlight app to download the beta.',
        status: 'already_accepted'
      })
    } else if (isExistingTester) {
      return NextResponse.json({ 
        success: true,
        message: 'A new TestFlight invitation has been sent to your email. Please check your inbox (including spam folder).',
        status: 'reinvited'
      })
    } else {
      return NextResponse.json({ 
        success: true,
        message: 'Welcome! Please check your email for a TestFlight invitation (including spam folder).',
        status: 'new_invite'
      })
    }

  } catch (error) {
    console.error('Full Error Details:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 