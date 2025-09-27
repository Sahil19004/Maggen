# views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .models import *
import logging

logger = logging.getLogger(__name__)
@require_POST
@csrf_exempt
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        remember_me = data.get('remember_me', False)
        
        # Check if a user exists with this email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({
                'success': False, 
                'message': 'Invalid email or password.'
            }, status=400)
        
        # Authenticate user
        user = authenticate(request, username=user.username, password=password)
        
        if user is not None:
            login(request, user)
            
            # Set session expiry based on "remember me" selection
            if not remember_me:
                request.session.set_expiry(0)  # Session expires when browser closes
            else:
                # Session expires after 2 weeks (default is 2 weeks)
                request.session.set_expiry(1209600)  # 2 weeks in seconds
                
            return JsonResponse({
                'success': True, 
                'message': 'Login successful!'
            })
        else:
            return JsonResponse({
                'success': False, 
                'message': 'Invalid email or password.'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': 'An error occurred during login.'
        }, status=500)

@require_POST
@csrf_exempt
def signup_view(request):
    try:
        data = json.loads(request.body)
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        # Validation checks
        if not all([first_name, last_name, email, password, confirm_password]):
            return JsonResponse({
                'success': False, 
                'message': 'All fields are required.'
            }, status=400)
            
        if password != confirm_password:
            return JsonResponse({
                'success': False, 
                'message': 'Passwords do not match.'
            }, status=400)
            
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False, 
                'message': 'Email already exists.'
            }, status=400)
            
        if len(password) < 8:
            return JsonResponse({
                'success': False, 
                'message': 'Password must be at least 8 characters long.'
            }, status=400)
        
        # Create user
        username = email.split('@')[0]  # Use part of email as username
        # Ensure username is unique
        counter = 1
        original_username = username
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Log the user in
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            
        return JsonResponse({
            'success': True, 
            'message': 'Account created successfully!'
        })
            
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'message': 'An error occurred during registration.'
        }, status=500)

def logout_view(request):
    logout(request)
    return redirect('/')  # Replace 'home' with your actual home page name
# Create your views here. 
def indexpage(request): 
 loans=LoanProduct.objects.all()
 context={
     'loan':loans

 }
 print(loans)

 return render(request,'index.html',context)


@csrf_exempt
def submit_loan_application(request):
    if request.method == 'POST':
        try:
            # Get form data
            first_name = request.POST.get('firstName')
            last_name = request.POST.get('lastName')
            email = request.POST.get('email')
            phone = request.POST.get('phone')
            loan_product_id = request.POST.get('loanType')
            requested_amount = request.POST.get('requestedAmount')
            annual_income = request.POST.get('income')
            purpose = request.POST.get('purpose')
            
            # Get loan product
            try:
                loan_product = LoanProduct.objects.get(id=loan_product_id, is_active=True)
            except LoanProduct.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Invalid loan product selected'})
            
            user_profile = None
            application_data = {
                'loan_product': loan_product,
                'requested_amount': float(requested_amount),
                'annual_income': float(annual_income),
                'purpose': purpose
            }
            
            # Handle authenticated vs anonymous users
            if request.user.is_authenticated:
                try:
                    user_profile = UserProfile.objects.get(user=request.user)
                    application_data['user_profile'] = user_profile
                    
                    # Only add personal details if they're provided (override profile data)
                    if first_name:
                        application_data['first_name'] = first_name
                    if last_name:
                        application_data['last_name'] = last_name
                    if email:
                        application_data['email'] = email
                    if phone:
                        application_data['phone'] = phone
                        
                except UserProfile.DoesNotExist:
                    # Create user profile if it doesn't exist
                    user_profile = UserProfile.objects.create(
                        user=request.user,
                        phone_number=phone or ''
                    )
                    application_data['user_profile'] = user_profile
                    
            else:
                # For anonymous users, all personal details are required
                if not all([first_name, last_name, email, phone]):
                    return JsonResponse({
                        'success': False, 
                        'error': 'All personal details are required for guest applications'
                    })
                    
                application_data.update({
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'phone': phone
                })
            
            # Validate loan amount against product limits
            if hasattr(loan_product, 'min_loan_amount') and float(requested_amount) < loan_product.min_loan_amount:
                return JsonResponse({
                    'success': False, 
                    'error': f'Requested amount is below minimum limit of ₹{loan_product.min_loan_amount:,}'
                })
                
            if hasattr(loan_product, 'max_loan_amount') and float(requested_amount) > loan_product.max_loan_amount:
                return JsonResponse({
                    'success': False, 
                    'error': f'Requested amount exceeds maximum limit of ₹{loan_product.max_loan_amount:,}'
                })
            
            # Create loan application
            application = LoanApplication.objects.create(**application_data)
            
            # Handle file uploads with new document types
            document_mapping = {
                'aadharCard': 'aadhar_card',
                'panCard': 'pan_card',
                'incomeProof': 'income_proof',
                'bankStatement': 'bank_statement',
                'udyamCertificate': 'udyam_certificate',
                'gstCertificate': 'gst_certificate',
            }
            
            # Define mandatory documents based on loan category
            mandatory_docs = ['aadharCard', 'panCard']  # Always required
            
            # Add business-specific mandatory documents
            if loan_product.category and 'business' in loan_product.category.lower():
                mandatory_docs.append('udyamCertificate')
            
            uploaded_documents = []
            missing_mandatory = []
            
            # Check and process all uploaded documents
            for doc_field, doc_type in document_mapping.items():
                if doc_field in request.FILES:
                    file = request.FILES[doc_field]
                    
                    # Validate file size (e.g., max 10MB)
                    if file.size > 10 * 1024 * 1024:
                        return JsonResponse({
                            'success': False, 
                            'error': f'File {file.name} is too large. Maximum size is 10MB.'
                        })
                    
                    # Validate file type
                    allowed_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
                    file_extension = '.' + file.name.split('.')[-1].lower()
                    if file_extension not in allowed_extensions:
                        return JsonResponse({
                            'success': False, 
                            'error': f'File {file.name} has invalid format. Allowed: PDF, JPG, PNG'
                        })
                    
                    document = LoanDocument.objects.create(
                        application=application,
                        document_type=doc_type,
                        document_file=file,
                        original_filename=file.name,
                        is_mandatory=doc_field in mandatory_docs
                    )
                    uploaded_documents.append(document)
                    
                elif doc_field in mandatory_docs:
                    missing_mandatory.append(doc_field)
            
            # Check if all mandatory documents are uploaded
            if missing_mandatory:
                # Delete the application if mandatory documents are missing
                application.delete()
                doc_names = {
                    'aadharCard': 'Aadhar Card',
                    'panCard': 'PAN Card',
                    'udyamCertificate': 'Udyam Registration Certificate'
                }
                missing_names = [doc_names.get(doc, doc) for doc in missing_mandatory]
                return JsonResponse({
                    'success': False, 
                    'error': f'Missing mandatory documents: {", ".join(missing_names)}'
                })
            
            # Send confirmation email
            try:
                send_confirmation_email(application, uploaded_documents)
            except Exception as email_error:
                logger.error(f"Failed to send confirmation email: {str(email_error)}")
                # Don't fail the application submission if email fails
            
            return JsonResponse({
                'success': True, 
                'application_id': application.application_id,
                'message': 'Application submitted successfully! Confirmation email has been sent.',
                'documents_uploaded': len(uploaded_documents)
            })
            
        except Exception as e:
            logger.error(f"Error in loan application submission: {str(e)}")
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


