from django.urls import path
from .views import RegisterView, UserDetailView, LoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='user-register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('login/', LoginView.as_view(), name='user-login'),
    # API mirrors for frontend clarity
    path('api/register/', RegisterView.as_view(), name='api-user-register'),
    path('api/me/', UserDetailView.as_view(), name='api-user-detail'),
]
