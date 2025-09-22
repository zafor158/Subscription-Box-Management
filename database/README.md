# Database Documentation

This directory contains the database schema and sample data for the Subscription Box Management Platform.

## Files

- `schema.sql` - Complete database schema with all tables, indexes, and default data
- `sample_data.sql` - Sample data for testing the application
- `README.md` - This documentation file

## Database Structure

### Tables

1. **users** - User accounts and authentication
2. **subscription_plans** - Available subscription plans
3. **subscriptions** - User subscriptions
4. **payments** - Payment history
5. **box_history** - Delivery history

### Relationships

- `subscriptions.user_id` → `users.id`
- `subscriptions.plan_id` → `subscription_plans.id`
- `payments.user_id` → `users.id`
- `payments.subscription_id` → `subscriptions.id`
- `box_history.user_id` → `users.id`
- `box_history.subscription_id` → `subscriptions.id`

## Usage

### Manual Setup

If you want to set up the database manually:

1. Connect to your PostgreSQL database
2. Run the schema file:
   ```sql
   \i database/schema.sql
   ```
3. (Optional) Add sample data:
   ```sql
   \i database/sample_data.sql
   ```

### Automatic Setup

The application automatically runs migrations on startup. The same SQL commands are executed from `server/config/database.js`.

## Sample Data

The sample data includes:
- 3 test users (password: `password123`)
- 3 subscription plans (Basic, Premium, Deluxe)
- Sample subscriptions and payments
- Box delivery history

## Notes

- All tables use `SERIAL` primary keys
- Foreign key constraints ensure data integrity
- Indexes are created for performance optimization
- JSONB fields are used for flexible data storage (features, items)
- Timestamps are automatically managed
