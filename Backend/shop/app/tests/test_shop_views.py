from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from app.models import Shop, Product, UserProfile

User = get_user_model()

TEST_SETTINGS = {
    "DATABASES": {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
    "SECRET_KEY": "test",
    "ROOT_URLCONF": "shop.urls",
}


@override_settings(**TEST_SETTINGS)
class PublicShopsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="s@test.com", email="s@test.com", password="pass1234"
        )
        self.approved_shop = Shop.objects.create(
            owner=self.user, name="Approved Shop", slug="approved", is_approved=True
        )
        self.user2 = User.objects.create_user(
            username="s2@test.com", email="s2@test.com", password="pass1234"
        )
        self.pending_shop = Shop.objects.create(
            owner=self.user2, name="Pending Shop", slug="pending", is_approved=False
        )

    def test_list_approved_shops(self):
        resp = self.client.get("/api/shops/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["slug"], "approved")

    def test_shop_details(self):
        resp = self.client.get("/api/shops/approved/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["name"], "Approved Shop")

    def test_shop_details_not_found(self):
        resp = self.client.get("/api/shops/nonexistent/")
        self.assertEqual(resp.status_code, 404)

    def test_pending_shop_hidden(self):
        resp = self.client.get("/api/shops/pending/")
        self.assertEqual(resp.status_code, 404)


@override_settings(**TEST_SETTINGS)
class AdminShopManagementTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)
        self.owner = User.objects.create_user(
            username="owner@test.com",
            email="owner@test.com",
            password="owner1234",
            is_active=False,
        )
        self.shop = Shop.objects.create(
            owner=self.owner, name="My Shop", slug="my-shop"
        )

    def test_list_admin_shops(self):
        resp = self.client.get("/api/admin/shops/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_approve_shop(self):
        resp = self.client.post(f"/api/admin/shops/{self.shop.id}/approve/")
        self.assertEqual(resp.status_code, 200)
        self.shop.refresh_from_db()
        self.owner.refresh_from_db()
        self.assertTrue(self.shop.is_approved)
        self.assertTrue(self.owner.is_active)

    def test_approve_nonexistent_shop(self):
        resp = self.client.post("/api/admin/shops/99999/approve/")
        self.assertEqual(resp.status_code, 404)

    def test_deactivate_shop(self):
        self.shop.is_approved = True
        self.shop.save()
        self.owner.is_active = True
        self.owner.save()
        resp = self.client.post(f"/api/admin/shops/{self.shop.id}/deactivate/")
        self.assertEqual(resp.status_code, 200)
        self.shop.refresh_from_db()
        self.owner.refresh_from_db()
        self.assertFalse(self.shop.is_approved)
        self.assertFalse(self.owner.is_active)

    def test_delete_shop(self):
        resp = self.client.delete(f"/api/admin/shops/{self.shop.id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Shop.objects.filter(id=self.shop.id).exists())

    def test_delete_nonexistent_shop(self):
        resp = self.client.delete("/api/admin/shops/99999/")
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated_admin_shops(self):
        self.client.force_authenticate(user=None)
        resp = self.client.get("/api/admin/shops/")
        self.assertEqual(resp.status_code, 401)


@override_settings(**TEST_SETTINGS)
class ShopOwnerDashboardTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner@test.com",
            email="owner@test.com",
            password="owner1234",
        )
        self.shop = Shop.objects.create(
            owner=self.owner, name="My Shop", slug="my-shop", is_approved=True
        )
        self.client.force_authenticate(user=self.owner)

    def test_shop_dashboard(self):
        resp = self.client.get("/api/shop/dashboard/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("total_revenue", resp.data)
        self.assertEqual(resp.data["shop_name"], "My Shop")

    def test_shop_dashboard_unapproved(self):
        self.shop.is_approved = False
        self.shop.save()
        resp = self.client.get("/api/shop/dashboard/")
        self.assertEqual(resp.status_code, 403)

    def test_shop_dashboard_no_profile(self):
        user = User.objects.create_user(
            username="noprofile@test.com",
            email="noprofile@test.com",
            password="pass1234",
        )
        self.client.force_authenticate(user=user)
        resp = self.client.get("/api/shop/dashboard/")
        self.assertEqual(resp.status_code, 404)


@override_settings(**TEST_SETTINGS)
class ShopOwnerProductsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner@test.com",
            email="owner@test.com",
            password="owner1234",
        )
        self.shop = Shop.objects.create(
            owner=self.owner, name="My Shop", slug="my-shop"
        )
        self.client.force_authenticate(user=self.owner)
        self.product = Product.objects.create(
            shop=self.shop, name="My Product", mrp=500, price=400, stock=10
        )

    def test_list_my_products(self):
        resp = self.client.get("/api/my-shop/products/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)

    def test_create_my_product(self):
        resp = self.client.post(
            "/api/my-shop/products/",
            {"name": "New", "mrp": 200, "price": 150, "stock": 5},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)

    def test_cannot_see_other_shop_products(self):
        other_user = User.objects.create_user(
            username="other@test.com", email="other@test.com", password="pass1234"
        )
        other_shop = Shop.objects.create(
            owner=other_user, name="Other", slug="other-shop"
        )
        Product.objects.create(
            shop=other_shop, name="Other Product", mrp=100, price=80, stock=1
        )
        resp = self.client.get("/api/my-shop/products/")
        self.assertEqual(resp.data["count"], 1)

    def test_update_my_product(self):
        resp = self.client.patch(
            f"/api/my-shop/products/{self.product.id}/",
            {"price": 350},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, 350)

    def test_delete_my_product(self):
        resp = self.client.delete(f"/api/my-shop/products/{self.product.id}/")
        self.assertEqual(resp.status_code, 204)


@override_settings(**TEST_SETTINGS)
class UpdateShopDetailsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username="owner@test.com",
            email="owner@test.com",
            password="owner1234",
        )
        self.shop = Shop.objects.create(
            owner=self.owner, name="My Shop", slug="my-shop"
        )
        self.client.force_authenticate(user=self.owner)

    def test_update_shop(self):
        resp = self.client.patch(
            "/api/shop/details/",
            {"tagline": "Best Shop Ever", "bg_color": "#ff0000"},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.shop.refresh_from_db()
        self.assertEqual(self.shop.tagline, "Best Shop Ever")

    def test_update_shop_no_profile(self):
        user = User.objects.create_user(
            username="noprofile@test.com",
            email="noprofile@test.com",
            password="pass1234",
        )
        self.client.force_authenticate(user=user)
        resp = self.client.patch(
            "/api/shop/details/", {"tagline": "X"}, format="json"
        )
        self.assertEqual(resp.status_code, 404)
