'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface FormData {
  name?: string;
  email?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postcode?: string;
  education?: string;
  fieldOfStudy?: string;
  institution?: string;
  country?: string;
  otherCountry?: string;
  hasITExperience?: string;
  yearsOfExperience?: string;
  currentJob?: string;
  selectedCourse?: string;
  intake?: string;
  referrer?: string;
  acceptFalseInfo?: boolean;
  acceptTerms?: boolean;
}

interface StepProps {
  formData: FormData;
  handleInputChange: (name: string, value: string | boolean) => void;
  errors?: Record<string, string>;
}

const steps = [
  { title: 'Personal Information', component: PersonalInfoStep },
  { title: 'Education', component: EducationStep },
  { title: 'Work Experience', component: WorkExperienceStep },
  { title: 'Course Selection', component: CourseSelectionStep },
  { title: 'Terms and Conditions', component: TermsAndConditionsStep },
]

export function OnboardingWizardComponent() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{9,10}$/
    return phoneRegex.test(phone)
  }

  const validatePostcode = (postcode: string) => {
    const postcodeRegex = /^\d{4}$/
    return postcodeRegex.test(postcode)
  }

  const isCurrentStepValid = () => {
    switch(currentStep) {
      case 0: // Personal Info
        const isEmailValid = formData.email?.trim() && validateEmail(formData.email)
        const isPhoneValid = formData.phone?.trim() && validatePhone(formData.phone)
        const isPostcodeValid = formData.postcode?.trim() && validatePostcode(formData.postcode)
        return formData.name?.trim() && isEmailValid && isPhoneValid && 
               formData.streetAddress?.trim() && formData.city?.trim() && 
               formData.state?.trim() && isPostcodeValid
      case 1: // Education
        return formData.education?.trim() && formData.fieldOfStudy?.trim() && formData.institution?.trim() && formData.country?.trim() && 
          (formData.country !== "other" || (formData.country === "other" && formData.otherCountry?.trim()))
      case 2: // Work Experience
        if (formData.hasITExperience === 'yes') {
          return formData.hasITExperience !== undefined && formData.yearsOfExperience && formData.currentJob?.trim()
        }
        return formData.hasITExperience !== undefined
      case 3: // Course Selection
        return formData.selectedCourse?.trim() && formData.intake?.trim()
      case 4: // Terms and Conditions
        return formData.acceptFalseInfo === true && formData.acceptTerms === true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    console.log('Starting submission process...')
    
    if (currentStep === steps.length - 1 && isCurrentStepValid()) {
      setIsSubmitting(true)

      try {
        const formDataToSend = {
          ...formData,
          submittedAt: new Date().toISOString(),
        }

        // Update to use Next.js API route instead of Firebase Function
        const response = await fetch('/api/submit-application', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataToSend),
        });

        console.log('Response status:', response.status);
        
        // Try to get response body even if it's an error
        let responseData;
        try {
          responseData = await response.json();
          console.log('Response data:', responseData);
        } catch (e) {
          console.log('Could not parse response as JSON:', e);
        }

        if (!response.ok) {
          throw new Error(responseData?.error || `Server returned ${response.status}`);
        }

        setIsSubmitted(true);
        setIsSubmitting(false);
        window.location.href = '/success.html';

      } catch (error) {
        console.error("Full error details:", error);
        setIsSubmitting(false);
        alert('Submission error: ' + (error instanceof Error ? error.message : 'Unknown error occurred'));
      }
    }
  }

  const handleNext = () => {
    console.log('Handle Next clicked')
    console.log('Current step:', currentStep)
    console.log('Steps length:', steps.length)
    console.log('Is current step valid?', isCurrentStepValid())

    if (currentStep < steps.length - 1 && isCurrentStepValid()) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === steps.length - 1) {
      console.log('On final step, attempting submission...')
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0 && !isSubmitted) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData({ ...formData, [name]: value })
    
    // Clear previous errors
    setErrors({ ...errors, [name]: '' })

    // Validate email and phone
    if (name === 'email' && typeof value === 'string' && value.trim() && !validateEmail(value)) {
      setErrors({ ...errors, email: 'Please enter a valid email address' })
    }
    if (name === 'phone' && typeof value === 'string' && value.trim() && !validatePhone(value)) {
      setErrors({ ...errors, phone: 'Please enter a valid moble number' })
    }
    if (name === 'postcode' && typeof value === 'string' && value.trim() && !validatePostcode(value)) {
      setErrors({ ...errors, postcode: 'Please enter a valid 4-digit postcode' })
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Heubert's Job Ready Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`w-1/6 h-2 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm font-medium text-center">{`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].title}`}</div>
          </div>
          <CurrentStepComponent formData={formData} handleInputChange={handleInputChange} errors={errors} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={handlePrevious} 
            disabled={currentStep === 0 || isSubmitting || isSubmitted}
          >
            Previous
          </Button>
          {!isSubmitted && (
            <Button 
              onClick={() => {
                console.log('Submit button clicked')
                handleNext()
              }} 
              disabled={(currentStep < steps.length - 1 && !isCurrentStepValid()) || isSubmitting}
            >
              {currentStep === steps.length - 1 ? (isSubmitting ? 'Submitting...' : 'I agree & submit') : 'Next'}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Logo below the form */}
      <div className="mt-6 mb-8 text-center">
        <img 
          src="logo.png" 
          alt="Heubert Logo" 
          className="h-8 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </div>
  )
}

