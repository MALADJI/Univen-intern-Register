$baseUrl = "http://localhost:8082/api"
$ErrorActionPreference = "Stop"

try {
    # 1. Get Verification Code
    $email = "intern_notif_test_" + (Get-Random) + "@univen.ac.za"
    Write-Host "Testing with email: $email"
    
    $codeResponse = Invoke-RestMethod -Uri "$baseUrl/auth/send-verification-code" -Method Post -Body (@{email = $email } | ConvertTo-Json) -ContentType "application/json"
    $code = $codeResponse.code
    Write-Host "Got verification code: $code"

    # 2. Register Intern
    $registerBody = @{
        username         = $email
        password         = "Password123!"
        role             = "INTERN"
        verificationCode = $code
        department       = "ICT"
        name             = "Notification"
        surname          = "TestIntern"
    }
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body ($registerBody | ConvertTo-Json) -ContentType "application/json"
    Write-Host "Registered Intern: $($registerResponse.message)"

    # 3. Login as Admin
    # Assuming default admin exists
    $loginBody = @{
        username = "admin@univen.ac.za"
        password = "password"
    }
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body ($loginBody | ConvertTo-Json) -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Logged in as Admin."

    # 4. Check Notifications
    $notifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers @{Authorization = "Bearer $token" }
    
    # Filter for notification about this specific intern
    $found = $notifications | Where-Object { $_.message -match "Notification TestIntern" }
    
    if ($found) {
        Write-Host "SUCCESS: Notification found!"
        Write-Host "Message: $($found.message)"
        Write-Host "Type: $($found.type)"
    }
    else {
        Write-Host "FAILURE: Notification NOT found."
        Write-Host "Recent notifications:"
        $notifications | Select-Object -First 5 | Format-Table -Property message, type, created_at
    }

}
catch {
    Write-Host "Error occurred: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $respBody = $reader.ReadToEnd()
        Write-Host "Response Body: $respBody"
    }
}
