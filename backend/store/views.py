from rest_framework import viewsets, generics, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Category, Product, Cart, CartItem, Order
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, OrderCreateSerializer, RegisterSerializer, UserSerializer,
)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LoginView(TokenObtainPairView):
    """POST {username, password} -> {access, refresh}"""
    permission_classes = [permissions.AllowAny]


# ---------------------------------------------------------------------------
# Catalog (read-only for everyone, write for staff)
# ---------------------------------------------------------------------------
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "slug"
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related("category")
    serializer_class = ProductSerializer
    lookup_field = "slug"
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "category__name"]
    ordering_fields = ["price", "created_at", "name"]

    def get_queryset(self):
        qs = super().get_queryset()
        category_slug = self.request.query_params.get("category")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        return qs


# ---------------------------------------------------------------------------
# Cart — always scoped to request.user
# ---------------------------------------------------------------------------
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_cart(request.user)
        return Response(CartSerializer(cart).data)

    def post(self, request):
        """Add an item, or bump quantity if it already exists in the cart."""
        cart = self.get_cart(request.user)
        product_id = request.data.get("product")
        quantity = int(request.data.get("quantity", 1))

        item, created = CartItem.objects.get_or_create(
            cart=cart, product_id=product_id, defaults={"quantity": quantity}
        )
        if not created:
            item.quantity += quantity

        serializer = CartItemSerializer(item, data={"product": item.product_id, "quantity": item.quantity})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, request, pk):
        return CartItem.objects.get(pk=pk, cart__user=request.user)

    def patch(self, request, pk):
        item = self.get_object(request, pk)
        serializer = CartItemSerializer(item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(CartSerializer(item.cart).data)

    def delete(self, request, pk):
        item = self.get_object(request, pk)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related("items")

    @action(detail=False, methods=["post"])
    def checkout(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
