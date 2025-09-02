-- Initialize the database with extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created automatically by Prisma, but good to have as reference

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE axs_mobile TO axs_user;
