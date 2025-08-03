// Validation utilities for onboarding form
// This prevents TCR validation errors by validating on the client side first

// State mapping from full names to 2-letter codes
const STATE_MAPPING: Record<string, string> = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY',
  'District of Columbia': 'DC',
  'American Samoa': 'AS',
  'Guam': 'GU',
  'Northern Mariana Islands': 'MP',
  'Puerto Rico': 'PR',
  'U.S. Virgin Islands': 'VI',
};

// EIN validation and formatting
export function validateAndFormatEIN(ein: string): { isValid: boolean; formatted: string; error?: string } {
  // Remove all non-digits
  const digitsOnly = ein.replace(/\D/g, '');
  
  // Check if it's exactly 9 digits
  if (digitsOnly.length !== 9) {
    return {
      isValid: false,
      formatted: ein,
      error: 'EIN must be exactly 9 digits'
    };
  }
  
  // Format as XX-XXXXXXX
  const formatted = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
  
  return {
    isValid: true,
    formatted
  };
}

// State validation and conversion
export function validateAndFormatState(state: string): { isValid: boolean; formatted: string; error?: string } {
  // If it's already a 2-letter code, validate it
  if (state.length === 2) {
    const isValidCode = Object.values(STATE_MAPPING).includes(state.toUpperCase());
    if (isValidCode) {
      return {
        isValid: true,
        formatted: state.toUpperCase()
      };
    } else {
      return {
        isValid: false,
        formatted: state,
        error: 'Invalid 2-letter state code'
      };
    }
  }
  
  // Try to convert full name to 2-letter code
  const code = STATE_MAPPING[state];
  if (code) {
    return {
      isValid: true,
      formatted: code
    };
  }
  
  return {
    isValid: false,
    formatted: state,
    error: 'Invalid state name or code'
  };
}

// Phone number validation and formatting
export function validateAndFormatPhone(phone: string): { isValid: boolean; formatted: string; error?: string } {
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it's a valid US phone number (10 or 11 digits)
  if (digitsOnly.length === 10) {
    // Format as +1XXXXXXXXXX
    const formatted = `+1${digitsOnly}`;
    return {
      isValid: true,
      formatted
    };
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    // Format as +XXXXXXXXXXX
    const formatted = `+${digitsOnly}`;
    return {
      isValid: true,
      formatted
    };
  } else if (phone.startsWith('+') && (phone.length === 12 || phone.length === 13)) {
    // Already formatted correctly
    return {
      isValid: true,
      formatted: phone
    };
  }
  
  return {
    isValid: false,
    formatted: phone,
    error: 'Phone number must be 10 digits (US) or valid international format'
  };
}

// Email validation
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }
  
  return {
    isValid: true
  };
}

// Website validation and formatting
export function validateAndFormatWebsite(website: string): { isValid: boolean; formatted: string; error?: string } {
  if (!website) {
    return {
      isValid: false,
      formatted: website,
      error: 'Website is required'
    };
  }
  
  let formatted = website;
  
  // Add https:// if no protocol specified
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `https://${formatted}`;
  }
  
  // Basic URL validation
  try {
    new URL(formatted);
    return {
      isValid: true,
      formatted
    };
  } catch {
    return {
      isValid: false,
      formatted: website,
      error: 'Invalid website URL'
    };
  }
}

// Comprehensive form validation
export function validateOnboardingForm(formData: Record<string, string | undefined>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Required fields
  const requiredFields = [
    'legal_company_name',
    'country_of_registration',
    'tax_number_ein',
    'address_street',
    'city',
    'state_region',
    'postal_code',
    'country',
    'website',
    'legal_form',
    'vertical_type',
    'business_phone',
    'point_of_contact_email',
    'first_name',
    'last_name'
  ];
  
  for (const field of requiredFields) {
    if (!formData[field]?.trim()) {
      errors[field] = `${field.replace(/_/g, ' ')} is required`;
    }
  }
  
  // EIN validation
  if (formData.tax_number_ein) {
    const einValidation = validateAndFormatEIN(formData.tax_number_ein);
    if (!einValidation.isValid) {
      errors.tax_number_ein = einValidation.error || 'Invalid EIN format';
    }
  }
  
  // State validation
  if (formData.state_region) {
    const stateValidation = validateAndFormatState(formData.state_region);
    if (!stateValidation.isValid) {
      errors.state_region = stateValidation.error || 'Invalid state';
    }
  }
  
  // Phone validation
  if (formData.business_phone) {
    const phoneValidation = validateAndFormatPhone(formData.business_phone);
    if (!phoneValidation.isValid) {
      errors.business_phone = phoneValidation.error || 'Invalid phone number';
    }
  }
  
  // Email validation
  if (formData.point_of_contact_email) {
    const emailValidation = validateEmail(formData.point_of_contact_email);
    if (!emailValidation.isValid) {
      errors.point_of_contact_email = emailValidation.error || 'Invalid email';
    }
  }
  
  // Website validation
  if (formData.website) {
    const websiteValidation = validateAndFormatWebsite(formData.website);
    if (!websiteValidation.isValid) {
      errors.website = websiteValidation.error || 'Invalid website';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 