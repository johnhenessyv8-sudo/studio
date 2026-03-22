# 📚 NEU Library Visitor Log System

A modern, high-performance visitor tracking and management platform designed specifically for the **New Era University (NEU) Library**. Built with Next.js 15, Firebase, and Tailwind CSS, this system replaces traditional manual logbooks with a secure, data-driven digital solution.

## 🌟 Overview

The **NEU Library Visitor Log** streamlines the entry process for students and faculty while providing administrators with powerful real-time analytics. By digitizing visitor records, the library can now monitor footfall patterns, department-specific usage, and visit purposes with surgical precision.

## ✨ Key Features

### 🏁 Visitor Portal
- **Swift Check-in**: A clean, mobile-responsive interface for visitors to log their entry in seconds.
- **Purpose Selection**: Categories like Research, Assignments, or Computer Use to track library resource utilization.
- **Institutional Validation**: Restricts entries to valid `@neu.edu.ph` email addresses to ensure data integrity.

### 📊 Admin Dashboard
- **Real-time Analytics**: Visual insights into library traffic using dynamic charts (Traffic by College, Purpose Breakdown).
- **Footfall Stats**: Instant view of daily, weekly, and monthly visitor counts.
- **Live Feed**: See the latest check-ins as they happen.

### 🛡️ Account Management
- **Role-Based Access**: Granular control for Admins and Librarians.
- **Profile Management**: Create, edit, or block user accounts directly from the portal.
- **Security**: Built-in password reset and account status toggles.

### 📋 Detailed Logs & Reporting
- **Enriched Logs**: Automatically cross-references visitor emails with student/staff IDs and Colleges.
- **Advanced Filtering**: Search by ID, Email, College, or Date ranges.
- **Excel Export**: Generate comprehensive CSV reports for institutional documentation with a single click.

## 💡 How It Helps NEU
- **Efficiency**: Eliminates long queues and manual data entry errors.
- **Data-Driven Decisions**: Helps the library justify budget allocations and operating hours based on actual usage data.
- **Security**: Ensures only authorized university members are recorded in the system.
- **Sustainability**: Reduces paper waste by moving the entire logging process to the cloud.

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) to view the app.

---

## 📦 How to Push to GitHub

Follow these exact steps to upload your project to your GitHub account:

### 1. Initialize Git locally
Open your terminal in the project folder and run:
```bash
git init
```

### 2. Stage and Commit your files
```bash
git add .
git commit -m "Initial commit: NEU Library Visitor Log System"
```

### 3. Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `neu-library-log`).
3. **Important**: Do NOT check "Initialize this repository with a README".
4. Click **Create repository**.
5. Copy the URL of your new repository (it looks like `https://github.com/your-username/your-repo.git`).

### 4. Link and Push to GitHub
Replace `<YOUR_REPOSITORY_URL>` with the URL you just copied:
```bash
git remote add origin <YOUR_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore (Real-time NoSQL)
- **Auth**: Firebase Authentication (Google & Email/Password)
- **Styling**: Tailwind CSS & Shadcn UI
- **Icons**: Lucide React
- **Charts**: Recharts
