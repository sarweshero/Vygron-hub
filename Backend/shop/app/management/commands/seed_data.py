"""
Seed management command.
Run:  python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import date

User = get_user_model()

IMG_URLS = {
    "product-img-1": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    "product-img-2": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    "product-img-3": "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=600&q=80",
    "product-img-4": "https://images.unsplash.com/photo-1614786269829-d24616faf56d?auto=format&fit=crop&w=600&q=80",
    "product-img-5": "https://images.unsplash.com/photo-1573740144655-bfa6156ad484?auto=format&fit=crop&w=600&q=80",
    "product-img-6": "https://images.unsplash.com/photo-1617450365226-9bf28c04e130?auto=format&fit=crop&w=600&q=80",
}

_SEED_PRODUCTS_RAW = [
    dict(id=1,  name="Gulabi Anarkali Suit",        mrp=4999, price=3499, sizes=["S","M","L","XL"],         description="Flowy georgette anarkali with intricate floral prints. Perfect for parties and festive occasions. Comes with matching dupatta.",                       delivery_days=5, category="Festive",      fabric="Georgette",  img_class="product-img-1", tag="New",  stock=42, sold=284, rating=4.9, show_on_home=True,  is_new=True,  is_bestseller=True,  color_hex="#e89ca0"),
    dict(id=2,  name="Zari Weave Straight Kurta",   mrp=3999, price=2799, sizes=["XS","S","M","L","XL"],    description="Rich zari border straight kurta in pure silk. Ideal for weddings and formal gatherings. Dry-clean only.",                                            delivery_days=6, category="Designer",     fabric="Silk",        img_class="product-img-2", tag="Hot",  stock=28, sold=174, rating=4.8, show_on_home=True,  is_new=True,  is_bestseller=True,  color_hex="#7b1e3a"),
    dict(id=3,  name="Chikankari Lucknowi Kurta",   mrp=3299, price=2299, sizes=["S","M","L","XL","XXL"],   description="Hand-embroidered Lucknowi chikankari on soft cotton. Lightweight and breathable for daily wear. Machine washable.",                                 delivery_days=4, category="Casual Wear",  fabric="Cotton",      img_class="product-img-3", tag="Sale", stock=65, sold=432, rating=4.7, show_on_home=True,  is_new=False, is_bestseller=True,  color_hex="#f5ede3"),
    dict(id=4,  name="Royal Bandhani Kurta Set",    mrp=4199, price=4199, sizes=["M","L","XL","XXL"],       description="Traditional Rajasthani bandhani tie-dye kurta set in chanderi. Includes kurta and palazzo. Festival-ready.",                                       delivery_days=5, category="Festive",      fabric="Chanderi",    img_class="product-img-4", tag="New",  stock=19, sold=98,  rating=4.9, show_on_home=False, is_new=True,  is_bestseller=False, color_hex="#c97d4a"),
    dict(id=5,  name="Cotton Dabu Block Print",     mrp=2499, price=1899, sizes=["XS","S","M","L"],         description="Earthy dabu block print using natural dyes on organic cotton. Every piece is hand-crafted and unique.",                                            delivery_days=4, category="Block Print",  fabric="Cotton",      img_class="product-img-5", tag="Sale", stock=53, sold=317, rating=4.6, show_on_home=False, is_new=False, is_bestseller=False, color_hex="#4a5fa3"),
    dict(id=6,  name="Kantha Stitch Long Kurta",    mrp=3199, price=3199, sizes=["S","M","L","XL"],         description="Bengali kantha embroidery on soft mul cotton. Long A-line silhouette with side slits. Casually elegant.",                                         delivery_days=6, category="Embroidered",  fabric="Mul Cotton",  img_class="product-img-6", tag=None,   stock=36, sold=156, rating=4.7, show_on_home=False, is_new=False, is_bestseller=True,  color_hex="#2a8c7c"),
    dict(id=7,  name="Organza Silk Flared Kurta",   mrp=6999, price=5499, sizes=["XS","S","M","L","XL"],    description="Sheer organza overlay with silk lining. Dramatic flare with delicate thread embroidery at hem. Statement piece for weddings.",                     delivery_days=7, category="Designer",     fabric="Silk",        img_class="product-img-1", tag="New",  stock=14, sold=62,  rating=4.9, show_on_home=True,  is_new=True,  is_bestseller=False, color_hex="#e8d5b0"),
    dict(id=8,  name="Tie-Dye Shibori Tunic",       mrp=2199, price=1599, sizes=["S","M","L","XL","XXL"],   description="Japanese shibori technique meets Indian rayon. Casual tunic with relaxed fit, perfect for daily wear and travel.",                                   delivery_days=3, category="Casual Wear",  fabric="Rayon",       img_class="product-img-2", tag="Sale", stock=47, sold=203, rating=4.5, show_on_home=False, is_new=False, is_bestseller=False, color_hex="#5580c8"),
    dict(id=9,  name="Phulkari Embroidered Suit",   mrp=5999, price=4899, sizes=["M","L","XL","XXL"],       description="Vibrant Punjabi phulkari hand embroidery on georgette. Three-piece set with dupatta. Festive wear.",                                              delivery_days=6, category="Embroidered",  fabric="Georgette",   img_class="product-img-3", tag="New",  stock=11, sold=87,  rating=4.8, show_on_home=False, is_new=True,  is_bestseller=False, color_hex="#d4a32a"),
    dict(id=10, name="Ajrakh Block Print A-Line",   mrp=3299, price=2499, sizes=["XS","S","M","L"],         description="Signature Kutchi ajrakh block print in indigo and madder dyes. A-line kurta with mandarin collar.",                                               delivery_days=4, category="Block Print",  fabric="Cotton",      img_class="product-img-4", tag=None,   stock=30, sold=134, rating=4.6, show_on_home=False, is_new=False, is_bestseller=False, color_hex="#c0552d"),
    dict(id=11, name="Kashmiri Crewel Kurta",       mrp=7999, price=6299, sizes=["S","M","L","XL"],         description="Hand-embroidered crewel wool work on pashmina wool blend. Intricate floral motifs. Premium winter wear.",                                         delivery_days=8, category="Designer",     fabric="Wool Blend",  img_class="product-img-5", tag="Luxe", stock=8,  sold=41,  rating=5.0, show_on_home=True,  is_new=True,  is_bestseller=True,  color_hex="#5c3525"),
    dict(id=12, name="Chanderi Anarkali Floor",     mrp=5199, price=5199, sizes=["XS","S","M","L","XL"],    description="Full-length chanderi anarkali with gold zari border. Ethereal and lightweight for parties and religious occasions.",                               delivery_days=5, category="Festive",      fabric="Chanderi",    img_class="product-img-6", tag="New",  stock=22, sold=73,  rating=4.8, show_on_home=True,  is_new=True,  is_bestseller=False, color_hex="#e8a97a"),
    dict(id=13, name="Linen Straight Everyday",     mrp=1799, price=1299, sizes=["S","M","L","XL","XXL","3XL"], description="Pure linen straight kurta with Nehru collar. Eco-friendly and breathable. Ideal for office and casual daily use.", delivery_days=3, category="Casual Wear",  fabric="Linen",       img_class="product-img-1", tag="Sale", stock=88, sold=521, rating=4.4, show_on_home=False, is_new=False, is_bestseller=True,  color_hex="#ede8e0"),
    dict(id=14, name="Ikat Silk Festive Kurta",     mrp=4999, price=3799, sizes=["XS","S","M","L"],         description="Traditional Odisha ikat weave silk kurta. Each piece woven by artisan weavers. Rich texture and vibrant colours.",                               delivery_days=7, category="Silk & Satin", fabric="Silk",        img_class="product-img-2", tag=None,   stock=17, sold=119, rating=4.7, show_on_home=False, is_new=False, is_bestseller=False, color_hex="#2a8c7c"),
    dict(id=15, name="Floral Georgette Straight",   mrp=2799, price=2099, sizes=["S","M","L","XL","XXL"],   description="All-over floral print on lightweight georgette. Straight cut with slight flare at hem. Office-to-evening versatile wear.",                        delivery_days=4, category="Casual Wear",  fabric="Georgette",   img_class="product-img-3", tag="Hot",  stock=39, sold=267, rating=4.6, show_on_home=False, is_new=False, is_bestseller=False, color_hex="#9b7ec8"),
    dict(id=16, name="Heavy Bridal Patiala Set",    mrp=9999, price=7499, sizes=["S","M","L","XL"],         description="Luxurious bridal patiala set in pure silk with heavy gold zardozi embroidery. Includes kurta, patiala, dupatta. Made to order.",                 delivery_days=10, category="Designer",    fabric="Silk",        img_class="product-img-4", tag="Luxe", stock=5,  sold=34,  rating=4.9, show_on_home=True,  is_new=True,  is_bestseller=True,  color_hex="#8b1a2a"),
]

SEED_PRODUCTS = [dict(**p, images=[IMG_URLS[p["img_class"]]]) for p in _SEED_PRODUCTS_RAW]

SEED_ORDERS = [
    dict(id="KCI-2026-08371", customer="Ananya Sharma",   email="ananya@gmail.com",     phone="9876543210", city="Mumbai",    date=date(2026,2,28), total=9097,  status="shipped",          pay_method="UPI",          items=[dict(name="Gulabi Anarkali Suit",qty=1,size="M",price=3499), dict(name="Zari Weave Straight Kurta",qty=2,size="L",price=2799)]),
    dict(id="KCI-2026-08320", customer="Priya Menon",     email="priya.m@yahoo.com",    phone="9845001234", city="Bengaluru", date=date(2026,2,27), total=6299,  status="confirmed",        pay_method="Credit Card",  items=[dict(name="Kashmiri Crewel Kurta",qty=1,size="S",price=6299)]),
    dict(id="KCI-2026-08290", customer="Neha Joshi",      email="neha.j@gmail.com",     phone="9922334455", city="Pune",      date=date(2026,2,26), total=10698, status="out_for_delivery", pay_method="Net Banking",  items=[dict(name="Organza Silk Flared Kurta",qty=1,size="XS",price=5499), dict(name="Chanderi Anarkali Floor",qty=1,size="S",price=5199)]),
    dict(id="KCI-2026-08244", customer="Ritu Singh",      email="ritu.s@outlook.com",   phone="9811223344", city="Delhi",     date=date(2026,2,25), total=4598,  status="delivered",        pay_method="UPI",          items=[dict(name="Chikankari Lucknowi Kurta",qty=2,size="M",price=2299)]),
    dict(id="KCI-2026-08201", customer="Kavya Reddy",     email="kavya@gmail.com",      phone="9700112233", city="Hyderabad", date=date(2026,2,24), total=7499,  status="delivered",        pay_method="Credit Card",  items=[dict(name="Heavy Bridal Patiala Set",qty=1,size="M",price=7499)]),
    dict(id="KCI-2026-08155", customer="Sunita Pillai",   email="sunita.p@gmail.com",   phone="9988776655", city="Chennai",   date=date(2026,2,22), total=3897,  status="delivered",        pay_method="COD",          items=[dict(name="Linen Straight Everyday",qty=3,size="L",price=1299)]),
    dict(id="KCI-2026-08101", customer="Meera Agarwal",   email="meera.a@hotmail.com",  phone="9876001122", city="Jaipur",    date=date(2026,2,20), total=4199,  status="placed",           pay_method="UPI",          items=[dict(name="Royal Bandhani Kurta Set",qty=1,size="XL",price=4199)]),
    dict(id="KCI-2026-08044", customer="Deepa Iyer",      email="deepa.iyer@gmail.com", phone="9943221100", city="Kochi",     date=date(2026,2,18), total=6798,  status="delivered",        pay_method="Credit Card",  items=[dict(name="Phulkari Embroidered Suit",qty=1,size="L",price=4899), dict(name="Cotton Dabu Block Print",qty=1,size="M",price=1899)]),
    dict(id="KCI-2026-07988", customer="Aishwarya Kumar", email="ash.k@gmail.com",      phone="9654321098", city="Mysuru",    date=date(2026,2,15), total=3799,  status="delivered",        pay_method="Net Banking",  items=[dict(name="Ikat Silk Festive Kurta",qty=1,size="S",price=3799)]),
    dict(id="KCI-2026-07940", customer="Pooja Nair",      email="pooja.n@yahoo.com",    phone="9744556677", city="Kozhikode", date=date(2026,2,12), total=4198,  status="cancelled",        pay_method="UPI",          items=[dict(name="Floral Georgette Straight",qty=2,size="M",price=2099)]),
    dict(id="KCI-2026-07891", customer="Leela Sharma",    email="leela.s@gmail.com",    phone="9867445533", city="Ahmedabad", date=date(2026,2,10), total=3199,  status="delivered",        pay_method="COD",          items=[dict(name="Kantha Stitch Long Kurta",qty=1,size="L",price=3199)]),
    dict(id="KCI-2026-07822", customer="Divya Choudhary", email="divya.c@gmail.com",    phone="9932211004", city="Kolkata",   date=date(2026,2,7),  total=5697,  status="delivered",        pay_method="Credit Card",  items=[dict(name="Tie-Dye Shibori Tunic",qty=2,size="S",price=1599), dict(name="Ajrakh Block Print A-Line",qty=1,size="XS",price=2499)]),
]


class Command(BaseCommand):
    help = "Seed the database with sample products and orders"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush", action="store_true",
            help="Delete existing products and orders before seeding",
        )
        parser.add_argument(
            "--admin-password", default="admin1234",
            help="Password for the superuser created by this command",
        )

    def handle(self, *args, **options):
        from app.models import Product, Order, OrderItem

        if options["flush"]:
            Product.objects.all().delete()
            Order.objects.all().delete()
            self.stdout.write(self.style.WARNING("Flushed existing products and orders."))

        # ── Superuser ──
        admin_pw = options["admin_password"]
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@kurthicouture.com", admin_pw)
            self.stdout.write(self.style.SUCCESS(f"Superuser created: admin / {admin_pw}"))
        else:
            self.stdout.write("Superuser 'admin' already exists — skipped.")

        # ── Products ──
        created_p = 0
        for data in SEED_PRODUCTS:
            obj, created = Product.objects.update_or_create(
                id=data["id"], defaults={k: v for k, v in data.items() if k != "id"}
            )
            if created:
                created_p += 1
        self.stdout.write(self.style.SUCCESS(f"Products seeded: {created_p} new, {len(SEED_PRODUCTS) - created_p} updated."))

        # ── Orders ──
        created_o = 0
        for data in SEED_ORDERS:
            items = data.pop("items")
            obj, created = Order.objects.update_or_create(
                id=data["id"], defaults={k: v for k, v in data.items() if k != "id"}
            )
            if created:
                for item in items:
                    OrderItem.objects.create(order=obj, **item)
                created_o += 1
            data["items"] = items  # restore for idempotency
        self.stdout.write(self.style.SUCCESS(f"Orders seeded: {created_o} new, {len(SEED_ORDERS) - created_o} already existed."))

        self.stdout.write(self.style.SUCCESS("✓ Seeding complete."))
