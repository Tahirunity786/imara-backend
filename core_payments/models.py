from django.db import models
from django.utils.translation import gettext_lazy as _
from core_posts.models import BedRoom, Tables  # Ensure these models exist and are defined correctly.
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from core_control.models import AnonymousBooking

def generate_unique_id(prefix="nak"):
    """Generate a unique ID using random letters and digits."""
    import random, string
    unique_str = ''.join(random.choices(string.ascii_letters + string.digits, k=15))
    return f"{prefix}-{unique_str}"

class Order(models.Model):
    """Generic Order model."""
    _id = models.CharField(max_length=100, unique=True, db_index=True, null=True, blank=True, verbose_name=_("Order ID"))
    check_in = models.DateField(null=True, blank=True, verbose_name=_("Check-in Date"))
    check_out = models.DateField(null=True, blank=True, verbose_name=_("Check-out Date"))
    nights = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))
    type_booking = models.CharField(max_length=100,db_index=True, null=True,)

    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")

    def save(self, *args, **kwargs):
        if not self._id:
            self._id = generate_unique_id()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Order item linked to any model."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items", verbose_name=_("Order"))
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name=_("Content Type"))
    object_id = models.PositiveIntegerField(verbose_name=_("Object ID"))
    content_object = GenericForeignKey("content_type", "object_id")
    quantity = models.PositiveIntegerField(default=1, verbose_name=_("Quantity"))

    class Meta:
        verbose_name = _("Order Item")
        verbose_name_plural = _("Order Items")


class OrderPlacementStorage(models.Model):
    """Stores multiple orders."""
    annoynmous_track = models.ForeignKey(AnonymousBooking, null=True, on_delete=models.CASCADE)
    orders = models.ManyToManyField(Order, related_name="storages", verbose_name=_("Orders"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Order Placement Storage")
        verbose_name_plural = _("Order Placement Storages")