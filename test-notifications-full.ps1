$baseUrl = "http://localhost:8082/api"
$ErrorActionPreference = "Stop"

function Get-VerificationCode($email) {
    try {
        $codeResponse = Invoke-RestMethod -Uri "$baseUrl/auth/send-verification-code" -Method Post -Body (@{email = $email } | ConvertTo-Json) -ContentType "application/json"
        return $codeResponse.code
    }
    catch {
        Write-Host "Error getting code for $email : $_"
        throw $_
    }
}

function Register-User($email, $role, $name, $surname, $password) {
    $code = Get-VerificationCode -email $email
    Write-Host "Registering $role ($email) with code: $code"
    
    $body = @{
        username         = $email
        password         = $password
        role             = $role
        verificationCode = $code
        department       = "ICT"
        name             = $name
        surname          = $surname
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body ($body | ConvertTo-Json) -ContentType "application/json"
        Write-Host "Registered $role : $($response.message)"
        return $response
    }
    catch {
        Write-Host "Error registering $email : $_"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Register Error Body: $($reader.ReadToEnd())"
        }
        throw $_
    }
}

function Login-User($username, $password) {
    $body = @{
        username = $username
        password = $password
    }
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body ($body | ConvertTo-Json) -ContentType "application/json"
        Write-Host "Logged in as $username"
        return $response.token
    }
    catch {
        Write-Host "Failed to login as $username : $_"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Login Error Body: $($reader.ReadToEnd())"
        }
        throw $_
    }
}

function Check-Notification($token, $matchString, $userType) {
    $notifications = Invoke-RestMethod -Uri "$baseUrl/notifications" -Method Get -Headers @{Authorization = "Bearer $token" }
    $found = $notifications | Where-Object { $_.message -match $matchString }
    
    if ($found) {
        Write-Host "SUCCESS ($userType): Found notification matching '$matchString'"
        Write-Host "   -> $($found.message)"
    }
    else {
        Write-Host "FAILURE ($userType): Did NOT find notification matching '$matchString'"
        Write-Host "Recent notifications for $userType :"
        $notifications | Select-Object -First 5 | Format-Table -Property message, type, created_at
    }
}

try {
    $suffix = (Get-Random)
    $internEmail = "intern_final_$suffix@univen.ac.za"
    $adminEmail = "admin_final_$suffix@univen.ac.za"
    $superAdminEmail = "superadmin_final_$suffix@univen.ac.za"
    $password = "Password123!"

    # 1. Register SuperAdmin (Receives Admin First Login)
    $null = Register-User -email $superAdminEmail -role "SUPER_ADMIN" -name "Super" -surname "Admin" -password $password

    # 2. Register Admin (Receives Intern Sign Up)
    $null = Register-User -email $adminEmail -role "ADMIN" -name "Admin" -surname "Test" -password $password

    # 3. Register Intern (Triggers Notification)
    $null = Register-User -email $internEmail -role "INTERN" -name "Intern" -surname "Test" -password $password

    # 4. Login as Admin (Triggers First Login Notification, Checks Intern Notif)
    $adminToken = Login-User -username $adminEmail -password $password
    
    # Check for Intern Notification (Should see "New Intern registered: Intern Test")
    Write-Host "Checking Admin's notifications..."
    Check-Notification -token $adminToken -matchString "New Intern registered: Intern Test" -userType "ADMIN"

    # 5. Login as SuperAdmin (Checks Admin First Login Notif)
    $superAdminToken = Login-User -username $superAdminEmail -password $password
    
    # Check for Admin First Login Notification (Should see "Admin ... has logged in for the first time")
    Write-Host "Checking SuperAdmin's notifications..."
    Check-Notification -token $superAdminToken -matchString "Admin $adminEmail has logged in for the first time" -userType "SUPER_ADMIN"

}
catch {
    Write-Host "Test Script Failed: $_"
}
