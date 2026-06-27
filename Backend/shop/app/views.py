from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Product, Order, OrderItem, UserProfile, Shop
from .serializers import (
    ProductSerializer, OrderSerializer,
    OrderStatusSerializer, DashboardSerializer,
    UserRegisterSerializer, UserProfileSerializer,
    ShopRegisterSerializer, ShopSerializer
)

User = get_user_model()


# ── Admin Login ────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    """POST /api/admin/login/  { username, password }"""
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is None or not user.is_staff:
        return Response({"detail": "Invalid credentials or not an admin."},
                        status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    return Response({
        "access":  str(refresh.access_token),
        "refresh": str(refresh),
        "username": user.username,
        "email":    user.email,
    })


# ── Products ───────────────────────────────────────────────────────────
class ProductViewSet(viewsets.ModelViewSet):
    """
    GET    /api/products/          – list (public)
    POST   /api/products/          – create (admin)
    GET    /api/products/{id}/     – retrieve (public)
    PUT    /api/products/{id}/     – full update (admin)
    PATCH  /api/products/{id}/     – partial update (admin)
    DELETE /api/products/{id}/     – delete (admin)
    """
    queryset           = Product.objects.all()
    serializer_class   = ProductSerializer
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ["name", "category", "fabric", "tag"]
    ordering_fields    = ["price", "mrp", "stock", "sold", "rating", "created_at"]
    ordering           = ["-created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "home"):
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def home(self, request):
        """GET /api/products/home/ — only products with show_on_home=True"""
        qs = Product.objects.filter(show_on_home=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], permission_classes=[IsAdminUser])
    def toggle_home(self, request, pk=None):
        """PATCH /api/products/{id}/toggle_home/ — flip show_on_home"""
        product = self.get_object()
        product.show_on_home = not product.show_on_home
        product.save(update_fields=["show_on_home"])
        return Response({"id": product.id, "show_on_home": product.show_on_home})

    @action(detail=True, methods=["patch"], permission_classes=[IsAdminUser])
    def out_of_stock(self, request, pk=None):
        """PATCH /api/products/{id}/out_of_stock/ — set stock to 0"""
        product = self.get_object()
        product.stock = 0
        product.save(update_fields=["stock"])
        return Response({"id": product.id, "stock": 0})


# ── Orders ─────────────────────────────────────────────────────────────
class OrderViewSet(viewsets.ModelViewSet):
    """
    GET    /api/orders/            – list (admin)
    POST   /api/orders/            – create new order (public — used by checkout)
    GET    /api/orders/{id}/       – retrieve (admin)
    PATCH  /api/orders/{id}/       – update status (admin)
    DELETE /api/orders/{id}/       – cancel / delete (admin)
    """
    queryset         = Order.objects.prefetch_related("items").all()
    serializer_class = OrderSerializer
    filter_backends  = [filters.SearchFilter, filters.OrderingFilter]
    search_fields    = ["id", "customer", "email", "city", "status"]
    ordering_fields  = ["date", "total", "status", "created_at"]
    ordering         = ["-date"]

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]   # checkout creates orders without auth
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        """
        POST /api/orders/
        Expected body:
        {
          "id":          "KCI-2026-09001",   # optional – auto-generated if absent
          "customer":    "Priya Menon",
          "email":       "...",
          "phone":       "...",
          "city":        "...",
          "date":        "2026-03-03",       # ISO YYYY-MM-DD
          "total":       9097,
          "status":      "placed",
          "pay_method":  "UPI",
          "items": [
            {"name": "...", "qty": 1, "size": "M", "price": 3499}
          ]
        }
        """
        data       = dict(request.data)          # mutable copy
        items_data = data.pop("items", [])       # extract items before validation

        # Auto-generate order ID if not provided
        if not data.get("id"):
            from datetime import date as _date
            year  = _date.today().year
            count = Order.objects.filter(id__startswith=f"KCI-{year}").count() + 1
            data["id"] = f"KCI-{year}-{count:05d}"

        # Ensure date is in ISO format (YYYY-MM-DD); fall back to today
        from datetime import date as _date
        if not data.get("date"):
            data["date"] = str(_date.today())
        else:
            try:
                from dateutil.parser import parse as _parse
                data["date"] = _parse(str(data["date"])).strftime("%Y-%m-%d")
            except Exception:
                data["date"] = str(_date.today())

        serializer = OrderSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        for item in items_data:
            # Extract shop info from item if present
            s_slug = item.pop("shop_slug", None)
            item.pop("shop_name", None) # remove extra info
            item.pop("id", None)        # remove product id if present
            
            # handle missing size
            if "size" not in item:
                item["size"] = "N/A"

            # Find matching shop
            item_shop = None
            if s_slug:
                try:
                    item_shop = Shop.objects.get(slug=s_slug)
                except Shop.DoesNotExist:
                    pass
            
            # If order.shop is not set, set it to the first found shop
            if not order.shop and item_shop:
                order.shop = item_shop
                order.save(update_fields=["shop"])

            OrderItem.objects.create(order=order, shop=item_shop, **item)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], permission_classes=[IsAdminUser])
    def advance_status(self, request, pk=None):
        """PATCH /api/orders/{id}/advance_status/ — move to the next pipeline stage"""
        order = self.get_object()
        nxt   = order.next_status()
        if nxt is None:
            return Response({"detail": "Order is already in a terminal state."},
                            status=status.HTTP_400_BAD_REQUEST)
        order.status = nxt
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["patch"], permission_classes=[IsAdminUser])
    def cancel(self, request, pk=None):
        """PATCH /api/orders/{id}/cancel/"""
        order = self.get_object()
        if order.status == "cancelled":
            return Response({"detail": "Already cancelled."})
        order.status = "cancelled"
        order.save(update_fields=["status"])
        return Response(OrderSerializer(order).data)


