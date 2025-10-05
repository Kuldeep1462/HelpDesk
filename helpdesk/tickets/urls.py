from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.ticket_list_view, name='ticket-list-create'),
    path('new/', views.ticket_create_view, name='ticket-create'),
    path('<int:pk>/', views.ticket_detail_view, name='ticket-detail'),
    path('api/', include('tickets.api_urls')),
]
