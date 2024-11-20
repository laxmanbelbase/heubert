import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type StateCode = 'nsw' | 'vic' | 'qld' | 'wa' | 'sa' | 'tas' | 'act' | 'nt';
type CountryCode = 'au' | 'np' | 'in' | 'us' | 'uk' | 'ca' | 'other';
type EducationLevel = 'high-school' | 'associate' | 'bachelor' | 'master';
type CourseCode = 'helpdesk-l1' | 'support-l2' | 'cyber-security';

interface FormData {
  name: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  otherCountry?: string;
  education: string;
  fieldOfStudy: string;
  institution: string;
  hasITExperience: 'yes' | 'no';
  yearsOfExperience?: string;
  currentJob?: string;
  selectedCourse: string;
  intake: string;
  referrer?: string;
  acceptFalseInfo: boolean;
  acceptTerms: boolean;
  submittedAt: string;
}

const EDUCATION_LEVELS: Record<EducationLevel, string> = {
  'high-school': 'High School',
  'associate': 'Associate Degree (Diploma)',
  'bachelor': 'Bachelor Degree',
  'master': 'Master Degree'
}

const COUNTRIES: Record<CountryCode, string> = {
  'au': 'Australia',
  'np': 'Nepal',
  'in': 'India',
  'us': 'United States',
  'uk': 'United Kingdom',
  'ca': 'Canada',
  'other': 'Other'
}

const STATES: Record<StateCode, string> = {
  'nsw': 'New South Wales',
  'vic': 'Victoria',
  'qld': 'Queensland',
  'wa': 'Western Australia',
  'sa': 'South Australia',
  'tas': 'Tasmania',
  'act': 'Australian Capital Territory',
  'nt': 'Northern Territory'
}

const COURSES: Record<CourseCode, string> = {
  'helpdesk-l1': 'IT Helpdesk Support (L1) - 6 weeks',
  'support-l2': 'IT Support and Networking (L2) - 10 weeks',
  'cyber-security': 'Cyber Security - 10 weeks'
}

export async function POST(request: Request) {
  try {
    console.log('📨 Starting application submission process...')
    const formData = await request.json() as FormData
    console.log('Received form data:', formData)

    console.log('🔍 Validating environment variables...')
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ Missing required environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('📧 Creating email transporter...')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    console.log('🔄 Verifying SMTP connection...')
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (smtpError) {
      console.error('❌ SMTP verification failed:', smtpError)
      throw smtpError
    }

    console.log('📤 Sending confirmation email to applicant...')
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: formData.email,
      subject: 'Application Received - Heubert\'s Job Ready Program',
      html: `
        <h1>Thank you for your application!</h1>
        <p>Dear ${formData.name},</p>
        <p>We have received your application for the ${formData.selectedCourse} course.</p>
        <p>Our team will review your application and contact you shortly.</p>
        <p>If you require any assistance in the meantime, please contact us at info@heubert.com or call us on 02 8315 7777.</p>
        <br/>
        <p>Best regards,</p>
        <p>Heubert Team</p>
      `,
    })
    console.log('✅ Applicant confirmation email sent successfully')

    console.log('📤 Sending notification email to admin...')
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Course Application Received - ' + formData.name,
      html: `
        <h1>New Application Received</h1>
        
        <h2>Personal Details</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.email}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.phone}</td>
          </tr>
        </table>

        <h2>Address</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Street Address:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.streetAddress}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>City:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.city}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>State:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              STATES[formData.state.toLowerCase() as StateCode] || formData.state
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Postcode:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.postcode}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Country:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              formData.country === 'other'
                ? formData.otherCountry
                : (COUNTRIES[formData.country.toLowerCase() as CountryCode] || formData.country)
            }</td>
          </tr>
        </table>

        <h2>Education & Experience</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Education Level:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              EDUCATION_LEVELS[formData.education as EducationLevel] || formData.education
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Field of Study:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.fieldOfStudy}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Institution:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.institution}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>IT Experience:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.hasITExperience === 'yes' ? 'Yes' : 'No'}</td>
          </tr>
          ${formData.hasITExperience === 'yes' ? `
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Years of Experience:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.yearsOfExperience} years</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Current/Recent Job:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.currentJob}</td>
          </tr>
          ` : ''}
        </table>

        <h2>Course Details</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Selected Course:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              COURSES[formData.selectedCourse as CourseCode] || formData.selectedCourse
            }</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Intake Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(formData.intake).toLocaleDateString('en-US', { 
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Referrer:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.referrer || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Application Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(formData.submittedAt).toLocaleString()}</td>
          </tr>
        </table>

        <h2>Agreements</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Accepted False Info Terms:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.acceptFalseInfo ? 'Yes' : 'No'}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Accepted T&Cs:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.acceptTerms ? 'Yes' : 'No'}</td>
          </tr>
        </table>
      `,
    })
    console.log('✅ Admin notification email sent successfully')

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Error during submission:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process application' },
      { status: 500 }
    )
  }
}