# ── Dashboard ──────────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([IsAdminUser])
def dashboard(request):
    """GET /api/dashboard/ — aggregated stats for the admin dashboard"""
    from datetime import date
    from collections import defaultdict

    orders    = Order.objects.prefetch_related("items").all()
    products  = Product.objects.all()

    total_revenue    = orders.filter(status="delivered").aggregate(s=Sum("total"))["s"] or 0
    total_orders     = orders.count()
    total_products   = products.count()
    active_customers = orders.values("email").distinct().count()
    pending_orders   = orders.filter(
        status__in=["placed", "confirmed", "shipped", "out_for_delivery"]
    ).count()
    low_stock_count  = products.filter(stock__gt=0, stock__lte=10).count()

    # Revenue & orders by last 6 months
    from dateutil.relativedelta import relativedelta
    today = date.today()
    months_labels  = []
    revenue_series = []
    orders_series  = []
    for i in range(5, -1, -1):
        d     = today - relativedelta(months=i)
        label = d.strftime("%b")
        month_orders = orders.filter(date__year=d.year, date__month=d.month)
        rev  = month_orders.filter(status="delivered").aggregate(s=Sum("total"))["s"] or 0
        cnt  = month_orders.count()
        months_labels.append(label)
        revenue_series.append(rev)
        orders_series.append(cnt)

    # Top 5 products by sold
    top_products = products.order_by("-sold")[:5]

    # Recent 5 orders
    recent_orders = orders.order_by("-date")[:5]

    # Category breakdown
    cat_totals = defaultdict(int)
    total_sold = products.aggregate(s=Sum("sold"))["s"] or 1
    for p in products:
        cat_totals[p.category] += p.sold
    category_breakdown = [
        {"name": k, "pct": round(v * 100 / total_sold)}
        for k, v in sorted(cat_totals.items(), key=lambda x: -x[1])
    ]

    return Response({
        "total_revenue":      total_revenue,
        "total_orders":       total_orders,
        "total_products":     total_products,
        "active_customers":   active_customers,
        "pending_orders":     pending_orders,
        "low_stock_count":    low_stock_count,
        "revenue_by_month":   [{"label": l, "value": v} for l, v in zip(months_labels, revenue_series)],
        "orders_by_month":    [{"label": l, "value": v} for l, v in zip(months_labels, orders_series)],
        "top_products":       ProductSerializer(top_products, many=True).data,
        "recent_orders":      OrderSerializer(recent_orders, many=True).data,
        "category_breakdown": category_breakdown,
    })


