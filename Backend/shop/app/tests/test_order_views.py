from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from app.models import Order, OrderItem, Product, Shop

User = get_user_model()

TEST_SETTINGS = {
    "DATABASES": {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
    "SECRET_KEY": "test",
    "ROOT_URLCONF": "shop.urls",
}


@override_settings(**TEST_SETTINGS)
class OrderCreateTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_order_with_items(self):
        resp = self.client.post(
            "/api/orders/",
            {
                "customer": "Test User",
                "phone": "1234567890",
                "total": 1500,
                "pay_method": "UPI",
                "items": [
                    {"name": "Kurta", "qty": 1, "size": "M", "price": 1500}
                ],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(resp.data["id"].startswith("KCI-"))
        self.assertEqual(resp.data["status"], "placed")

    def test_create_order_auto_id(self):
        resp = self.client.post(
            "/api/orders/",
            {
                "customer": "User",
                "phone": "123",
                "total": 500,
                "pay_method": "COD",
                "items": [],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertIn("KCI-", resp.data["id"])

    def test_create_order_with_custom_id(self):
        resp = self.client.post(
            "/api/orders/",
            {
                "id": "KCI-2026-99999",
                "customer": "User",
                "phone": "123",
                "total": 500,
                "pay_method": "COD",
                "items": [],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["id"], "KCI-2026-99999")

    def test_create_order_missing_fields(self):
        resp = self.client.post("/api/orders/", {}, format="json")
        self.assertEqual(resp.status_code, 400)


@override_settings(**TEST_SETTINGS)
class OrderAdvanceStatusTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)
        self.order = Order.objects.create(
            id="KCI-2026-00200",
            customer="Test",
            phone="123",
            total=1000,
            pay_method="UPI",
            status="placed",
        )

    def test_advance_status(self):
        resp = self.client.patch(f"/api/orders/{self.order.id}/advance_status/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "confirmed")

    def test_advance_to_delivered(self):
        for _ in range(4):
            self.client.patch(f"/api/orders/{self.order.id}/advance_status/")
        resp = self.client.get(f"/api/orders/{self.order.id}/")
        self.assertEqual(resp.data["status"], "delivered")

    def test_advance_terminal_state(self):
        self.order.status = "delivered"
        self.order.save()
        resp = self.client.patch(f"/api/orders/{self.order.id}/advance_status/")
        self.assertEqual(resp.status_code, 400)

    def test_advance_cancelled(self):
        self.order.status = "cancelled"
        self.order.save()
        resp = self.client.patch(f"/api/orders/{self.order.id}/advance_status/")
        self.assertEqual(resp.status_code, 400)

    def test_unauthenticated_advance(self):
        self.client.force_authenticate(user=None)
        resp = self.client.patch(f"/api/orders/{self.order.id}/advance_status/")
        self.assertEqual(resp.status_code, 401)


@override_settings(**TEST_SETTINGS)
class OrderCancelTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)
        self.order = Order.objects.create(
            id="KCI-2026-00300",
            customer="Test",
            phone="123",
            total=1000,
            pay_method="UPI",
        )

    def test_cancel_order(self):
        resp = self.client.patch(f"/api/orders/{self.order.id}/cancel/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "cancelled")

    def test_cancel_already_cancelled(self):
        self.order.status = "cancelled"
        self.order.save()
        resp = self.client.patch(f"/api/orders/{self.order.id}/cancel/")
        self.assertEqual(resp.status_code, 200)


@override_settings(**TEST_SETTINGS)
class OrderListRetrieveTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)
        Order.objects.create(
            id="KCI-2026-00400",
            customer="A",
            phone="1",
            total=100,
            pay_method="COD",
        )
        Order.objects.create(
            id="KCI-2026-00401",
            customer="B",
            phone="2",
            total=200,
            pay_method="UPI",
        )

    def test_list_orders(self):
        resp = self.client.get("/api/orders/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)

    def test_retrieve_order(self):
        resp = self.client.get("/api/orders/KCI-2026-00400/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["customer"], "A")

    def test_delete_order(self):
        resp = self.client.delete("/api/orders/KCI-2026-00400/")
        self.assertEqual(resp.status_code, 204)


@override_settings(**TEST_SETTINGS)
class GuestOrderTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="s@test.com", email="s@test.com", password="pass1234"
        )
        self.shop = Shop.objects.create(
            owner=self.user, name="Test Shop", slug="test-shop"
        )
        self.product = Product.objects.create(
            shop=self.shop, name="Kurta", mrp=1000, price=800, stock=10
        )

    def test_guest_order_success(self):
        resp = self.client.post(
            "/api/guest-order/",
            {
                "shop_slug": "test-shop",
                "items": [{"product_id": self.product.id, "quantity": 2}],
                "customer_name": "Guest User",
                "customer_phone": "9999999999",
                "customer_address": "123 Street",
                "total_amount": 1600,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(resp.data["order_id"].startswith("GUEST-"))

    def test_guest_order_shop_not_found(self):
        resp = self.client.post(
            "/api/guest-order/",
            {"shop_slug": "nonexistent", "items": [], "total_amount": 0},
            format="json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_guest_order_creates_items(self):
        self.client.post(
            "/api/guest-order/",
            {
                "shop_slug": "test-shop",
                "items": [{"product_id": self.product.id, "quantity": 1}],
                "customer_name": "G",
                "customer_phone": "123",
                "customer_address": "123 Street",
                "total_amount": 800,
            },
            format="json",
        )
        order = Order.objects.latest("created_at")
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.pay_method, "Cash on Delivery")
