from django.conf import settings
from django.db import models


# ── Product ────────────────────────────────────────────────────────────
class Product(models.Model):
    CATEGORY_CHOICES = [
        ("Womens Wear",  "Womens Wear"),
        ("Mens Wear",    "Mens Wear"),
        ("Electronics",  "Electronics"),
        ("Home & Living","Home & Living"),
        ("Others",       "Others"),
    ]
    TAG_CHOICES = [
        ("New",  "New"),
        ("Hot",  "Hot"),
        ("Sale", "Sale"),
        ("Luxe", "Luxe"),
    ]

    # Linking product to a specific shop
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name="products", null=True, blank=True)
    name          = models.CharField(max_length=200)
    mrp           = models.PositiveIntegerField(help_text="Maximum Retail Price (₹)")
    price         = models.PositiveIntegerField(help_text="Selling Price (₹)")
    sizes         = models.JSONField(default=list, help_text='e.g. ["S","M","L","XL"]')
    description   = models.TextField(blank=True)
    delivery_days = models.PositiveSmallIntegerField(default=5)
    category      = models.CharField(max_length=100, default="Others")
    fabric        = models.CharField(max_length=100, blank=True, null=True)
    specifications = models.JSONField(default=dict, blank=True, help_text='e.g. {"RAM": "8GB", "Brand": "Sony"}')
    img_class     = models.CharField(max_length=50, default="product-img-1")
    images        = models.JSONField(default=list, blank=True, help_text="List of image URLs")
    tag           = models.CharField(max_length=10, choices=TAG_CHOICES, blank=True, null=True)
    stock         = models.PositiveIntegerField(default=0)
    sold          = models.PositiveIntegerField(default=0)
    rating        = models.DecimalField(max_digits=3, decimal_places=1, default=4.5)
    show_on_home  = models.BooleanField(default=False)
    is_new        = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_featured   = models.BooleanField(default=False)
    color_hex     = models.CharField(max_length=20, default="#7b1e3a")
    offer_from    = models.DateField(blank=True, null=True)
    offer_to      = models.DateField(blank=True, null=True)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def discount(self):
        if self.mrp > self.price:
            return round(((self.mrp - self.price) / self.mrp) * 100)
        return 0


# ── Order ──────────────────────────────────────────────────────────────
class Order(models.Model):
    STATUS_CHOICES = [
        ("placed",            "Placed"),
        ("confirmed",         "Confirmed"),
        ("shipped",           "Shipped"),
        ("out_for_delivery",  "Out for Delivery"),
        ("delivered",         "Delivered"),
        ("cancelled",         "Cancelled"),
    ]
    STATUS_FLOW = [
        "placed", "confirmed", "shipped", "out_for_delivery", "delivered",
    ]

    id          = models.CharField(max_length=30, primary_key=True)
    shop        = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name="orders", null=True, blank=True)
    customer    = models.CharField(max_length=150)
    email       = models.EmailField(blank=True, default="")
    phone       = models.CharField(max_length=20)
    address     = models.TextField(blank=True, default="")
    city        = models.CharField(max_length=100, blank=True, default="")
    date        = models.DateField(auto_now_add=True)
    total       = models.PositiveIntegerField()
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default="placed")
    pay_method  = models.CharField(max_length=50)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.id} – {self.customer}"

    def next_status(self):
        """Return the next status in the pipeline, or None if terminal."""
        try:
            idx = self.STATUS_FLOW.index(self.status)
            return self.STATUS_FLOW[idx + 1] if idx + 1 < len(self.STATUS_FLOW) else None
        except ValueError:
            return None


# ── OrderItem ──────────────────────────────────────────────────────────
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    shop  = models.ForeignKey('Shop', on_delete=models.SET_NULL, null=True, blank=True)
    name  = models.CharField(max_length=200)
    qty   = models.PositiveSmallIntegerField(default=1)
    size  = models.CharField(max_length=10)
    price = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.qty}× {self.name} ({self.size})"


# ── UserProfile ────────────────────────────────────────────────────────
class UserProfile(models.Model):
    user  = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone = models.CharField(max_length=20, blank=True, default="")
    user_type = models.CharField(
        max_length=20,
        choices=[("customer", "Customer"), ("shop_owner", "Shop Owner")],
        default="customer"
    )

    def __str__(self):
        return self.user.email


# ── Shop ───────────────────────────────────────────────────────────────
class Shop(models.Model):
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shop_profile"
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, help_text="Used in the URL: vygron.co.in/shop-slug")
    description = models.TextField(blank=True, help_text="e.g. clothing brand")
    tagline = models.CharField(max_length=255, blank=True, help_text="A short catchy phrase for your shop")
    logo = models.CharField(max_length=500, blank=True, help_text="URL to shop logo image")
    banner = models.CharField(max_length=500, blank=True, help_text="URL to top header banner image")
    hero_heading = models.CharField(max_length=255, default="Quality You Can Trust")
    categories_heading = models.CharField(max_length=255, default="Discover Our Collection")
    business_details = models.TextField(blank=True, help_text="Detailed info about what they sell")
    custom_categories = models.JSONField(default=list, blank=True, help_text='e.g. ["Electronics", "Summer Collection"]')
    
    # Customization
    bg_color = models.CharField(max_length=20, default="#ffffff", help_text="Background color of the shop page")
    footer_address = models.TextField(blank=True)
    footer_phone = models.CharField(max_length=50, blank=True)
    footer_email = models.EmailField(blank=True)
    
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
