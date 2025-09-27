from django.contrib.auth.models import User
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - Profile"
    



class LoanProduct(models.Model):
    """Main model for loan products"""
    # Basic information
    name = models.CharField(max_length=200)
    category = models.CharField(
        max_length=100,
        help_text="Category name (e.g., Personal Loan, Home Loan, Car Loan)"
    )
    icon = models.CharField(
        max_length=50, 
        default='💰', 
        help_text="Icon representation (e.g., 💰, 🏠, 🚗)"
    )
    short_description = models.CharField(max_length=255, blank=True)
        
    # Loan details
    min_loan_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=1000.00,
        validators=[MinValueValidator(0)],
        help_text="Minimum loan amount"
    )
    max_loan_amount = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=50000.00,
        validators=[MinValueValidator(0)],
        help_text="Maximum loan amount"
    )
    min_interest_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=5.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Minimum interest rate (%)"
    )
    max_interest_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=15.0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Maximum interest rate (%)"
    )
    min_tenure = models.PositiveSmallIntegerField(
        default=12,
        help_text="Minimum tenure in months"
    )
    max_tenure = models.PositiveSmallIntegerField(
        default=60,
        help_text="Maximum tenure in months"
    )
        
    # Features (stored as text with line breaks)
    features = models.TextField(
        default="✓ No collateral required\n✓ Quick approval\n✓ Flexible repayment options",
        help_text="List key features separated by new lines"
    )
        
    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = "Loan Product"
        verbose_name_plural = "Loan Products"

    def __str__(self):
        return f"{self.name} ({self.category})"

    def get_features_list(self):
        """Return features as a list"""
        return [feature.strip() for feature in self.features.split('\n') if feature.strip()]

    def tenure_range_display(self):
        """Return tenure range in a readable format"""
        min_years = self.min_tenure // 12
        max_years = self.max_tenure // 12
        
        if min_years == max_years:
            return f"{min_years} year{'s' if min_years > 1 else ''}"
        else:
            return f"{min_years}-{max_years} years"

    def amount_range_display(self):
        """Return amount range in a readable format"""
        if self.max_loan_amount >= 1000000:
            max_display = f"₹{self.max_loan_amount/1000000:.1f}M"
        elif self.max_loan_amount >= 1000:
            max_display = f"₹{self.max_loan_amount/1000:.0f}K"
        else:
            max_display = f"₹{self.max_loan_amount:.0f}"
                    
        if self.min_loan_amount >= 1000000:
            min_display = f"₹{self.min_loan_amount/1000000:.1f}M"
        elif self.min_loan_amount >= 1000:
            min_display = f"₹{self.min_loan_amount/1000:.0f}K"
        else:
            min_display = f"₹{self.min_loan_amount:.0f}"
                    
        return f"{min_display} - {max_display}"

    def interest_rate_display(self):
        """Return interest rate range in a readable format"""
        if self.min_interest_rate == self.max_interest_rate:
            return f"{self.min_interest_rate}%"
        else:
            return f"{self.min_interest_rate}% - {self.max_interest_rate}%"



class LoanApplication(models.Model):
    """Model for loan applications"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    # Link to user profile
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='loan_applications')
    
    # Additional personal details for loan (can override profile data if needed)
    first_name = models.CharField(max_length=100, blank=True)  # Can be populated from user profile
    last_name = models.CharField(max_length=100, blank=True)   # Can be populated from user profile
    email = models.EmailField(blank=True)                     # Can be populated from user profile
    phone = models.CharField(max_length=15, blank=True)       # Can be populated from user profile
    
    # Loan Details
    loan_product = models.ForeignKey(LoanProduct, on_delete=models.CASCADE, related_name='applications')
    requested_amount = models.DecimalField(max_digits=12, decimal_places=2)
    annual_income = models.DecimalField(max_digits=12, decimal_places=2)
    purpose = models.TextField()
    
    # Application Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    application_id = models.CharField(max_length=20, unique=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.application_id} - {self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        if not self.application_id:
            # Generate unique application ID
            import random
            import string
            self.application_id = 'LA' + ''.join(random.choices(string.digits, k=8))
        
        # Auto-populate from user profile if fields are empty
        if self.user_profile:
            if not self.first_name:
                self.first_name = self.user_profile.user.first_name
            if not self.last_name:
                self.last_name = self.user_profile.user.last_name
            if not self.email:
                self.email = self.user_profile.user.email
            if not self.phone:
                self.phone = self.user_profile.phone_number or ''
        
        super().save(*args, **kwargs)
    
    @property
    def full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.user_profile:
            return self.user_profile.user.get_full_name()
        return "Unknown"
    
    @property
    def applicant_email(self):
        return self.email or (self.user_profile.user.email if self.user_profile else '')
    
    @property
    def applicant_phone(self):
        return self.phone or (self.user_profile.phone_number if self.user_profile else '')


class LoanDocument(models.Model):
    """Model for loan application documents"""
    DOCUMENT_TYPES = [
        # Personal loan documents
        ('aadhar_card', 'Aadhar Card (Latest Downloaded)'),
        ('pan_card', 'PAN Card'),
        ('id_proof', 'ID Proof'),
        ('income_proof', 'Income Proof'),
        ('bank_statement', 'Bank Statement'),
        
        # Business loan specific documents
        ('udyam_certificate', 'Udyam Registration Certificate (Original Downloaded)'),
        ('gst_certificate', 'GST Certificate'),
        
        # General
        ('other', 'Other'),
    ]
    
    application = models.ForeignKey(LoanApplication, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    document_file = models.FileField(upload_to='loan_documents/')
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_mandatory = models.BooleanField(default=False)  # Optional field to mark mandatory documents
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.application.application_id} - {self.get_document_type_display()}"