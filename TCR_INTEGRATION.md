# The Campaign Registry (TCR) Integration

## Overview

This document describes the integration with The Campaign Registry (TCR) API for brand verification and campaign approval in the Gnymble SMS platform.

## API Configuration

### Staging Environment

- **Base URL**: `https://csp-api-staging.campaignregistry.com/v2`
- **API Key**: `AA36CC19C3454EFC8937E7407329FB9F`
- **Secret**: `7456068D62D049C8A72FC32352D8F792`

### Authentication

The TCR API uses Basic Authentication with the API key and secret:

```
Authorization: Basic <base64(API_KEY:API_SECRET)>
```

## Integration Points

### 1. Brand Verification

**Endpoint**: `POST /brands`

**Process**:

1. User completes onboarding form
2. Form data is transformed to TCR format
3. Brand verification request sent to TCR
4. TCR response stored in database
5. Company record updated with TCR brand ID

**Key Fields Mapped**:

- `legal_company_name` → `brandName`
- `dba_brand_name` → `dbaName`
- `country_of_registration` → `countryOfRegistration`
- `tax_number_ein` → `taxNumber`
- `address_street`, `city`, `state_region`, `postal_code`, `country` → `address`
- `website` → `website`
- `vertical_type` → `verticalType` (mapped to TCR standards)
- `legal_form` → `legalForm` (mapped to TCR standards)
- `business_phone` → `businessPhone`
- `first_name`, `last_name`, `point_of_contact_email`, `mobile_phone` → `pointOfContact`

### 2. Campaign Approval

**Endpoint**: `POST /campaigns`

**Process**:

1. Brand verification must be completed first
2. Campaign data is transformed to TCR format
3. Campaign approval request sent to TCR
4. TCR response stored in database
5. Campaign record created with TCR campaign ID

**Key Fields Mapped**:

- `brandId` → From previous brand verification
- `campaignName` → Generated from company name
- `description` → Default description
- `useCase` → "General business communications"
- `verticalType` → Mapped from company vertical
- `referenceId` → Optional field from form
- `dunsGiinLei` → Optional field from form

## Data Transformation

### Vertical Type Mapping

Our internal vertical types are mapped to TCR standards:

| Internal Type  | TCR Type                       |
| -------------- | ------------------------------ |
| `CIGAR_RETAIL` | `RETAIL_AND_CONSUMER_PRODUCTS` |
| `SPEAKEASY`    | `FOOD_AND_BEVERAGE`            |
| `RESTAURANT`   | `FOOD_AND_BEVERAGE`            |
| `BAR`          | `FOOD_AND_BEVERAGE`            |
| `LOUNGE`       | `FOOD_AND_BEVERAGE`            |
| `OTHER`        | `OTHER`                        |

### Legal Form Mapping

Our internal legal forms are mapped to TCR standards:

| Internal Form    | TCR Form         |
| ---------------- | ---------------- |
| `PRIVATE_PROFIT` | `PRIVATE_PROFIT` |
| `PUBLIC_PROFIT`  | `PUBLIC_PROFIT`  |
| `NON_PROFIT`     | `NON_PROFIT`     |
| `GOVERNMENT`     | `GOVERNMENT`     |

## API Functions

### Core Functions

- `submitBrandVerification(brandData)` - Submit brand for verification
- `submitCampaignApproval(campaignData)` - Submit campaign for approval
- `checkBrandStatus(brandId)` - Check brand verification status
- `checkCampaignStatus(campaignId)` - Check campaign approval status

### Helper Functions

- `transformOnboardingDataToTCR(onboardingData)` - Transform form data to TCR format
- `getAuthHeaders()` - Generate authentication headers
- `mapVerticalType(verticalType)` - Map vertical types
- `mapLegalForm(legalForm)` - Map legal forms

## Response Handling

### Brand Verification Response

```typescript
{
  brandId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  errors?: string[];
}
```

### Campaign Approval Response

```typescript
{
  campaignId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  errors?: string[];
}
```

## Database Integration

### Tables Updated

1. **companies** - Updated with `tcr_brand_id` and verification status
2. **brands** - Created with TCR brand ID
3. **campaigns** - Created with TCR campaign ID
4. **onboarding_submissions** - Updated with TCR IDs and status

### Status Tracking

- `pending` → Initial state
- `submitted` → Sent to TCR
- `approved` → TCR approval successful
- `rejected` → TCR approval failed

## Error Handling

### API Errors

- Network errors are caught and logged
- HTTP error responses include status and message
- TCR-specific errors are preserved in response

### Validation Errors

- Required fields are validated before submission
- Data transformation errors are caught
- User-friendly error messages displayed

## Testing

### Staging Environment

- Use staging credentials for testing
- Real API responses from TCR staging
- No production data affected

### Test Data

- Use realistic company information
- Test various vertical types and legal forms
- Verify error handling with invalid data

## Production Considerations

### Environment Variables

- Move credentials to environment variables
- Use production TCR endpoints
- Implement proper secret management

### Rate Limiting

- Monitor API usage
- Implement retry logic
- Handle rate limit errors gracefully

### Monitoring

- Log all API calls and responses
- Track success/failure rates
- Monitor response times

## Future Enhancements

1. **Status Polling** - Automatically check TCR status
2. **Webhook Integration** - Receive real-time status updates
3. **Bulk Operations** - Process multiple brands/campaigns
4. **Advanced Error Handling** - Retry failed submissions
5. **Analytics Dashboard** - Track TCR performance metrics
