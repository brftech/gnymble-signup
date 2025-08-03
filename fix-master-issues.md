# Fixes for Master Branch Issues

## 1. Clean Files Before Merge
No files need to be deleted. The branches are clean.

## 2. Fix Home Page Scrolling Issue

Add this to the home page to ensure proper scroll behavior on refresh:

```typescript
// Add to src/pages/home.tsx at the top of the component
useEffect(() => {
  // Scroll to top on component mount
  window.scrollTo(0, 0);
}, []);
```

## 3. Fix TCR Submission Issue

The master branch is missing the validation imports and formatting. Here's the fix:

### Step 1: Create validation.ts file
```typescript
// src/lib/validation.ts
// Copy the validation.ts from the feature branch - it has all the formatting functions
```

### Step 2: Update tcrApi.ts imports
```typescript
// At the top of src/lib/tcrApi.ts
import { 
  validateAndFormatEIN, 
  validateAndFormatState, 
  validateAndFormatPhone, 
  validateAndFormatWebsite 
} from './validation';
```

### Step 3: Update transformOnboardingDataToTCR function
Replace the current simple mapping with the validated version:

```typescript
export function transformOnboardingDataToTCR(onboardingData: {
  // ... parameters
}): {
  brandRequest: TCRBrandRequest;
  campaignRequest: TCRCampaignRequest;
} {
  // Format and validate data before sending to TCR
  const einValidation = validateAndFormatEIN(onboardingData.tax_number_ein);
  const stateValidation = validateAndFormatState(onboardingData.state_region);
  const phoneValidation = validateAndFormatPhone(onboardingData.business_phone);
  const websiteValidation = validateAndFormatWebsite(onboardingData.website || '');
  
  // Throw errors if validation fails
  if (!einValidation.isValid) {
    throw new Error(`EIN validation failed: ${einValidation.error}`);
  }
  if (!stateValidation.isValid) {
    throw new Error(`State validation failed: ${stateValidation.error}`);
  }
  if (!phoneValidation.isValid) {
    throw new Error(`Phone validation failed: ${phoneValidation.error}`);
  }
  if (!websiteValidation.isValid) {
    throw new Error(`Website validation failed: ${websiteValidation.error}`);
  }
  
  const brandRequest: TCRBrandRequest = {
    brandName: onboardingData.legal_company_name,
    dbaName: onboardingData.dba_brand_name || "",
    countryOfRegistration: onboardingData.country_of_registration || "US",
    taxNumber: einValidation.formatted, // Use formatted EIN
    taxIssuingCountry: onboardingData.tax_issuing_country || "US",
    address: {
      street: onboardingData.address_street,
      city: onboardingData.city,
      stateRegion: stateValidation.formatted, // Use formatted state code
      postalCode: onboardingData.postal_code,
      country: onboardingData.country || "United States",
    },
    website: websiteValidation.formatted, // Use formatted website
    verticalType: onboardingData.vertical_type || "RETAIL_AND_CONSUMER_PRODUCTS",
    legalForm: onboardingData.legal_form || "PRIVATE_PROFIT",
    businessPhone: phoneValidation.formatted, // Use formatted phone
    pointOfContact: {
      firstName: onboardingData.first_name,
      lastName: onboardingData.last_name,
      email: onboardingData.support_email || onboardingData.point_of_contact_email || "",
      phone: phoneValidation.formatted, // Use formatted phone
    },
  };

  // ... rest of the function
}
```

## Summary
The main issue is that the master branch doesn't have the validation/formatting functions that TCR requires. The data needs to be:
- EIN: Formatted as XX-XXXXXXX
- State: Converted to 2-letter code (e.g., "California" → "CA")
- Phone: Formatted as +1XXXXXXXXXX
- Website: Must have https:// prefix

Without these transformations, TCR rejects the submission.