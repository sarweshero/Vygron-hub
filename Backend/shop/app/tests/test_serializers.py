from django.test import TestCase
from django.contrib.auth import get_user_model

from app.models import Product, Order, OrderItem, UserProfile, Shop
from app.serializers import (
    ProductSerializer,
    OrderSerializer,
    UserRegisterSerializer,
    UserProfileSerializer,
    ShopRegisterSerializer,
    ShopSerializer,
)

User = get_user_model()


class ProductSerializerTest(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="Silk Kurta", mrp=2000, price=1500, stock=5, tag="New"
        )

    def test_fields(self):
        data = ProductSerializer(self.product).data
        self.assertEqual(data["name"], "Silk Kurta")
        self.assertEqual(data["discount"], 25)
        self.assertIn("id", data)
        self.assertIn("created_at", data)

    def test_read_only_fields(self):
        data = ProductSerializer(self.product).data
        self.assertIn("shop", data)
        self.assertIn("sold", data)


class OrderSerializerTest(TestCase):
    def setUp(self):
        self.order = Order.objects.create(
            id="KCI-2026-10001",
            customer="Priya",
            phone="123",
            total=3000,
            pay_method="UPI",
        )
        OrderItem.objects.create(
            order=self.order, name="Kurti", qty=1, size="M", price=3000
        )

    def test_fields(self):
        data = OrderSerializer(self.order).data
        self.assertEqual(data["id"], "KCI-2026-10001")
        self.assertEqual(data["customer"], "Priya")
        self.assertEqual(len(data["items"]), 1)
        self.assertIn("next_status", data)

    def test_next_status_in_output(self):
        data = OrderSerializer(self.order).data
        self.assertEqual(data["next_status"], "confirmed")


class UserRegisterSerializerTest(TestCase):
    def test_valid_registration(self):
        data = {"name": "Test User", "email": "test@example.com", "password": "securepass123"}
        s = UserRegisterSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)

    def test_duplicate_email(self):
        User.objects.create_user(
            username="dup@test.com", email="dup@test.com", password="pass1234"
        )
        data = {"name": "Dup", "email": "dup@test.com", "password": "securepass123"}
        s = UserRegisterSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertIn("email", s.errors)

    def test_create_user(self):
        data = {"name": "Jane Doe", "email": "jane@test.com", "password": "securepass123"}
        s = UserRegisterSerializer(data=data)
        s.is_valid(raise_exception=True)
        user = s.save()
        self.assertEqual(user.email, "jane@test.com")
        self.assertEqual(user.first_name, "Jane")
        self.assertEqual(user.last_name, "Doe")
        self.assertTrue(hasattr(user, "profile"))

    def test_short_password_rejected(self):
        data = {"name": "X", "email": "x@test.com", "password": "short"}
        s = UserRegisterSerializer(data=data)
        self.assertFalse(s.is_valid())

    def test_single_name(self):
        data = {"name": "Madonna", "email": "m@test.com", "password": "securepass123"}
        s = UserRegisterSerializer(data=data)
        s.is_valid(raise_exception=True)
        user = s.save()
        self.assertEqual(user.first_name, "Madonna")
        self.assertEqual(user.last_name, "")


class UserProfileSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="u@test.com",
            email="u@test.com",
            password="pass1234",
            first_name="John",
            last_name="Doe",
        )
        UserProfile.objects.create(user=self.user, phone="5551234")

    def test_get_name(self):
        data = UserProfileSerializer(self.user).data
        self.assertEqual(data["name"], "John Doe")

    def test_phone_in_output(self):
        data = UserProfileSerializer(self.user).data
        self.assertEqual(data["phone"], "5551234")


class ShopRegisterSerializerTest(TestCase):
    def test_valid_registration(self):
        data = {
            "name": "Shop Owner",
            "email": "shop@test.com",
            "password": "securepass123",
            "shop_name": "My Fashion Store",
        }
        s = ShopRegisterSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)

    def test_create_shop(self):
        data = {
            "name": "Shop Owner",
            "email": "shop2@test.com",
            "password": "securepass123",
            "shop_name": "My Fashion Store",
        }
        s = ShopRegisterSerializer(data=data)
        s.is_valid(raise_exception=True)
        user = s.save()
        self.assertFalse(user.is_active)
        self.assertEqual(user.profile.user_type, "shop_owner")
        self.assertEqual(user.shop_profile.name, "My Fashion Store")
        self.assertEqual(user.shop_profile.slug, "my-fashion-store")

    def test_duplicate_email(self):
        User.objects.create_user(
            username="dup@test.com", email="dup@test.com", password="pass1234"
        )
        data = {
            "name": "Dup",
            "email": "dup@test.com",
            "password": "securepass123",
            "shop_name": "Dup Shop",
        }
        s = ShopRegisterSerializer(data=data)
        self.assertFalse(s.is_valid())

    def test_slug_uniqueness(self):
        for i in range(3):
            data = {
                "name": "Owner",
                "email": f"owner{i}@test.com",
                "password": "securepass123",
                "shop_name": "Same Name",
            }
            s = ShopRegisterSerializer(data=data)
            s.is_valid(raise_exception=True)
            s.save()
        slugs = list(Shop.objects.values_list("slug", flat=True))
        self.assertEqual(len(slugs), len(set(slugs)))


class ShopSerializerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="s@test.com", email="s@test.com", password="pass1234"
        )
        self.shop = Shop.objects.create(
            owner=self.user, name="Test Shop", slug="test-shop"
        )

    def test_fields(self):
        data = ShopSerializer(self.shop).data
        self.assertEqual(data["name"], "Test Shop")
        self.assertEqual(data["slug"], "test-shop")
        self.assertIn("products", data)
        self.assertFalse(data["is_approved"])
