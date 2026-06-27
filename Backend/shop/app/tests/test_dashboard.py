from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from app.models import Product, Order, OrderItem, Shop

User = get_user_model()

TEST_SETTINGS = {
    "DATABASES": {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
    "SECRET_KEY": "test",
    "ROOT_URLCONF": "shop.urls",
}


@override_settings(**TEST_SETTINGS)
class DashboardTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)

        self.user = User.objects.create_user(
            username="s@test.com", email="s@test.com", password="pass1234"
        )
        self.shop = Shop.objects.create(
            owner=self.user, name="Shop", slug="shop-d"
        )
        self.product = Product.objects.create(
            shop=self.shop, name="Kurta", mrp=1000, price=800, stock=5, sold=10
        )
        self.order = Order.objects.create(
            id="KCI-2026-00500",
            customer="Test",
            email="test@test.com",
            phone="123",
            total=800,
            pay_method="UPI",
            status="delivered",
        )
        OrderItem.objects.create(
            order=self.order, shop=self.shop, name="Kurta", qty=1, size="M", price=800
        )

    def test_dashboard_fields(self):
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("total_revenue", resp.data)
        self.assertIn("total_orders", resp.data)
        self.assertIn("total_products", resp.data)
        self.assertIn("active_customers", resp.data)
        self.assertIn("pending_orders", resp.data)
        self.assertIn("low_stock_count", resp.data)
        self.assertIn("revenue_by_month", resp.data)
        self.assertIn("orders_by_month", resp.data)
        self.assertIn("top_products", resp.data)
        self.assertIn("recent_orders", resp.data)
        self.assertIn("category_breakdown", resp.data)

    def test_dashboard_revenue(self):
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.data["total_revenue"], 800)

    def test_dashboard_order_count(self):
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.data["total_orders"], 1)

    def test_dashboard_product_count(self):
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.data["total_products"], 1)

    def test_dashboard_active_customers(self):
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.data["active_customers"], 1)

    def test_dashboard_top_products(self):
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(len(resp.data["top_products"]), 1)

    def test_dashboard_category_breakdown(self):
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(len(resp.data["category_breakdown"]), 1)
        self.assertEqual(resp.data["category_breakdown"][0]["name"], "Others")

    def test_dashboard_revenue_by_month(self):
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(len(resp.data["revenue_by_month"]), 6)

    def test_unauthenticated_dashboard(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.status_code, 401)

    def test_non_admin_dashboard(self):
        user = User.objects.create_user(
            username="user@test.com", email="user@test.com", password="pass1234"
        )
        self.client.force_authenticate(user=user)
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.status_code, 403)

    def test_low_stock_count(self):
        Product.objects.create(name="Low", mrp=100, price=80, stock=3, sold=1)
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.data["low_stock_count"], 2)

    def test_pending_orders(self):
        Order.objects.create(
            id="KCI-2026-00501",
            customer="P",
            phone="456",
            total=200,
            pay_method="COD",
            status="placed",
        )
        resp = self.client.get("/api/dashboard/")
        self.assertEqual(resp.data["pending_orders"], 1)


@override_settings(**TEST_SETTINGS)
class ImageUploadTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="u@test.com", email="u@test.com", password="pass1234"
        )
        self.client.force_authenticate(user=self.user)

    def test_upload_image(self):
        from io import BytesIO
        from django.core.files.uploadedfile import SimpleUploadedFile

        img = SimpleUploadedFile("test.jpg", b"fake-image-data", content_type="image/jpeg")
        resp = self.client.post("/api/upload/", {"image": img})
        self.assertEqual(resp.status_code, 200)
        self.assertIn("url", resp.data)

    def test_upload_no_image(self):
        resp = self.client.post("/api/upload/", {})
        self.assertEqual(resp.status_code, 400)

    def test_upload_unauthenticated(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post("/api/upload/", {})
        self.assertEqual(resp.status_code, 401)
