import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const formData = req.body
    console.log('Received form data:', formData)

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Send email to applicant
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

    // Send email to admin
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
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.state.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Postcode:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.postcode}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Country:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.country.toUpperCase()}</td>
          </tr>
        </table>

        <h2>Education & Experience</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Education Level:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.education}</td>
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
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.hasITExperience.toUpperCase()}</td>
          </tr>
        </table>

        <h2>Course Details</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Selected Course:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.selectedCourse}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Intake Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(formData.intake).toLocaleDateString()}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Referrer:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${formData.referrer}</td>
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

    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to process application' 
    })
  }
}
