from django.core.management.base import BaseCommand
from django.utils.text import slugify
from store.models import Category, Product

CATEGORIES = [
    ("Indoor Plants", "Low-light, air-purifying plants for home and office."),
    ("Succulents & Cacti", "Low-maintenance desert plants that thrive on neglect."),
    ("Herb & Kitchen Garden", "Grow your own herbs and greens at home."),
    ("Planters & Pots", "Ceramic, terracotta, and self-watering containers."),
    ("Plant Care", "Soil, fertilizer, and tools to keep plants thriving."),
]

PRODUCTS = [
    ("Money Plant (Golden Pothos)", "Indoor Plants", "easy", 249, 40,
     "A trailing vine known for being nearly impossible to kill. Thrives in low light."),
    ("Snake Plant", "Indoor Plants", "easy", 399, 35,
     "Upright, sculptural leaves that tolerate neglect and purify indoor air."),
    ("Areca Palm", "Indoor Plants", "moderate", 899, 15,
     "A lush, feathery palm that brings a tropical feel to any room."),
    ("Peace Lily", "Indoor Plants", "moderate", 549, 20,
     "Glossy leaves and white blooms; signals when it needs water by drooping slightly."),
    ("Echeveria Rosette", "Succulents & Cacti", "easy", 199, 60,
     "A classic rosette succulent in soft blue-green tones."),
    ("Golden Barrel Cactus", "Succulents & Cacti", "easy", 349, 25,
     "A round, ribbed cactus that makes a bold statement with minimal care."),
    ("Jade Plant", "Succulents & Cacti", "easy", 249, 45,
     "Thick, glossy leaves on a miniature tree form. Said to bring good luck."),
    ("Basil Sapling", "Herb & Kitchen Garden", "easy", 99, 80,
     "Fragrant kitchen herb, ready to harvest in a few weeks."),
    ("Mint Sapling", "Herb & Kitchen Garden", "easy", 89, 80,
     "Fast-spreading, fragrant herb perfect for teas and chutneys."),
    ("Curry Leaf Plant", "Herb & Kitchen Garden", "moderate", 299, 20,
     "A kitchen-garden staple for authentic South Asian cooking."),
    ("Terracotta Ridged Pot (8 in)", "Planters & Pots", "easy", 179, 50,
     "Handmade terracotta with natural drainage, finished with a ridged texture."),
    ("Self-Watering Ceramic Planter", "Planters & Pots", "easy", 599, 18,
     "A reservoir base keeps soil moist for up to two weeks."),
    ("Organic Potting Mix (5 kg)", "Plant Care", "easy", 249, 100,
     "A well-draining blend of coco peat, compost, and perlite."),
    ("Liquid Seaweed Fertilizer", "Plant Care", "easy", 199, 70,
     "A gentle, organic feed for steady, healthy growth."),
    ("Hand Trowel & Pruner Set", "Plant Care", "easy", 349, 30,
     "Stainless steel tools sized for balcony and indoor gardening."),
]


class Command(BaseCommand):
    help = "Seed the database with sample plant categories and products."

    def handle(self, *args, **options):
        cat_objs = {}
        for name, desc in CATEGORIES:
            cat, created = Category.objects.get_or_create(
                slug=slugify(name), defaults={"name": name, "description": desc}
            )
            cat_objs[name] = cat
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Exists'} category: {name}"))

        for name, cat_name, care, price, stock, desc in PRODUCTS:
            product, created = Product.objects.get_or_create(
                slug=slugify(name),
                defaults={
                    "name": name,
                    "category": cat_objs[cat_name],
                    "care_level": care,
                    "price": price,
                    "stock": stock,
                    "description": desc,
                },
            )
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Exists'} product: {name}"))

        self.stdout.write(self.style.SUCCESS("Seeding complete."))
