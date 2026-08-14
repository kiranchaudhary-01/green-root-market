from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers

from .models import Category, Product, Cart, CartItem, Order, OrderItem

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth / users
# ---------------------------------------------------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "first_name", "last_name")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")


# ---------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------
class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source="products.count", read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "product_count")


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id", "name", "slug", "description", "care_level", "price",
            "stock", "image", "is_active", "category", "category_name",
            "in_stock", "created_at",
        )


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------
class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source="product", read_only=True)
    subtotal = serializers.DecimalField(max_digits=9, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "product", "product_detail", "quantity", "subtotal")

    def validate(self, attrs):
        product = attrs.get("product") or getattr(self.instance, "product", None)
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", 1))
        if product and quantity > product.stock:
            raise serializers.ValidationError(
                f"Only {product.stock} unit(s) of '{product.name}' left in stock."
            )
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=9, decimal_places=2, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ("id", "items", "total_price", "total_items", "updated_at")


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=9, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "product", "product_name", "unit_price", "quantity", "subtotal")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id", "status", "shipping_address", "contact_phone",
            "total_price", "items", "created_at", "updated_at",
        )
        read_only_fields = ("status", "total_price")


class OrderCreateSerializer(serializers.Serializer):
    """Creates an Order (with snapshotted OrderItems) from the user's current cart."""
    shipping_address = serializers.CharField()
    contact_phone = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        user = self.context["request"].user
        cart = getattr(user, "cart", None)

        if not cart or not cart.items.exists():
            raise serializers.ValidationError("Your cart is empty.")

        for item in cart.items.select_related("product"):
            if item.quantity > item.product.stock:
                raise serializers.ValidationError(
                    f"Only {item.product.stock} unit(s) of '{item.product.name}' left in stock."
                )

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                shipping_address=validated_data["shipping_address"],
                contact_phone=validated_data.get("contact_phone", ""),
                total_price=cart.total_price,
            )
            for item in cart.items.select_related("product"):
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    unit_price=item.product.price,
                    quantity=item.quantity,
                )
                item.product.stock -= item.quantity
                item.product.save(update_fields=["stock"])

            cart.items.all().delete()

        return order
