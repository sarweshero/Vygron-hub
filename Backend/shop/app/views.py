from django.contrib.auth import authenticate, get_user_model
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Product, Order, OrderItem, UserProfile
from .serializers import (
    ProductSerializer, OrderSerializer,
    OrderStatusSerializer, DashboardSerializer,
    UserRegisterSerializer, UserProfileSerializer,
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
            OrderItem.objects.create(order=order, **item)

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
    return {
        "id":    user.pk,
        "name":  full_name,
        "email": user.email,
        "phone": phone,
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
