# 🚀 BizMap Deployment Guide

## Quick Deploy to Real Website

### **Frontend (Vercel) - FREE**
1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Import your repository**
4. **Deploy automatically** - Vercel will detect it's a Vite React app
5. **Get your URL** - You'll get something like `https://bizmap-abc123.vercel.app`

### **Backend (Railway) - FREE**
1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project**
4. **Connect your repository**
5. **Select the `backend` folder**
6. **Deploy automatically**
7. **Get your URL** - You'll get something like `https://bizmap-backend-production.up.railway.app`

### **Update Frontend to Use Production Backend**
1. **Update `vercel.json`** with your Railway backend URL
2. **Update API calls** in frontend to use production URL
3. **Redeploy frontend**

## **Alternative: All-in-One Deploy (Easier)**

### **Netlify + Netlify Functions**
1. **Go to [netlify.com](https://netlify.com)**
2. **Connect GitHub repository**
3. **Build settings:**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
4. **Deploy!**

## **Environment Variables Needed**

### **Backend (.env)**
```
NODE_ENV=production
PORT=4000
OPENAI_API_KEY=your_openai_key_here
```

### **Frontend (.env)**
```
VITE_API_URL=https://your-backend-url.railway.app
```

## **After Deployment**
- ✅ Your site will be live at a real URL
- ✅ People can access it from anywhere
- ✅ QR code will work for feedback
- ✅ All features will work in production

## **Cost: $0** (Free tiers are sufficient for demo/startup)
