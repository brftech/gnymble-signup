# Gnymble Database Structure

## Overview

This document describes the comprehensive database structure for tracking companies, brands, campaigns, and phone numbers in the Gnymble SMS platform.

## Database Schema

### 1. Companies Table (`public.companies`)

**Purpose**: Store comprehensive company information for TCR compliance

**Key Fields**:

- `id` (UUID): Primary key
- `name` (TEXT): Company display name
- `legal_company_name` (TEXT): Legal business name
- `dba_brand_name` (TEXT): Doing Business As name
- `country_of_registration` (TEXT): Country where company is registered
- `tax_number_ein` (TEXT): Tax ID or EIN
- `address_street`, `city`, `state_region`, `postal_code`, `country` (TEXT): Full address
- `website` (TEXT): Company website
- `vertical_type` (TEXT): Business vertical (e.g., CIGAR_RETAIL, SPEAKEASY)
- `legal_form` (TEXT): Legal structure (e.g., PRIVATE_PROFIT, PUBLIC_PROFIT)
- `business_phone` (TEXT): Company phone number
- `point_of_contact_email` (TEXT): Primary contact email
- `tcr_brand_id` (TEXT): The Campaign Registry brand ID
- `brand_verification_status` (TEXT): pending, submitted, approved, rejected
- `brand_verification_date` (TIMESTAMP): When verification was completed

### 2. Brands Table (`public.brands`)

**Purpose**: Track multiple brands per company

**Key Fields**:

- `id` (UUID): Primary key
- `company_id` (UUID): Foreign key to companies table
- `brand_name` (TEXT): Brand name
- `dba_name` (TEXT): DBA name for this brand
- `description` (TEXT): Brand description
- `vertical_type` (TEXT): Brand-specific vertical
- `tcr_brand_id` (TEXT): TCR brand ID
- `brand_verification_status` (TEXT): Verification status
- `brand_verification_date` (TIMESTAMP): Verification completion date

**Relationships**:

- One company can have multiple brands
- Each brand belongs to one company

### 3. Campaigns Table (`public.campaigns`)

**Purpose**: Track SMS campaigns for each brand

**Key Fields**:

- `id` (UUID): Primary key
- `brand_id` (UUID): Foreign key to brands table
- `campaign_name` (TEXT): Campaign name
- `description` (TEXT): Campaign description
- `use_case` (TEXT): SMS use case description
- `tcr_campaign_id` (TEXT): TCR campaign ID
- `campaign_approval_status` (TEXT): Approval status
- `campaign_approval_date` (TIMESTAMP): Approval completion date

**Relationships**:

- One brand can have multiple campaigns
- Each campaign belongs to one brand

### 4. Phone Numbers Table (`public.phone_numbers`)

**Purpose**: Track purchased phone numbers

**Key Fields**:

- `id` (UUID): Primary key
- `phone_number` (TEXT): The actual phone number
- `country_code` (TEXT): Country code (default: US)
- `area_code` (TEXT): Area code
- `phone_type` (TEXT): local, toll-free, international
- `status` (TEXT): available, assigned, suspended, deactivated
- `twilio_sid` (TEXT): Twilio account SID
- `twilio_phone_sid` (TEXT): Twilio phone number SID
- `purchase_date` (TIMESTAMP): When number was purchased
- `monthly_cost` (DECIMAL): Monthly cost for the number

### 5. Campaign Phone Assignments Table (`public.campaign_phone_assignments`)

**Purpose**: Many-to-many relationship between campaigns and phone numbers

**Key Fields**:

- `id` (UUID): Primary key
- `campaign_id` (UUID): Foreign key to campaigns table
- `phone_number_id` (UUID): Foreign key to phone_numbers table
- `assigned_date` (TIMESTAMP): When assignment was made
- `status` (TEXT): active, inactive, suspended

**Relationships**:

- Many-to-many between campaigns and phone numbers
- One campaign can use multiple phone numbers
- One phone number can be used by multiple campaigns

### 6. Onboarding Submissions Table (`public.onboarding_submissions`)

**Purpose**: Track onboarding form submissions

**Key Fields**:

- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to auth.users
- `company_id` (UUID): Foreign key to companies table
- `submission_data` (JSONB): Complete form submission data
- `status` (TEXT): submitted, processing, approved, rejected
- `tcr_brand_id` (TEXT): TCR brand ID after processing
- `tcr_campaign_id` (TEXT): TCR campaign ID after processing
- `submitted_at` (TIMESTAMP): Submission timestamp
- `processed_at` (TIMESTAMP): Processing completion timestamp

## Data Flow

### 1. User Registration

1. User signs up → `profiles` table created
2. Company created → `companies` table
3. User linked to company → `user_company_roles` table

### 2. Onboarding Process

1. User completes onboarding form → `onboarding_submissions` table
2. Company data updated → `companies` table
3. Brand created → `brands` table
4. Default campaign created → `campaigns` table
5. Status updated to "approved"

### 3. Phone Number Management

1. Admin purchases phone numbers → `phone_numbers` table
2. Phone numbers assigned to campaigns → `campaign_phone_assignments` table
3. Status tracked throughout lifecycle

## Security & Access Control

### Row Level Security (RLS)

- **Companies**: Users can only access their own companies
- **Brands**: Users can access brands for their companies
- **Campaigns**: Users can access campaigns for their brands
- **Phone Numbers**: Admin-only access
- **Assignments**: Users can manage assignments for their campaigns
- **Submissions**: Users can only access their own submissions

### Helper Functions

- `get_user_companies(user_uuid)`: Get all companies for a user
- `get_company_brands(company_uuid)`: Get all brands for a company
- `get_brand_campaigns(brand_uuid)`: Get all campaigns for a brand

## Indexes for Performance

- TCR IDs for fast lookups
- Status fields for filtering
- Foreign key relationships
- User and company associations

## Status Workflows

### Brand Verification Status

1. `pending` → Initial state
2. `submitted` → Onboarding form submitted
3. `approved` → TCR verification successful
4. `rejected` → TCR verification failed

### Campaign Approval Status

1. `pending` → Initial state
2. `submitted` → Campaign submitted to TCR
3. `approved` → TCR approval successful
4. `rejected` → TCR approval failed

### Phone Number Status

1. `available` → Ready for assignment
2. `assigned` → Currently assigned to campaign
3. `suspended` → Temporarily suspended
4. `deactivated` → Permanently deactivated

## Integration Points

### The Campaign Registry (TCR)

- `tcr_brand_id`: Links to TCR brand records
- `tcr_campaign_id`: Links to TCR campaign records
- Status fields track TCR approval process

### Twilio Integration

- `twilio_sid`: Twilio account identifier
- `twilio_phone_sid`: Twilio phone number identifier
- Enables programmatic phone number management

## Future Enhancements

1. **Multi-tenant support**: Enhanced company isolation
2. **Audit logging**: Track all changes to records
3. **Bulk operations**: Import/export functionality
4. **Advanced reporting**: Analytics and insights
5. **API rate limiting**: Protect against abuse
