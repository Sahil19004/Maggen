from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from .models import *

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'is_email_verified', 'created_at')
    list_filter = ('is_email_verified', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(LoanProduct)
class LoanProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'category', 
        'amount_range_display', 
        'interest_rate_display',
        'tenure_range_display',
        'is_active', 
        'created_at'
    ]
    
    list_filter = [
        'category',
        'is_active',
        'created_at',
        'min_loan_amount',
        'max_loan_amount',
        'min_interest_rate',
        'max_interest_rate'
    ]
    
    search_fields = ['name', 'category', 'short_description']
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'icon', 'short_description', 'is_active')
        }),
        ('Loan Amount', {
            'fields': ('min_loan_amount', 'max_loan_amount'),
            'classes': ('collapse',)
        }),
        ('Interest Rate', {
            'fields': ('min_interest_rate', 'max_interest_rate'),
            'classes': ('collapse',)
        }),
        ('Tenure', {
            'fields': ('min_tenure', 'max_tenure'),
            'classes': ('collapse',)
        }),
        ('Features', {
            'fields': ('features',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['category', 'name']
    
    actions = ['activate_products', 'deactivate_products']
    
    def activate_products(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} products were successfully activated.')
    activate_products.short_description = "Activate selected products"
    
    def deactivate_products(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} products were successfully deactivated.')
    deactivate_products.short_description = "Deactivate selected products"
    
    def get_queryset(self, request):
        return super().get_queryset(request)
    
    # Custom admin display methods
    def amount_range_display(self, obj):
        return obj.amount_range_display()
    amount_range_display.short_description = 'Amount Range'
    amount_range_display.admin_order_field = 'min_loan_amount'
    
    def interest_rate_display(self, obj):
        return obj.interest_rate_display()
    interest_rate_display.short_description = 'Interest Rate'
    interest_rate_display.admin_order_field = 'min_interest_rate'
    
    def tenure_range_display(self, obj):
        return obj.tenure_range_display()
    tenure_range_display.short_description = 'Tenure'
    tenure_range_display.admin_order_field = 'min_tenure'


class LoanDocumentInline(admin.TabularInline):
    model = LoanDocument
    extra = 0
    readonly_fields = ['uploaded_at', 'original_filename']
    fields = ['document_type', 'document_file', 'is_mandatory', 'uploaded_at']


@admin.register(LoanApplication)
class LoanApplicationAdmin(admin.ModelAdmin):
    list_display = [
        'application_id', 
        'applicant_name', 
        'loan_product', 
        'requested_amount', 
        'status', 
        'created_at',
        'documents_count'
    ]
    list_filter = [
        'status', 
        'loan_product', 
        'created_at', 
        'updated_at',
        'user_profile__is_email_verified'
    ]
    search_fields = [
        'application_id', 
        'first_name', 
        'last_name', 
        'email',
        'user_profile__user__first_name',
        'user_profile__user__last_name',
        'user_profile__user__email'
    ]
    readonly_fields = ['application_id', 'created_at', 'updated_at']
    inlines = [LoanDocumentInline]
    
    fieldsets = (
        ('Application Details', {
            'fields': ('application_id', 'user_profile', 'status')
        }),
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone'),
            'description': 'Leave blank to auto-populate from user profile'
        }),
        ('Loan Details', {
            'fields': ('loan_product', 'requested_amount', 'annual_income', 'purpose')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def applicant_name(self, obj):
        return obj.full_name
    applicant_name.short_description = 'Applicant Name'
    
    def documents_count(self, obj):
        count = obj.documents.count()
        if count > 0:
            # Replace 'yourapp' with your actual app name
            url = reverse('admin:app_loandocument_changelist') + f'?application__id={obj.id}'
            return format_html('<a href="{}">{} documents</a>', url, count)
        return "No documents"
    documents_count.short_description = 'Documents'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user_profile__user', 'loan_product')
    
    actions = ['mark_as_approved', 'mark_as_rejected', 'mark_as_under_review']
    
    def mark_as_approved(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f'{updated} applications marked as approved.')
    mark_as_approved.short_description = 'Mark selected applications as approved'
    
    def mark_as_rejected(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} applications marked as rejected.')
    mark_as_rejected.short_description = 'Mark selected applications as rejected'
    
    def mark_as_under_review(self, request, queryset):
        updated = queryset.update(status='under_review')
        self.message_user(request, f'{updated} applications marked as under review.')
    mark_as_under_review.short_description = 'Mark selected applications as under review'


@admin.register(LoanDocument)
class LoanDocumentAdmin(admin.ModelAdmin):
    list_display = [
        'application_id_display',
        'applicant_name',
        'document_type_display',
        'is_mandatory',
        'uploaded_at',
        'file_size'
    ]
    list_filter = [
        'document_type',
        'is_mandatory',
        'uploaded_at',
        'application__status'
    ]
    search_fields = [
        'application__application_id',
        'application__first_name',
        'application__last_name',
        'original_filename'
    ]
    readonly_fields = ['uploaded_at', 'original_filename', 'file_size']
    
    fieldsets = (
        ('Document Information', {
            'fields': ('application', 'document_type', 'is_mandatory')
        }),
        ('File Details', {
            'fields': ('document_file', 'original_filename', 'file_size', 'uploaded_at')
        }),
    )
    
    def application_id_display(self, obj):
        # Replace 'yourapp' with your actual app name
        url = reverse('admin:app_loanapplication_change', args=[obj.application.pk])
        return format_html('<a href="{}">{}</a>', url, obj.application.application_id)
    application_id_display.short_description = 'Application ID'
    
    def applicant_name(self, obj):
        return obj.application.full_name
    applicant_name.short_description = 'Applicant'
    
    def document_type_display(self, obj):
        return obj.get_document_type_display()
    document_type_display.short_description = 'Document Type'
    
    def file_size(self, obj):
        if obj.document_file:
            try:
                size = obj.document_file.size
                if size < 1024:
                    return f"{size} bytes"
                elif size < 1024*1024:
                    return f"{size/1024:.1f} KB"
                else:
                    return f"{size/(1024*1024):.1f} MB"
            except:
                return "Unknown"
        return "No file"
    file_size.short_description = 'File Size'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('application__user_profile__user')