from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Product, Order, OrderItem, UserProfile, Shop

User = get_user_model()


# ── Product ────────────────────────────────────────────────────────────
class ProductSerializer(serializers.ModelSerializer):
    discount = serializers.ReadOnlyField()

    class Meta:
        model  = Product
        fields = [
            "id", "shop", "name", "mrp", "price", "discount", "sizes",
            "description", "delivery_days", "category", "fabric", "specifications",
            "img_class", "images", "tag", "stock", "sold", "rating",
            "show_on_home", "is_new", "is_bestseller", "is_featured", "color_hex",
            "offer_from", "offer_to", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "shop", "discount", "sold", "created_at", "updated_at"]


# ── Order Items ────────────────────────────────────────────────────────
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = OrderItem
        fields = ["id", "shop", "name", "qty", "size", "price"]


# ── Order ──────────────────────────────────────────────────────────────
class OrderSerializer(serializers.ModelSerializer):
    items       = OrderItemSerializer(many=True, read_only=True)
    next_status = serializers.ReadOnlyField()

    class Meta:
        model  = Order
        fields = [
            "id", "customer", "email", "phone", "city", "date",
            "total", "status", "pay_method", "items", "next_status",
            "created_at",
        ]
        read_only_fields = ["next_status", "created_at"]
        extra_kwargs = {
            "id":     {"required": False},
            "status": {"required": False, "default": "placed"},
        }


class OrderStatusSerializer(serializers.ModelSerializer):
    """Lightweight serializer used by the status-advance endpoint."""
    class Meta:
        model  = Order
        fields = ["id", "status"]


# ── Dashboard ─────────────────────────────────────────────────────────
class DashboardSerializer(serializers.Serializer):
    total_revenue       = serializers.IntegerField()
    total_orders        = serializers.IntegerField()
    total_products      = serializers.IntegerField()
    active_customers    = serializers.IntegerField()
    pending_orders      = serializers.IntegerField()
    low_stock_count     = serializers.IntegerField()
    revenue_by_month    = serializers.ListField()
    orders_by_month     = serializers.ListField()
    top_products        = ProductSerializer(many=True)
    recent_orders       = OrderSerializer(many=True)
    category_breakdown  = serializers.ListField()


# ── User Auth ─────────────────────────────────────────────────────────
class UserRegisterSerializer(serializers.Serializer):
    name     = serializers.CharField(max_length=150)
    email    = serializers.EmailField()
    phone    = serializers.CharField(max_length=20, required=False, default="")
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        name_parts = validated_data["name"].strip().split(" ", 1)
        first_name = name_parts[0]
        last_name  = name_parts[1] if len(name_parts) > 1 else ""
        user = User.objects.create_user(
            username   = validated_data["email"].lower(),
            email      = validated_data["email"].lower(),
            password   = validated_data["password"],
            first_name = first_name,
            last_name  = last_name,
        )
        UserProfile.objects.create(user=user, phone=validated_data.get("phone", ""))
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    name  = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="profile.phone", default="")
    id    = serializers.IntegerField(source="pk", read_only=True)

    class Meta:
        model  = User
        fields = ["id", "name", "email", "phone", "first_name", "last_name"]
        extra_kwargs = {
            "first_name": {"write_only": True},
            "last_name":  {"write_only": True},
        }

    def get_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full or obj.email


# ── Shop ───────────────────────────────────────────────────────────────
class ShopSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    class Meta:
        model = Shop
        fields = [
            "id", "name", "slug", "description", "tagline", "logo", "banner", 
            "hero_heading", "categories_heading",
            "business_details", "custom_categories", "bg_color", 
            "footer_address", "footer_phone", "footer_email", 
            "is_approved", "products"
        ]


class ShopRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, default="")
    password = serializers.CharField(write_only=True, min_length=8)
    shop_name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    business_details = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        from django.utils.text import slugify
        name_parts = validated_data["name"].strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        user = User.objects.create_user(
            username=validated_data["email"].lower(),
            email=validated_data["email"].lower(),
            password=validated_data["password"],
            first_name=first_name,
            last_name=last_name,
            is_active=False  # Shop owners need admin approval
        )
        
        UserProfile.objects.create(
            user=user, 
            phone=validated_data.get("phone", ""),
            user_type="shop_owner"
        )
        
        # Simple slug generation
        slug = slugify(validated_data["shop_name"])
        # Ensure slug is unique
        base_slug = slug
        counter = 1
        while Shop.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        Shop.objects.create(
            owner=user,
            name=validated_data["shop_name"],
            slug=slug,
            description=validated_data.get("description", ""),
            business_details=validated_data.get("business_details", "")
        )
        return user
