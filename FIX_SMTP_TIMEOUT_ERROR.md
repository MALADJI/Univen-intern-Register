# Fix: SMTP Connection Timeout Error

## 🔍 Error

```
FAILED TO SEND EMAIL: Mail server connection failed. 
Failed messages: jakarta.mail.MessagingException: Exception reading response;
nested exception is: java.net.SocketTimeoutException: Read timed out
```

## 🔍 What This Means

The application is trying to connect to the SMTP server (`smtp.office365.com`) but the connection is timing out. This could be due to:

1. **Wrong SMTP host** - Office 365 might not be the correct server
2. **Firewall blocking** - Port 587 might be blocked
3. **Network issues** - Connection problems
4. **Timeout too short** - Current timeout is 5 seconds (too short)
5. **Office 365 requires different settings** - May need different port or SSL

---

## ✅ Solution 1: Increase Timeout Settings

The current timeout is 5 seconds, which might be too short. Let's increase it:

### Update `application.properties`:

```properties
# Increase timeout settings
spring.mail.properties.mail.smtp.connectiontimeout=30000
spring.mail.properties.mail.smtp.timeout=30000
spring.mail.properties.mail.smtp.writetimeout=30000
```

This changes from 5 seconds (5000ms) to 30 seconds (30000ms).

---

## ✅ Solution 2: Try Different SMTP Settings

### Option A: Try Univen's SMTP Server

If Office 365 doesn't work, try Univen's own SMTP server:

```properties
spring.mail.host=smtp.univen.ac.za
spring.mail.port=587
```

**Or try port 25:**
```properties
spring.mail.host=smtp.univen.ac.za
spring.mail.port=25
```

### Option B: Try Office 365 with SSL (Port 465)

```properties
spring.mail.host=smtp.office365.com
spring.mail.port=465
spring.mail.properties.mail.smtp.ssl.enable=true
spring.mail.properties.mail.smtp.starttls.enable=false
```

### Option C: Try Outlook SMTP

```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
```

---

## ✅ Solution 3: Check Firewall/Network

1. **Test SMTP connection manually:**
   ```powershell
   Test-NetConnection -ComputerName smtp.office365.com -Port 587
   ```

2. **If connection fails:**
   - Check if your firewall is blocking port 587
   - Check if your network allows SMTP connections
   - Try from a different network

3. **Contact Univen IT:**
   - Ask for the correct SMTP server settings
   - Ask if port 587 is open
   - Ask if they use Office 365 or their own mail server

---

## ✅ Solution 4: Update MailConfig with Better Error Handling

Let's update the MailConfig to have better timeout settings and error handling.

---

## 🧪 Testing Steps

1. **Update timeout settings** (Solution 1)
2. **Restart application**
3. **Try sending email again**
4. **If still fails, try different SMTP host** (Solution 2)
5. **Check network connection** (Solution 3)

---

## 📋 Quick Fix Checklist

- [ ] Increase timeout to 30 seconds
- [ ] Try `smtp.univen.ac.za` instead of `smtp.office365.com`
- [ ] Test network connection to SMTP server
- [ ] Contact Univen IT for correct SMTP settings
- [ ] Try port 465 with SSL
- [ ] Check firewall settings

---

## 🔧 Recommended Actions

**Immediate:**
1. Increase timeout settings (Solution 1)
2. Try Univen's SMTP server (Solution 2, Option A)
3. Contact Univen IT for correct SMTP settings

**If still not working:**
- Try different ports (25, 465, 587)
- Try SSL instead of STARTTLS
- Check if you need an App Password for Office 365

