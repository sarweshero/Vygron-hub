from django.contrib import admin
from .models import Product, Order, OrderItem


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
