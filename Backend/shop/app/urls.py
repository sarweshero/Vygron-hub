from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"products", views.ProductViewSet,     basename="product")
router.register(r"orders",   views.OrderViewSet,       basename="order")
router.register(r"my-shop/products", views.MyShopProductViewSet, basename="my-shop-products")

urlpatterns = [
    path("",               include(router.urls)),
    path("dashboard/",     views.dashboard,       name="dashboard"),
    path("admin/login/",   views.admin_login,     name="admin-login"),
    # User auth
    path("auth/register/", views.user_register,   name="user-register"),
    path("auth/shop-register/", views.shop_register, name="shop-register"),
    path("auth/login/",    views.user_login,      name="user-login"),
    path("auth/profile/",  views.user_profile,    name="user-profile"),
    path("auth/orders/",   views.user_orders,     name="user-orders"),
    path("auth/change-password/", views.user_change_password, name="user-change-password"),
    path("shop/dashboard/", views.shop_dashboard, name="shop-dashboard"),
    path("shop/details/", views.update_user_shop, name="shop-update"),
    path("upload/", views.upload_image, name="upload-image"),
    path("shops/", views.get_public_shops, name="public-shops"),
    path("shops/<slug:slug>/", views.get_shop_details, name="shop-details"),
    path('admin/shops/', views.get_admin_shops, name="admin-shops"),
    path('admin/shops/<int:pk>/approve/', views.approve_shop, name="approve-shop"),
    path('admin/shops/<int:pk>/deactivate/', views.deactivate_shop, name="deactivate-shop"),
    path('admin/shops/<int:pk>/', views.delete_shop, name="delete-shop"),
    path('guest-order/', views.create_guest_order, name="guest-order"),
]
