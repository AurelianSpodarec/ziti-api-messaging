-- Create the 'messages_api' database
CREATE DATABASE messages_api
WITH OWNER = messages
ENCODING = 'UTF8'
LC_COLLATE = 'en_US.utf8'
LC_CTYPE = 'en_US.utf8'
TEMPLATE template0;

-- Grant privileges to the user 'messages'
GRANT ALL PRIVILEGES ON DATABASE messages_api TO messages;

-- Connect to the 'messages_api' database
\c messages_api;

-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Quit the psql client
\q
