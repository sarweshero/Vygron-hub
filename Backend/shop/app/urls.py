from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"products", views.ProductViewSet, basename="product")
router.register(r"orders",   views.OrderViewSet,   basename="order")

urlpatterns = [
    path("",               include(router.urls)),
    path("dashboard/",     views.dashboard,       name="dashboard"),
    path("admin/login/",   views.admin_login,     name="admin-login"),
    # User auth
    path("auth/register/", views.user_register,   name="user-register"),
    path("auth/login/",    views.user_login,      name="user-login"),
    path("auth/profile/",  views.user_profile,    name="user-profile"),
    path("auth/orders/",   views.user_orders,     name="user-orders"),
]
