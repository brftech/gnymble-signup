# Scripts Directory

This directory contains various utility scripts for testing, checking, and fixing the Gnymble signup application.

## Directory Structure

### `/tests`
Contains test scripts for various functionality:
- `test-tcr-*.js` - TCR (The Campaign Registry) API integration tests
- `test-dashboard-*.js` - Dashboard functionality tests
- `test-webhook-*.js` - Webhook and payment integration tests
- `test-admin-*.js` - Admin panel access and functionality tests

### `/checks`
Contains scripts to verify data and system state:
- `check-admin-views.js` - Verify admin database views exist
- `check-brand-data.js` - Check TCR brand registration data
- `check-customers.js` - Verify customer records

### `/sql-fixes`
Contains SQL scripts and JS files for database fixes:
- `*.sql` - Direct SQL scripts to run in Supabase SQL editor
- `fix-*.js` - JavaScript files that help generate or execute fixes
- `setup-admin-access.sql` - Grant superadmin access to users

## Usage

### Running JavaScript test/check scripts:
```bash
node scripts/tests/test-tcr-direct-api.js
node scripts/checks/check-brand-data.js
```

### SQL scripts:
Copy the contents and run in your Supabase SQL editor.

## Important Notes

- Most test scripts require proper environment setup
- Some scripts need authentication (won't work with just anon key)
- SQL scripts should be reviewed before running in production
- These scripts were created during development and debugging

## Cleanup

These scripts are kept for reference but can be safely deleted once the application is stable in production.