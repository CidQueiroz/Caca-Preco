import time
import os
import django
from django.db import connection
from django.db.utils import OperationalError

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def wait_for_db():
    """Wait for database to be available"""
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            connection.ensure_connection()
            print("✅ Database is ready!")
            return True
        except OperationalError:
            retry_count += 1
            print(f"⏳ Waiting for database... ({retry_count}/{max_retries})")
            time.sleep(2)
    
    print("❌ Database connection failed!")
    return False

if __name__ == "__main__":
    wait_for_db()
