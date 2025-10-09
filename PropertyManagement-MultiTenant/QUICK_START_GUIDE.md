# ⚡ Quick Start Guide - 10 Minutes to Running System

## 🎯 Goal
Get the backend API running and test the multi-tenant authentication in **10 minutes**.

---

## ✅ Prerequisites Check

Before starting, verify you have:
- [ ] SQL Server installed and running
- [ ] .NET 8 SDK installed (`dotnet --version` should show 8.x)
- [ ] Node.js installed (`node --version` should show v18+)
- [ ] A code editor (VS Code or Visual Studio)

---

## 🚀 Steps

### Step 1: Configure Database (2 minutes)

1. Open `Backend/PropertyManagement.API/appsettings.json`

2. Update the connection string:

**For Windows Authentication:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PropertyManagementDB;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

**For SQL Authentication:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PropertyManagementDB;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```

Replace:
- `localhost` with your SQL Server name if different
- `YOUR_USERNAME` and `YOUR_PASSWORD` if using SQL auth

---

### Step 2: Create Database (2 minutes)

Open terminal/command prompt:

```bash
# Navigate to backend folder
cd PropertyManagement-MultiTenant/Backend

# Create migration
dotnet ef migrations add InitialCreate --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API

# Apply to database (creates database and tables)
dotnet ef database update --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API
```

**Expected Output:**
```
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
...
Applying migration 'InitialCreate'.
Done.
```

---

### Step 3: Run the API (1 minute)

```bash
cd PropertyManagement.API
dotnet run
```

**Expected Output:**
```
Now listening on: https://localhost:5001
Now listening on: http://localhost:5000
```

✅ **API is running!** Keep this terminal open.

---

### Step 4: Test with Swagger (5 minutes)

1. **Open Swagger UI:**
   - Browser: `https://localhost:5001`
   - You should see the API documentation

2. **Register Your Company:**
   - Click on **POST /api/auth/register-company**
   - Click **"Try it out"**
   - Paste this JSON (modify as needed):

```json
{
  "companyName": "My Real Estate Company",
  "description": "Test company for property management",
  "industry": "Real Estate",
  "contactEmail": "admin@mycompany.com",
  "contactPhone": "+1-555-0100",
  "address": "123 Main Street",
  "city": "Dubai",
  "country": "UAE",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "adminEmail": "john.doe@mycompany.com",
  "adminUsername": "johndoe",
  "adminPassword": "MyPass123!",
  "adminPasswordConfirm": "MyPass123!"
}
```

   - Click **"Execute"**
   - **SAVE YOUR COMPANY CODE!** (e.g., "MYRE5678")

3. **Login:**
   - Click on **POST /api/auth/login**
   - Click **"Try it out"**
   - Use your company code:

```json
{
  "companyCode": "MYRE5678",
  "username": "johndoe",
  "password": "MyPass123!"
}
```

   - Click **"Execute"**
   - **COPY THE TOKEN** from the response

4. **Authorize:**
   - Click the **"Authorize"** button (🔒 lock icon) at top
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click **"Authorize"**, then **"Close"**

5. **Test Protected Endpoint:**
   - Try **GET /api/auth/me**
   - Should return your user information
   - Try **GET /api/properties**
   - Should return empty array (no properties yet)

---

## 🎉 Success!

If you got this far, you have:
- ✅ Database created with multi-tenant schema
- ✅ Company registered with unique code
- ✅ User authenticated with JWT token
- ✅ Protected API endpoints working
- ✅ Multi-tenant system operational

---

## 🧪 Testing Multi-Tenancy

### Create a Second Company:

1. **Register Another Company** (different details):
```json
{
  "companyName": "Second Property Co",
  "contactEmail": "admin@secondco.com",
  "adminFirstName": "Jane",
  "adminLastName": "Smith",
  "adminEmail": "jane@secondco.com",
  "adminUsername": "janesmith",
  "adminPassword": "Pass123!",
  "adminPasswordConfirm": "Pass123!"
}
```

2. **Save the new company code** (e.g., "SECO4567")