def send_confirmation_email(application, uploaded_documents):
    """
    Send confirmation email to the applicant
    """
    try:
        # Email context data
        context = {
            'application': application,
            'uploaded_documents': uploaded_documents,
            'company_name': getattr(settings, 'COMPANY_NAME', 'Your Loan Company'),
            'company_email': getattr(settings, 'COMPANY_EMAIL', 'support@yourloancompany.com'),
            'company_phone': getattr(settings, 'COMPANY_PHONE', '+1-800-LOAN-HELP'),
            'company_address': getattr(settings, 'COMPANY_ADDRESS', '123 Finance Street, Money City, FC 12345'),
            'website_url': getattr(settings, 'WEBSITE_URL', 'https://yourloancompany.com'),
            'support_url': getattr(settings, 'SUPPORT_URL', 'https://yourloancompany.com/support'),
        }
        
        # Render email templates
        subject = f'Loan Application Confirmation - {application.application_id}'
        
        # HTML email content
        html_content = render_to_string('loan_confirmation.html', context)
        
        # Plain text email content (fallback)
        text_content = render_to_string('loan_confirmation.txt', context)
        
        # Create email message
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'sahil.kumar8800931@gmail.com'),
            to=[application.email],
            reply_to=[getattr(settings, 'COMPANY_EMAIL', 'sahil.kumar8800931@gmail.com')]
        )
        
        # Attach HTML version
        email.attach_alternative(html_content, "text/html")
        
        # Attach uploaded documents to email
        for document in uploaded_documents:
            try:
                if document.document_file:
                    email.attach_file(document.document_file.path)
            except Exception as attach_error:
                logger.warning(f"Could not attach document {document.original_filename}: {str(attach_error)}")
        
        # Send email
        email.send()
        logger.info(f"Confirmation email sent successfully to {application.email}")
        
    except Exception as e:
        logger.error(f"Error sending confirmation email: {str(e)}")
        raise

def get_loan_products_api(request):
    """API endpoint to get loan products for the modal"""
    loans = LoanProduct.objects.filter(is_active=True).values(
        'id', 'name', 'category', 'min_loan_amount', 'max_loan_amount'
    )
    return JsonResponse({'loans': list(loans)})

def userprofile(request):
    return render(request,'profile.html')