# ── User Auth ─────────────────────────────────────────────────────────
def _user_tokens(user):
    """Return a dict with access + refresh JWT tokens for the user."""
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def _user_payload(user):
    """Return a dict with the user's public profile fields."""
    phone = ""
    try:
        phone = user.profile.phone
    except UserProfile.DoesNotExist:
        pass
    full_name = f"{user.first_name} {user.last_name}".strip() or user.email
    user_type = "customer"
    try:
        user_type = user.profile.user_type
    except UserProfile.DoesNotExist:
        pass
    shop_slug = ""
    if user_type == "shop_owner":
        try:
            shop_slug = user.shop_profile.slug
        except AttributeError:
            pass

    return {
        "id":    user.pk,
        "name":  full_name,
        "email": user.email,
        "phone": phone,
        "userType": user_type,
        "shopSlug": shop_slug,
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def user_register(request):
    """POST /api/auth/register/ — create a new user account."""
    serializer = UserRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    return Response({
        **_user_tokens(user),
        **_user_payload(user),
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def shop_register(request):
    """POST /api/auth/shop-register/ — register a new shop."""
    serializer = ShopRegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    # Note: We don't return tokens yet because shop owners are inactive until approved
    return Response({
        "detail": "Shop registration request sent. Please wait for admin approval.",
        "email": user.email,
        "shop_name": request.data.get("shop_name")
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_public_shops(request):
    """GET /api/shops/ — list all approved shops."""
    shops = Shop.objects.filter(is_approved=True)
    return Response(ShopSerializer(shops, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_shop_details(request, slug):
    """GET /api/shops/{slug}/ — public info for a shop page."""
    try:
        shop = Shop.objects.get(slug=slug, is_approved=True)
        return Response(ShopSerializer(shop).data)
    except Shop.DoesNotExist:
        return Response({"detail": "Shop not found or not yet approved."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([AllowAny])
def user_login(request):
    """POST /api/auth/login/ — authenticate and return JWT + user info."""
    email    = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password", "")
    if not email or not password:
        return Response({"detail": "Email and password are required."},
                        status=status.HTTP_400_BAD_REQUEST)
    # Django username == email for regular users
    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response({"detail": "Invalid email or password."},
                        status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        return Response({"detail": "Account is disabled."},
                        status=status.HTTP_403_FORBIDDEN)
    return Response({
        **_user_tokens(user),
        **_user_payload(user),
    })


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """GET/PATCH /api/auth/profile/ — view or update the logged-in user's profile."""
    user = request.user
    if request.method == "GET":
        return Response(_user_payload(user))

    # PATCH
    data       = request.data
    name       = data.get("name", "").strip()
    phone      = data.get("phone", "").strip()
    if name:
        parts = name.split(" ", 1)
        user.first_name = parts[0]
        user.last_name  = parts[1] if len(parts) > 1 else ""
        user.save(update_fields=["first_name", "last_name"])
    profile, _ = UserProfile.objects.get_or_create(user=user)
    if phone or phone == "":
        profile.phone = phone
        profile.save(update_fields=["phone"])
    return Response(_user_payload(user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_orders(request):
    """GET /api/auth/orders/ — return all orders placed with the user's email."""
    orders = Order.objects.filter(email__iexact=request.user.email)
    return Response(OrderSerializer(orders, many=True).data)
@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_admin_shops(request):
    """GET /api/admin/shops/ — list all shops for admin management."""
    shops = Shop.objects.all().order_by("-id")
    data = []
    for s in shops:
        data.append({
            "id": s.id,
            "owner_email": s.owner.email,
            "name": s.name,
            "slug": s.slug,
            "description": s.description,
            "business_details": s.business_details,
            "is_approved": s.is_approved,
            "created_at": s.owner.date_joined.strftime("%d %b %Y"),
        })
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def approve_shop(request, pk):
    """POST /api/admin/shops/{pk}/approve/ — approve a shop and activate owner."""
    try:
        shop = Shop.objects.get(pk=pk)
        shop.is_approved = True
        shop.save()
        user = shop.owner
        user.is_active = True
        user.save()
        return Response({"detail": f"Shop '{shop.name}' and owner '{user.email}' have been approved and activated."})
    except Shop.DoesNotExist:
        return Response({"detail": "Shop not found."}, status=status.HTTP_404_NOT_FOUND)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def user_change_password(request):
    """POST /api/auth/change-password/ — update the logged-in user's password."""
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")
    if not old_password or not new_password:
        return Response({"detail": "Old and new passwords are required."}, status=status.HTTP_400_BAD_REQUEST)
    user = request.user
    if not user.check_password(old_password):
        return Response({"detail": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({"detail": "Password updated successfully."})


@api_view(["POST"])
@permission_classes([IsAdminUser])
def deactivate_shop(request, pk):
    """POST /api/admin/shops/{pk}/deactivate/ — deactivate a shop and its owner."""
    try:
        shop = Shop.objects.get(pk=pk)
        shop.is_approved = False
        shop.save()
        user = shop.owner
        user.is_active = False
        user.save()
        return Response({"detail": f"Shop '{shop.name}' and owner '{user.email}' have been deactivated."})
    except Shop.DoesNotExist:
        return Response({"detail": "Shop not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_shop(request, pk):
    """DELETE /api/admin/shops/{pk}/ — delete a shop and its owner account."""
    try:
        shop = Shop.objects.get(pk=pk)
        name = shop.name
        user = shop.owner
        # Deleting the user will delete the shop due to CASCADE
        user.delete()
        return Response({"detail": f"Shop '{name}' and its owner account have been permanently deleted."})
    except Shop.DoesNotExist:
        return Response({"detail": "Shop not found."}, status=status.HTTP_404_NOT_FOUND)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_shop(request):
    """PATCH /api/shop/details/ — update the logged-in user's shop profile."""
    try:
        shop = request.user.shop_profile
    except AttributeError:
        return Response({"detail": "Shop profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ShopSerializer(shop, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """POST /api/upload/ — upload an image and return its URL."""
    file = request.FILES.get("image")
    if not file:
        return Response({"detail": "No image provided."}, status=status.HTTP_400_BAD_REQUEST)
    
    from django.core.files.storage import default_storage
    filename = default_storage.save(f"uploads/{file.name}", file)
    file_url = request.build_absolute_uri(settings.MEDIA_URL + filename)
    
    return Response({"url": file_url})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shop_dashboard(request):
    """GET /api/shop/dashboard/ — aggregated stats for the shop owner."""
    try:
        shop = request.user.shop_profile
    except AttributeError:
        return Response({"detail": "Shop profile not found."}, status=status.HTTP_404_NOT_FOUND)
    
    if not shop.is_approved:
        return Response({"detail": "Shop not approved yet."}, status=status.HTTP_403_FORBIDDEN)

    products = Product.objects.filter(shop=shop)
    order_items = OrderItem.objects.filter(shop=shop).select_related('order')
    
    total_revenue = order_items.filter(order__status__in=["placed", "confirmed", "delivered"]).aggregate(s=Sum('price'))['s'] or 0
    total_orders = order_items.values('order').distinct().count()
    total_products = products.count()
    low_stock_count = products.filter(stock__gt=0, stock__lte=5).count()
    
    # Recent orders for this shop
    recent_order_ids = order_items.order_by('-order__created_at').values_list('order_id', flat=True)[:5]
    recent_orders = Order.objects.filter(id__in=recent_order_ids).prefetch_related('items')

    return Response({
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_products": total_products,
        "low_stock_count": low_stock_count,
        "recent_orders": OrderSerializer(recent_orders, many=True).data,
        "shop_name": shop.name,
        "shop_slug": shop.slug,
    })


class MyShopProductViewSet(viewsets.ModelViewSet):
    """ViewSet for shop owners to manage ONLY their own products."""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return Product.objects.filter(shop=self.request.user.shop_profile).order_by("-is_featured", "-id")
        except AttributeError:
            return Product.objects.none()

    def perform_create(self, serializer):
        serializer.save(shop=self.request.user.shop_profile)
@api_view(["POST"])
@permission_classes([AllowAny])
def create_guest_order(request):
    """
    POST /api/guest-order/
    Payload: {
      shop_slug: string,
      items: [{product_id: int, quantity: int}, ...],
      customer_name: string,
      customer_phone: string,
      customer_address: string,
      total_amount: number
    }
    """
    data = request.data
    try:
        shop = Shop.objects.get(slug=data.get('shop_slug'))
    except Shop.DoesNotExist:
        return Response({"detail": "Shop not found."}, status=status.HTTP_404_NOT_FOUND)

    import uuid
    import datetime
    order_id = f"GUEST-{uuid.uuid4().hex[:6].upper()}"
    
    order = Order.objects.create(
        id=order_id,
        shop=shop,
        customer=data.get('customer_name'),
        phone=data.get('customer_phone'),
        address=data.get('customer_address'),
        total=data.get('total_amount'),
        status="placed",
        pay_method="Cash on Delivery"
    )

    for item in data.get('items', []):
        try:
            product = Product.objects.get(id=item.get('product_id'))
            OrderItem.objects.create(
                order=order,
                shop=shop,
                name=product.name,
                qty=item.get('quantity'),
                price=product.price,
                size="N/A" # Default for now
            )
        except Product.DoesNotExist:
            continue

    return Response({
        "detail": "Order placed successfully",
        "order_id": order_id
    }, status=status.HTTP_201_CREATED)
