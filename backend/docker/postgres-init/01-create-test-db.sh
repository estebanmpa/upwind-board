#!/bin/sh
# Creates the database used by the e2e tests next to the development one.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
  CREATE DATABASE ${POSTGRES_DB}_test OWNER "$POSTGRES_USER";
SQL
