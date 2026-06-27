from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model

from app.models import Product, Order, OrderItem, UserProfile, Shop

User = get_user_model()


class ShopModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="owner@test.com", email="owner@test.com", password="pass1234"
        )
        self.shop = Shop.objects.create(
            owner=self.user, name="Test Shop", slug="test-shop"
        )

    def test_str(self):
        self.assertEqual(str(self.shop), "Test Shop")

    def test_slug_unique(self):
        with self.assertRaises(Exception):
            Shop.objects.create(
                owner=User.objects.create_user(
                    username="o2@test.com", email="o2@test.com", password="pass1234"
                ),
                name="Shop 2",
                slug="test-shop",
            )

    def test_defaults(self):
        self.assertFalse(self.shop.is_approved)
        self.assertEqual(self.shop.bg_color, "#ffffff")
        self.assertEqual(self.shop.hero_heading, "Quality You Can Trust")


class ProductModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="owner@test.com", email="owner@test.com", password="pass1234"
        )
        self.shop = Shop.objects.create(
            owner=self.user, name="Shop", slug="shop-p"
        )
        self.product = Product.objects.create(
            shop=self.shop, name="Kurta", mrp=1000, price=750, stock=10
        )

    def test_str(self):
        self.assertEqual(str(self.product), "Kurta")

    def test_discount_positive(self):
        self.assertEqual(self.product.discount, 25)

    def test_discount_zero_when_mrp_equals_price(self):
        self.product.mrp = 500
        self.product.price = 500
        self.assertEqual(self.product.discount, 0)

    def test_discount_zero_when_price_greater(self):
        self.product.mrp = 400
        self.product.price = 500
        self.assertEqual(self.product.discount, 0)

    def test_default_ordering(self):
        p1 = Product.objects.create(name="A", mrp=100, price=80, stock=1)
        p2 = Product.objects.create(name="B", mrp=100, price=80, stock=1)
        products = list(Product.objects.all())
        self.assertEqual(products[0], p2)

    def test_defaults(self):
        p = Product.objects.create(name="X", mrp=100, price=100)
        self.assertEqual(p.delivery_days, 5)
        self.assertEqual(p.category, "Others")
        self.assertFalse(p.show_on_home)
        self.assertFalse(p.is_new)
        self.assertFalse(p.is_bestseller)
        self.assertFalse(p.is_featured)
        self.assertEqual(p.rating, 4.5)


class OrderModelTest(TestCase):
    def setUp(self):
        self.order = Order.objects.create(
            id="KCI-2026-00001",
            customer="Test User",
            phone="1234567890",
            total=1000,
            pay_method="UPI",
        )

    def test_str(self):
        self.assertEqual(str(self.order), "KCI-2026-00001 – Test User")

    def test_next_status_from_placed(self):
        self.assertEqual(self.order.next_status(), "confirmed")

    def test_next_status_from_shipped(self):
        self.order.status = "shipped"
        self.assertEqual(self.order.next_status(), "out_for_delivery")

    def test_next_status_from_delivered(self):
        self.order.status = "delivered"
        self.assertIsNone(self.order.next_status())

    def test_next_status_from_cancelled(self):
        self.order.status = "cancelled"
        self.assertIsNone(self.order.next_status())

    def test_default_status(self):
        self.assertEqual(self.order.status, "placed")

    def test_order_items(self):
        OrderItem.objects.create(
            order=self.order, name="Item 1", qty=2, size="M", price=500
        )
        OrderItem.objects.create(
            order=self.order, name="Item 2", qty=1, size="L", price=500
        )
        self.assertEqual(self.order.items.count(), 2)


class OrderItemModelTest(TestCase):
    def setUp(self):
        self.order = Order.objects.create(
            id="KCI-2026-00002",
            customer="Test",
            phone="123",
            total=500,
            pay_method="COD",
        )
        self.item = OrderItem.objects.create(
            order=self.order, name="Kurta", qty=2, size="M", price=250
        )

    def test_str(self):
        self.assertEqual(str(self.item), "2× Kurta (M)")


class UserProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="cust@test.com", email="cust@test.com", password="pass1234"
        )
        self.profile = UserProfile.objects.create(
            user=self.user, phone="9999999999", user_type="customer"
        )

    def test_str(self):
        self.assertEqual(str(self.profile), "cust@test.com")

    def test_default_user_type(self):
        p = UserProfile.objects.create(
            user=User.objects.create_user(
                username="x@test.com", email="x@test.com", password="pass1234"
            )
        )
        self.assertEqual(p.user_type, "customer")
