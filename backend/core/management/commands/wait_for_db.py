from django.core.management.base import BaseCommand
from django.db import connection
from django.db.utils import OperationalError
import time

class Command(BaseCommand):
    """Django command to wait for database"""
    
    def handle(self, *args, **options):
        self.stdout.write('Waiting for database...')
        db_conn = False
        max_retries = 30
        
        while not db_conn and max_retries > 0:
            try:
                connection.ensure_connection()
                db_conn = True
            except OperationalError:
                self.stdout.write('Database unavailable, waiting 2 seconds...')
                time.sleep(2)
                max_retries -= 1
        
        if db_conn:
            self.stdout.write(self.style.SUCCESS('Database available!'))
        else:
            self.stdout.write(self.style.ERROR('Database connection failed!'))
            exit(1)
