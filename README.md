# NEU Library Visitor Log

A modern, high-performance visitor tracking system for the New Era University Library, built with Next.js, Firebase, and Tailwind CSS.

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

## 📦 How to Push to GitHub

Follow these steps to upload your project to GitHub:

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
2. Give your repository a name (e.g., `neu-library-log`).
3. Click **Create repository**.
4. Copy the URL of your new repository (it looks like `https://github.com/your-username/your-repo.git`).

### 4. Link and Push to GitHub
Replace `<YOUR_REPOSITORY_URL>` with the URL you just copied:
```bash
git remote add origin <YOUR_REPOSITORY_URL>
git branch -M main
git push -u origin main
```

## 🔐 Administrative Access
- **Login**: Navigate to `/admin/login`.
- **Credentials**: Use your authorized NEU institutional email.
- **Features**: Real-time analytics, user management, and detailed visitor logs with export capabilities.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google & Email)
- **Styling**: Tailwind CSS & Shadcn UI
- **Icons**: Lucide React
- **Charts**: Recharts