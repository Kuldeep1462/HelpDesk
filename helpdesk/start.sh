#!/bin/bash
python manage.py migrate
python manage.py collectstatic --noinput

python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
if not User.objects.filter(username='Admin12').exists():
    user = User.objects.create_user(username='Admin12', email='admin@gmail.com', password='admin@123')
    user.role = 'admin'
    user.save()
if not User.objects.filter(username='agent12').exists():
    user = User.objects.create_user(username='agent12', email='agent@gmail.com', password='agent@123')
    user.role = 'agent'
    user.save()
"
python manage.py runserver 0.0.0.0:$PORT
