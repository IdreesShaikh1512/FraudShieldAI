-- PostgreSQL initialization script
-- Runs once when the container is first created

-- Create application role with restricted permissions
-- This role is used by the FastAPI app — it cannot UPDATE or DELETE audit_logs
CREATE ROLE fraudshield_app WITH LOGIN PASSWORD 'fraudshield_secret';
GRANT CONNECT ON DATABASE fraudshield TO fraudshield_app;
GRANT USAGE ON SCHEMA public TO fraudshield_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fraudshield_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fraudshield_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fraudshield_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO fraudshield_app;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
