# Email Configuration Guide

## 📧 Current Status

**Email is currently DISABLED by default** (`mail.enabled=false` in `application.properties`).

The verification codes are:
- ✅ **Shown in popup on frontend** (for testing)
- ✅ **Displayed in backend console** (for testing)
- ❌ **NOT sent via email** (until configured)

## 🔧 How to Enable Email

### Step 1: Update `application.properties`

Edit: `C:\Users\kulani.baloyi\Downloads\intern-register\src\main\resources\application.properties`

#### For Gmail:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password  # Use App Password, not regular password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

mail.from.address=your-email@gmail.com
mail.enabled=true  # Change to true
```

#### For Outlook/Office 365:
```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

mail.from.address=your-email@outlook.com
mail.enabled=true
```

#### For Custom SMTP:
```properties
spring.mail.host=your-smtp-server.com
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

mail.from.address=noreply@yourdomain.com
mail.enabled=true
```

### Step 2: Gmail App Password Setup

If using Gmail, you need to:
1. Enable 2-Factor Authentication on your Google account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an "App Password" (16 characters)
4. Use this App Password in `spring.mail.password` (NOT your regular Gmail password)

### Step 3: Restart Backend

After updating `application.properties`, restart the backend:
```bash
cd C:\Users\kulani.baloyi\Downloads\intern-register
./mvnw spring-boot:run
```

## ✅ Testing Email

1. Try sign-up or forgot password
2. Check your email inbox (and spam folder)
3. If email fails, check backend console for error messages
4. Codes will still be shown in popup as fallback

## 🔍 Troubleshooting

### Email not sending?
- Check `mail.enabled=true` in application.properties
- Verify SMTP credentials are correct
- For Gmail: Use App Password, not regular password
- Check backend console for error messages
- Check spam/junk folder

### Still seeing codes in popup?
- This is normal! Codes are shown in popup AND sent via email
- Check your email inbox for the actual email

### SMTP connection timeout?
- Check firewall settings
- Verify SMTP host and port are correct
- Some networks block SMTP ports (587, 465)

## 📝 Notes

- **For Development/Testing:** Keep `mail.enabled=false` and use the popup codes
- **For Production:** Set `mail.enabled=true` and configure proper SMTP
- Codes are always shown in popup as a fallback for testing

