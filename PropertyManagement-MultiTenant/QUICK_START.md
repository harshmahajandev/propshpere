# ⚡ Quick Start Guide - PropertyManagement-MultiTenant

**Last Updated:** October 13, 2025

---

## ✅ Applications Started in Separate Windows!

### **You should now see TWO new PowerShell windows:**

### **Window 1: Backend API (.NET 8)** 🔧
- Building and starting...
- Will show: `Now listening on: https://localhost:5001`
- **Leave this window open!**

### **Window 2: Frontend App (Angular)** 🎨
- Building and starting...
- Will show: `Local: http://localhost:4200/`
- **Browser will open automatically!**
- **Leave this window open!**

---

## 🚀 Access URLs

### **Main Application (Frontend)**
**http://localhost:4200**

### **API Documentation (Swagger)**
**https://localhost:5001/swagger**

---

## 📋 What to Do Now

### **1. Wait for Applications to Start** (30-60 seconds)

Watch the PowerShell windows for these messages:

**Backend Window:**
```
Now listening on: https://localhost:5001
Application started. Press Ctrl+C to shut down.
```

**Frontend Window:**
```
✔ Compiled successfully.
Local:   http://localhost:4200/
```

### **2. Browser Should Open Automatically**

If it doesn't, manually open:
**http://localhost:4200**

### **3. Register Your Company**

1. Click **"Register"** on the login page
2. Fill in the form:
   - **Company Name:** Your Company Name
   - **Contact Email:** company@example.com
   - **Admin First Name:** John
   - **Admin Last Name:** Doe
   - **Admin Email:** admin@company.com
   - **Admin Username:** admin
   - **Admin Password:** Admin123! (minimum 6 chars)
   - **Confirm Password:** Admin123!
3. Click **"Register Company"**
4. **⚠️ SAVE THE COMPANY CODE!** You'll see it on screen
5. You'll be redirected to login after 5 seconds

### **4. Login**

1. Enter your **Company Code** (from step 3)
2. Enter your **Username** (e.g., admin)
3. Enter your **Password** (e.g., Admin123!)
4. Click **"Login"**

### **5. Explore the Dashboard!** 🎉

You'll see:
- ✅ 8 KPI Cards (Properties, Customers, Revenue, etc.)
- ✅ Recent Activities Timeline
- ✅ Quick Stats with Progress Bars
- ✅ Quick Actions Panel

---

## 🎯 Available Features

### **Dashboard** 📊
- Real-time statistics
- 8 KPI cards
- Recent activities
- Quick actions

### **Property Management** 🏠
- Click **"Properties"** in the sidebar
- Toggle between **Grid** and **Table** views
- **Search** properties
- **Filter** by Status and Type
- **Add** new properties
- **Edit** existing properties
- **Delete** properties

### **Navigation** 🧭
- **Dashboard** - Home page with stats
- **Properties** - Property management
- **Customers** - (Coming soon)
- **Invoices** - (Coming soon)
- **Maintenance** - (Coming soon)
- **Analytics** - (Admin/Manager only)

---

## 🔧 Troubleshooting

### **If Backend Window Shows Errors:**

1. Check if SQL Server is running
2. Update connection string in:
   ```
   PropertyManagement-MultiTenant/Backend/PropertyManagement.API/appsettings.json
   ```
3. Close the window and restart:
   ```powershell
   cd PropertyManagement-MultiTenant/Backend/PropertyManagement.API
   dotnet run
   ```

### **If Frontend Window Shows Errors:**

1. Close the window
2. Open new PowerShell as Administrator
3. Run:
   ```powershell
   cd PropertyManagement-MultiTenant/Frontend/property-management-app
   npm install
   ng serve --open
   ```

### **If Browser Doesn't Open:**

Manually open: **http://localhost:4200**

### **If You See "Connection Refused":**

- Wait 30 more seconds (still starting)
- Check if both PowerShell windows are still running
- Look for error messages in the windows

---

## 🛑 How to Stop the Applications

### **To Stop:**
1. Go to each PowerShell window
2. Press **Ctrl+C**
3. Close the windows

### **Or Kill All Processes:**
```powershell
# Stop Backend
taskkill /F /IM dotnet.exe

# Stop Frontend  
taskkill /F /IM node.exe
```

---

## 🔄 How to Restart

### **Method 1: Using the Windows**
1. Stop both applications (Ctrl+C in each window)
2. Press ↑ (up arrow) to get last command
3. Press Enter to restart

### **Method 2: New Terminal**
```powershell
# Backend
cd PropertyManagement-MultiTenant/Backend/PropertyManagement.API
dotnet run

# Frontend (new terminal)
cd PropertyManagement-MultiTenant/Frontend/property-management-app
ng serve --open
```

---

## 📝 Important Notes

### **Mock Data:**
The frontend currently uses **mock data** for:
- Dashboard statistics
- Property listings
- Recent activities

To use real data:
1. Configure SQL Server connection in `appsettings.json`
2. Run database migrations
3. Register and login
4. Data will be saved to database

### **Available Controllers:**
- ✅ **AuthController** - Authentication & Registration
- ✅ **PropertiesController** - Property CRUD

### **Under Development:**
- ⏳ DashboardController
- ⏳ LeadsController
- ⏳ CustomersController
- ⏳ ReservationsController
- ⏳ InvoicesController

---

## 🎨 What You'll See

### **Login Page**
- Beautiful gradient design
- Company Code + Username + Password fields
- Link to Registration page

### **Registration Page**
- Two sections: Company Info + Admin User
- Form validation
- Company code generation
- Success message with code display

### **Dashboard**
- 8 colorful KPI cards
- Recent activities timeline
- Quick stats with progress bars
- Quick action buttons

### **Properties Page**
- Grid and Table view toggle
- Search bar
- Status and Type filters
- Beautiful property cards with images
- Add/Edit/Delete actions

---

## 🆘 Need Help?

### **Common Issues:**

**"Cannot find module"**
→ Run: `npm install` in frontend folder

**"Build failed"**
→ Run: `dotnet build` in backend folder

**"Port already in use"**
→ Kill existing processes and restart

**"Database connection failed"**
→ Check SQL Server and connection string

---

## ✅ Success Checklist

- [ ] Backend PowerShell window is running
- [ ] Frontend PowerShell window is running
- [ ] Browser opened to http://localhost:4200
- [ ] Can see login page
- [ ] Registered company successfully
- [ ] Saved company code
- [ ] Logged in successfully
- [ ] Can see dashboard
- [ ] Can navigate to Properties
- [ ] Can add/edit properties

---

## 🎉 You're All Set!

Your **PropertyManagement-MultiTenant** application is now running!

### **Main URLs:**
- **App:** http://localhost:4200
- **API:** https://localhost:5001/swagger

### **Next Steps:**
1. ✅ Register your company
2. ✅ Save company code
3. ✅ Login
4. ✅ Explore dashboard
5. ✅ Manage properties
6. ✅ Enjoy! 🚀

---

**Happy Property Managing!** 🏠✨

