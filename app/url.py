from django.contrib import admin 
from django.urls import path 
from . import views 
from django.contrib.auth import views as auth_views 
 
urlpatterns = [ 
    path('admin/', admin.site.urls), 
    path('',views.indexpage,name='indexpage'), 
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('user-profile/', views.userprofile, name='userprofile'),
    path('logout/', views.logout_view, name='logout'),
    path('submit-loan-application/', views.submit_loan_application, name='submit_loan_application'),
    path('api/loan-products/', views.get_loan_products_api, name='loan_products_api'),
]
   
