#!/bin/bash
# Script to dump Supabase database and load to local PostgreSQL
# Usage: ./dump_supabase.sh [action]
# Actions: dump (default), load, both

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
SHOP_DIR="$BACKEND_DIR/shop"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Virtual environment
VENV_DIR="$BACKEND_DIR/.venv"
PYTHON="$VENV_DIR/bin/python3"

# Default .env for Supabase (remote)
SUPABASE_ENV="$SHOP_DIR/.env.supabase"

# Check if .env.supabase exists, if not create from .env
if [ ! -f "$SUPABASE_ENV" ]; then
    print_warning ".env.supabase not found. Creating from .env..."
    cp "$SHOP_DIR/.env" "$SUPABASE_ENV"
    # Ensure it points to Supabase
    sed -i 's/DB_HOST=.*/DB_HOST=db.tclpqniklxbznowwrpmy.supabase.co/' "$SUPABASE_ENV"
    print_status "Created .env.supabase"
fi

# Local PostgreSQL configuration
LOCAL_DB_NAME="${LOCAL_DB_NAME:-vygron}"
LOCAL_DB_USER="${LOCAL_DB_USER:-postgres}"
LOCAL_DB_HOST="${LOCAL_DB_HOST:-localhost}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-5432}"

dump_supabase() {
    print_status "Dumping from Supabase..."
    
    cd "$SHOP_DIR"
    
    # Use .env.supabase for Supabase connection
    export $(grep -v '^#' "$SUPABASE_ENV" | xargs)
    
    # Run Django dumpdata
    $PYTHON manage.py dump_db --output "$SHOP_DIR/supabase_dump.json"
    
    print_status "Dump saved to: $SHOP_DIR/supabase_dump.json"
}

load_to_local() {
    print_status "Loading to local PostgreSQL..."
    
    cd "$SHOP_DIR"
    
    # Check if local database exists, create if not
    PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$LOCAL_DB_HOST" -U "$LOCAL_DB_USER" -p "$LOCAL_DB_PORT" -tc \
        "SELECT 1 FROM pg_database WHERE datname='$LOCAL_DB_NAME'" | grep -q 1 || \
        PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$LOCAL_DB_HOST" -U "$LOCAL_DB_USER" -p "$LOCAL_DB_PORT" -c \
        "CREATE DATABASE $LOCAL_DB_NAME"
    
    # Set local database environment
    export DB_NAME="$LOCAL_DB_NAME"
    export DB_USER="$LOCAL_DB_USER"
    export DB_HOST="$LOCAL_DB_HOST"
    export DB_PORT="$LOCAL_DB_PORT"
    
    # Run Django migrations
    $PYTHON manage.py migrate
    
    # Load data
    if [ -f "$SHOP_DIR/supabase_dump.json" ]; then
        $PYTHON manage.py load_db "$SHOP_DIR/supabase_dump.json" --clear
        print_status "Data loaded successfully"
    else
        print_error "No dump file found. Run 'dump' first."
        exit 1
    fi
}

usage() {
    echo "Usage: $0 [action]"
    echo ""
    echo "Actions:"
    echo "  dump    - Dump Supabase database to JSON file (default)"
    echo "  load    - Load JSON dump to local PostgreSQL"
    echo "  both    - Dump from Supabase and load to local"
    echo ""
    echo "Environment variables:"
    echo "  LOCAL_DB_NAME  - Local database name (default: vygron)"
    echo "  LOCAL_DB_USER  - Local database user (default: postgres)"
    echo "  LOCAL_DB_HOST  - Local database host (default: localhost)"
    echo "  LOCAL_DB_PORT  - Local database port (default: 5432)"
}

ACTION="${1:-dump}"

case $ACTION in
    dump)
        dump_supabase
        ;;
    load)
        load_to_local
        ;;
    both)
        dump_supabase
        load_to_local
        ;;
    *)
        print_error "Unknown action: $ACTION"
        usage
        exit 1
        ;;
esac

print_status "Done!"
