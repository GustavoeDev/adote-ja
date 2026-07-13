from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from accounts.adopter_urls import discover_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/shelter/', include('accounts.shelter_urls')),
    path('api/shelter/requests/', include('adoptions.urls')),
    path('api/animals/', include('animals.urls')),
    path('api/adopter/', include('accounts.adopter_urls')),
    path('api/adopter/requests/', include('adoptions.adopter_urls')),
    path('api/discover/', include(discover_urlpatterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