function PersonalInfoStep({ formData, handleInputChange, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
          className={errors?.email ? 'border-red-500' : ''}
        />
        {errors?.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Mobile Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
          className={errors?.phone ? 'border-red-500' : ''}
          maxLength={10}
        />
        {errors?.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
      </div>
      <div>
        <Label htmlFor="street-address">Street Address *</Label>
        <Input
          id="street-address"
          value={formData.streetAddress || ''}
          onChange={(e) => handleInputChange('streetAddress', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="city">City/Suburb *</Label>
        <Input
          id="city"
          value={formData.city || ''}
          onChange={(e) => handleInputChange('city', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="state">State *</Label>
        <Select
          value={formData.state || ''}
          onValueChange={(value) => handleInputChange('state', value)}
          required
        >
          <SelectTrigger id="state">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nsw">New South Wales</SelectItem>
            <SelectItem value="vic">Victoria</SelectItem>
            <SelectItem value="qld">Queensland</SelectItem>
            <SelectItem value="wa">Western Australia</SelectItem>
            <SelectItem value="sa">South Australia</SelectItem>
            <SelectItem value="tas">Tasmania</SelectItem>
            <SelectItem value="act">Australian Capital Territory</SelectItem>
            <SelectItem value="nt">Northern Territory</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="postcode">Postcode *</Label>
        <Input
          id="postcode"
          value={formData.postcode || ''}
          onChange={(e) => handleInputChange('postcode', e.target.value)}
          required
          maxLength={4}
          className={errors?.postcode ? 'border-red-500' : ''}
        />
        {errors?.postcode && <p className="text-sm text-red-500 mt-1">{errors.postcode}</p>}
      </div>
    </div>
  )
}

function EducationStep({ formData, handleInputChange }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="education">Highest Level of Education *</Label>
        <Select
          value={formData.education || ''}
          onValueChange={(value) => handleInputChange('education', value)}
          required
        >
          <SelectTrigger id="education">
            <SelectValue placeholder="Select education level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high-school">High School</SelectItem>
            <SelectItem value="associate">Associate Degree (Diploma)</SelectItem>
            <SelectItem value="bachelor">Bachelor Degree</SelectItem>
            <SelectItem value="master">Master Degree</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="field-of-study">Course Name *</Label>
        <Input
          id="field-of-study"
          value={formData.fieldOfStudy || ''}
          onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="institution">Institution *</Label>
        <Input
          id="institution"
          value={formData.institution || ''}
          onChange={(e) => handleInputChange('institution', e.target.value)}
          required
          maxLength={50}
        />
      </div>
      <div>
        <Label htmlFor="country">Country *</Label>
        <Select
          value={formData.country || ''}
          onValueChange={(value) => handleInputChange('country', value)}
          required
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="np">Nepal</SelectItem>
            <SelectItem value="in">India</SelectItem>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.country === 'other' && (
        <div>
          <Label htmlFor="other-country">Please specify country *</Label>
          <Input
            id="other-country"
            value={formData.otherCountry || ''}
            onChange={(e) => handleInputChange('otherCountry', e.target.value)}
            required
            maxLength={50}
          />
        </div>
      )}
    </div>
  )
}

function WorkExperienceStep({ formData, handleInputChange }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Do you have experience in IT? *</Label>
        <RadioGroup
          value={formData.hasITExperience || ''}
          onValueChange={(value) => handleInputChange('hasITExperience', value)}
          required
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="it-exp-yes" />
            <Label htmlFor="it-exp-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="it-exp-no" />
            <Label htmlFor="it-exp-no">No</Label>
          </div>
        </RadioGroup>
      </div>
      {formData.hasITExperience === 'yes' && (
        <>
          <div>
            <Label htmlFor="years-of-experience">Years of Work Experience *</Label>
            <Input
              id="years-of-experience"
              type="number"
              value={formData.yearsOfExperience || ''}
              onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
              required
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="current-job">Current/Most Recent Job Title *</Label>
            <Input
              id="current-job"
              value={formData.currentJob || ''}
              onChange={(e) => handleInputChange('currentJob', e.target.value)}
              required
            />
          </div>
        </>
      )}
    </div>
  )
}

function CourseSelectionStep({ formData, handleInputChange }: StepProps) {
  const getNextNSundays = () => {
    const dates: Date[] = []
    const date = new Date()
    // Start from next Sunday
    const daysUntilNextSunday = 7 - date.getDay()
    date.setDate(date.getDate() + daysUntilNextSunday)
    
    while (dates.length < 10) {
      dates.push(new Date(date))
      date.setDate(date.getDate() + 7) // Add 7 days for next Sunday
    }
    return dates
  }

  const getNextNThursdays = () => {
    const dates: Date[] = []
    const date = new Date()
    // Start from next Thursday
    const daysUntilNextThursday = (4 + 7 - date.getDay()) % 7
    date.setDate(date.getDate() + daysUntilNextThursday)
    
    while (dates.length < 10) {
      dates.push(new Date(date))
      date.setDate(date.getDate() + 7) // Add 7 days for next Thursday
    }
    return dates
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const dates = formData.selectedCourse === 'cyber-security' ? 
    getNextNThursdays() : 
    getNextNSundays()

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="course">Course *</Label>
        <Select
          value={formData.selectedCourse || ''}
          onValueChange={(value) => handleInputChange('selectedCourse', value)}
          required
        >
          <SelectTrigger id="course">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="helpdesk-l1">IT Helpdesk Support (L1) - 6 weeks</SelectItem>
            <SelectItem value="support-l2">IT Support and Networking (L2) - 10 weeks</SelectItem>
            <SelectItem value="cyber-security">Cyber Security - 10 weeks</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.selectedCourse && (
        <div>
          <Label htmlFor="intake">Intake *</Label>
          <Select
            value={formData.intake || ''}
            onValueChange={(value) => handleInputChange('intake', value)}
            required
          >
            <SelectTrigger id="intake">
              <SelectValue>
                {formData.intake ? formatDate(new Date(formData.intake)) : "Select intake date"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {dates.map((date, index) => (
                <SelectItem key={index} value={date.toISOString()}>
                  {formatDate(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="referrer">Referrer (optional)</Label>
        <Input
          id="referrer"
          value={formData.referrer || ''}
          onChange={(e) => handleInputChange('referrer', e.target.value)}
          placeholder="How did you hear about us?"
        />
      </div>
    </div>
  )
}

function TermsAndConditionsStep({ formData, handleInputChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Terms and Conditions of Admission and Offer</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Course Completion Requirements</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pay full fees prior to the end date of the program</li>
            <li>At least 95% Attendance</li>
            <li>Successfully completed required projects in the course</li>
            <li>Collaborated with career coaching team regularly to apply for related jobs</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Refund and Fee Payment Policy</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Students need to pay at least first installment of the course fee before the course start date.</li>
            <li>Students who have enrolled in a course need to pay full fee by the end of course end date despite of their course completion.</li>
            <li>Students who enroll the course but do not complete their course also need to pay full fee by end of the course fee.</li>
            <li>Students will be able to receive refunds if any sessions are canceled by Heubert.</li>
            <li>Any non payment of fee at the specified date on offer letter will be reported to the debt collector.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Declaration *</h3>
        
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="false-info"
            checked={formData.acceptFalseInfo || false}
            onChange={(e) => handleInputChange('acceptFalseInfo', e.target.checked)}
            className="mt-1"
            required
          />
          <Label htmlFor="false-info" className="text-sm">
            I understand giving false or misleading information, including fraudulent documentation, is a serious offence under Australian law. 
            I understand that if I provide false or misleading information, it may invalidate all or any part of this agreement including termination of enrolment.
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={formData.acceptTerms || false}
            onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
            className="mt-1"
            required
          />
          <Label htmlFor="terms" className="text-sm">
            I declare that I have read the terms and conditions and refund policy of this application form and accept it.
          </Label>
        </div>
      </div>
    </div>
  )
}