3. **Login as second company:**
```json
{
  "companyCode": "SECO4567",
  "username": "janesmith",
  "password": "Pass123!"
}
```

4. **Create properties for each company** and verify:
   - Company 1 cannot see Company 2's properties
   - Company 2 cannot see Company 1's properties
   - ✅ Data isolation working!

---

## 🔍 Troubleshooting

### Problem: "Unable to connect to SQL Server"

**Solutions:**
- Check SQL Server is running (services.msc)
- Verify connection string
- Try `localhost` or `(localdb)\MSSQLLocalDB` or your actual server name
- Ensure SQL Server Browser service is running

### Problem: "dotnet ef not found"

**Solution:**
```bash
dotnet tool install --global dotnet-ef
dotnet tool update --global dotnet-ef
```

### Problem: "Build failed"

**Solution:**
```bash
cd Backend
dotnet restore
dotnet build
```

### Problem: Migration already exists

**Solution:**
```bash
# Remove existing migration
dotnet ef migrations remove --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API

# Create new migration
dotnet ef migrations add InitialCreate --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API
```

### Problem: "Cannot drop database because it's in use"

**Solution:**
```bash
# Close all connections and try again
dotnet ef database drop --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API --force

# Then update
dotnet ef database update --project PropertyManagement.Infrastructure --startup-project PropertyManagement.API
```

---

## 📝 Next Steps

Now that your backend is running:

### Option A: Build Frontend
```bash
cd ../Frontend/property-management-app
npm install
ng serve
```
Visit: `http://localhost:4200`

### Option B: Continue Testing API
Use Swagger UI to:
- Create properties
- Test different user roles
- Verify multi-tenant isolation

### Option C: Add More Controllers
- Create LeadsController
- Create CustomersController
- Create ReservationsController

---

## 🎯 Key Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register-company` | Register new company | ❌ No |
| POST | `/api/auth/login` | User login | ❌ No |
| GET | `/api/auth/validate-company-code/{code}` | Check company code | ❌ No |
| GET | `/api/auth/me` | Get current user | ✅ Yes |
| GET | `/api/properties` | List properties | ✅ Yes |
| GET | `/api/properties/{id}` | Get property | ✅ Yes |
| POST | `/api/properties` | Create property | ✅ Yes |
| PUT | `/api/properties/{id}` | Update property | ✅ Yes |
| DELETE | `/api/properties/{id}` | Delete property | ✅ Yes |
| GET | `/api/properties/statistics` | Property stats | ✅ Yes |

---

## 📚 Sample Requests

### Create a Property:
```json
POST /api/properties
{
  "title": "Luxury Villa in Palm Jumeirah",
  "description": "Stunning 5-bedroom villa with sea view",
  "propertyType": "Villa",
  "status": "Available",
  "price": 3500000,
  "currency": "AED",
  "size": 450,
  "bedrooms": 5,
  "bathrooms": 6,
  "location": "Palm Jumeirah",
  "project": "Palm Project",
  "island": "Palm Island"
}
```

### Filter Properties:
```
GET /api/properties?status=Available&type=Villa&page=1&pageSize=10
```

---

## 🎓 What You Learned

1. ✅ How to set up .NET 8 Web API
2. ✅ Entity Framework Core migrations
3. ✅ Multi-tenant database design
4. ✅ JWT authentication
5. ✅ Testing APIs with Swagger
6. ✅ Company-based data isolation

---

## ⏱️ Time Breakdown

- Database Setup: **2 minutes**
- Migration & Database Creation: **2 minutes**
- Running API: **1 minute**
- Testing with Swagger: **5 minutes**
- **Total: ~10 minutes** ⚡

---

## 🚀 You're Ready!

The backend is fully operational. Now you can:
1. Build the Angular frontend
2. Add more API controllers
3. Deploy to production
4. Customize for your needs

**Happy Coding!** 🎉

---

**Need Help?** Check:
- `README.md` - Full documentation
- `IMPLEMENTATION_STATUS.md` - Detailed features & next steps
- `PROJECT_SUMMARY.md` - Complete project overview

