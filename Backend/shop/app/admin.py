from django.contrib import admin
from .models import Product, Order, OrderItem, Shop, UserProfile


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display  = ("id", "name", "category", "price", "stock", "sold", "show_on_home", "is_new", "is_bestseller")
    list_filter   = ("category", "tag", "show_on_home", "is_new", "is_bestseller")
    search_fields = ("name", "fabric", "description")
    list_editable = ("price", "stock", "show_on_home")
    ordering      = ("-id",)


class OrderItemInline(admin.TabularInline):
    model  = OrderItem
    extra  = 0
    fields = ("name", "qty", "size", "price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ("id", "customer", "city", "date", "total", "status", "pay_method")
    list_filter   = ("status", "pay_method", "city")
    search_fields = ("id", "customer", "email", "phone")
    inlines       = [OrderItemInline]
    ordering      = ("-date",)


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "slug", "is_approved", "created_at")
    list_filter = ("is_approved",)
    search_fields = ("name", "owner__email", "slug")
    actions = ["approve_shops"]

    def approve_shops(self, request, queryset):
        for shop in queryset:
            shop.is_approved = True
            shop.save()
            # Also activate the owner's user account
            shop.owner.is_active = True
            shop.owner.save()
        self.message_user(request, f"{queryset.count()} shops approved.")
    approve_shops.short_description = "Approve selected shops and activate owners"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "user_type")
    list_filter = ("user_type",)
