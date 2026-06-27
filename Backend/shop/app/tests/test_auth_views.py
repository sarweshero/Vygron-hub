from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from app.models import UserProfile, Shop

User = get_user_model()

TEST_SETTINGS = {
    "DATABASES": {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
    "SECRET_KEY": "test",
    "ROOT_URLCONF": "shop.urls",
}


@override_settings(**TEST_SETTINGS)
class AdminLoginTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )

    def test_admin_login_success(self):
        resp = self.client.post(
            "/api/admin/login/",
            {"username": "admin@test.com", "password": "admin1234"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)

    def test_admin_login_wrong_password(self):
        resp = self.client.post(
            "/api/admin/login/",
            {"username": "admin@test.com", "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_admin_login_non_staff(self):
        User.objects.create_user(
            username="user@test.com", email="user@test.com", password="user1234"
        )
        resp = self.client.post(
            "/api/admin/login/",
            {"username": "user@test.com", "password": "user1234"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_admin_login_missing_fields(self):
        resp = self.client.post("/api/admin/login/", {}, format="json")
        self.assertEqual(resp.status_code, 401)


@override_settings(**TEST_SETTINGS)
class UserRegisterTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_success(self):
        resp = self.client.post(
            "/api/auth/register/",
            {"name": "New User", "email": "new@test.com", "password": "securepass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertIn("access", resp.data)
        self.assertEqual(resp.data["email"], "new@test.com")
        self.assertEqual(resp.data["name"], "New User")

    def test_register_duplicate_email(self):
        User.objects.create_user(
            username="dup@test.com", email="dup@test.com", password="pass1234"
        )
        resp = self.client.post(
            "/api/auth/register/",
            {"name": "Dup", "email": "dup@test.com", "password": "securepass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_register_short_password(self):
        resp = self.client.post(
            "/api/auth/register/",
            {"name": "X", "email": "x@test.com", "password": "short"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_register_missing_email(self):
        resp = self.client.post(
            "/api/auth/register/",
            {"name": "X", "password": "securepass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)


@override_settings(**TEST_SETTINGS)
class ShopRegisterTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_shop_register_success(self):
        resp = self.client.post(
            "/api/auth/shop-register/",
            {
                "name": "Shop Owner",
                "email": "shop@test.com",
                "password": "securepass123",
                "shop_name": "Fashion Hub",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertIn("Shop registration request sent", resp.data["detail"])

    def test_shop_register_creates_inactive_user(self):
        self.client.post(
            "/api/auth/shop-register/",
            {
                "name": "Owner",
                "email": "inactive@test.com",
                "password": "securepass123",
                "shop_name": "My Shop",
            },
            format="json",
        )
        user = User.objects.get(email="inactive@test.com")
        self.assertFalse(user.is_active)
        self.assertEqual(user.profile.user_type, "shop_owner")

    def test_shop_register_duplicate_email(self):
        User.objects.create_user(
            username="dup@test.com", email="dup@test.com", password="pass1234"
        )
        resp = self.client.post(
            "/api/auth/shop-register/",
            {
                "name": "Dup",
                "email": "dup@test.com",
                "password": "securepass123",
                "shop_name": "Dup Shop",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)


@override_settings(**TEST_SETTINGS)
class UserLoginTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="login@test.com", email="login@test.com", password="pass1234"
        )

    def test_login_success(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"email": "login@test.com", "password": "pass1234"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.data)
        self.assertEqual(resp.data["email"], "login@test.com")

    def test_login_wrong_password(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"email": "login@test.com", "password": "wrong"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_login_nonexistent_user(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"email": "nobody@test.com", "password": "pass1234"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_login_missing_fields(self):
        resp = self.client.post("/api/auth/login/", {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_login_inactive_user(self):
        self.user.is_active = False
        self.user.save()
        resp = self.client.post(
            "/api/auth/login/",
            {"email": "login@test.com", "password": "pass1234"},
            format="json",
        )
        self.assertIn(resp.status_code, [401, 403])


@override_settings(**TEST_SETTINGS)
class UserProfileTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="profile@test.com",
            email="profile@test.com",
            password="pass1234",
            first_name="John",
            last_name="Doe",
        )
        UserProfile.objects.create(user=self.user, phone="5551234")
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        resp = self.client.get("/api/auth/profile/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["email"], "profile@test.com")
        self.assertEqual(resp.data["name"], "John Doe")

    def test_update_profile(self):
        resp = self.client.patch(
            "/api/auth/profile/", {"name": "Jane Smith", "phone": "9999999"}
        )
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Jane")
        self.assertEqual(self.user.last_name, "Smith")

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get("/api/auth/profile/")
        self.assertEqual(resp.status_code, 401)


@override_settings(**TEST_SETTINGS)
class UserOrdersTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="orders@test.com", email="orders@test.com", password="pass1234"
        )
        from app.models import Order
        Order.objects.create(
            id="KCI-2026-00100",
            customer="Test",
            email="orders@test.com",
            phone="123",
            total=500,
            pay_method="COD",
        )
        self.client.force_authenticate(user=self.user)

    def test_user_orders(self):
        resp = self.client.get("/api/auth/orders/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_other_user_orders_hidden(self):
        Order = __import__("app.models", fromlist=["Order"]).Order
        Order.objects.create(
            id="KCI-2026-00101",
            customer="Other",
            email="other@test.com",
            phone="456",
            total=300,
            pay_method="UPI",
        )
        resp = self.client.get("/api/auth/orders/")
        self.assertEqual(len(resp.data), 1)


@override_settings(**TEST_SETTINGS)
class ChangePasswordTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="pw@test.com", email="pw@test.com", password="oldpass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        resp = self.client.post(
            "/api/auth/change-password/",
            {"old_password": "oldpass123", "new_password": "newpass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpass123"))

    def test_change_password_wrong_old(self):
        resp = self.client.post(
            "/api/auth/change-password/",
            {"old_password": "wrong", "new_password": "newpass123"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_change_password_missing_fields(self):
        resp = self.client.post(
            "/api/auth/change-password/", {"new_password": "new"}, format="json"
        )
        self.assertEqual(resp.status_code, 400)
