import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// System Layouts (containing <Outlet />)
import { MainLayout } from "@/layouts/MainLayout";
import { HomeLayout } from "@/layouts/HomeLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { LandlordLayout } from "@/layouts/LandlordLayout";

// Route Security Guard
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

// Landing Page
import { HomePage } from "@/pages/HomePage";

// App Pages (HomeLayout + AppHeader)
import { AppHomePage } from "@/pages/AppHomePage";
import { PropertyListPage } from "@/features/properties/pages/PropertyListPage";
import { PropertyDetailPage } from "@/features/properties/pages/PropertyDetailPage";
import { PropertyComparePage } from "@/features/properties/pages/PropertyComparePage";
import { PostListingPage } from "@/features/listings/pages/PostListingPage";

// Auth
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";

// Admin Pages (protected, role=admin)
import { AdminOverviewPage } from "@/features/admin/pages/AdminOverviewPage";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { AdminPropertiesPage } from "@/features/admin/pages/AdminPropertiesPage";
import { AdminReportsPage } from "@/features/admin/pages/AdminReportsPage";

// Landlord Pages (protected, role=landlord)
import { LandlordOverviewPage } from "@/features/landlord/pages/LandlordOverviewPage";
import { LandlordRoomsPage } from "@/features/landlord/pages/LandlordRoomsPage";
import { LandlordTenantsPage } from "@/features/landlord/pages/LandlordTenantsPage";
import { LandlordPostPage } from "@/features/landlord/pages/LandlordPostPage";
import { LandlordTicketsPage } from "@/features/tickets/pages/LandlordTicketsPage";

// User Pages
import { MyPropertiesPage } from "@/features/user/pages/MyPropertiesPage";

// Blog Pages
import { BlogLayout } from "@/features/blog/layouts/BlogLayout";
import { BlogPage } from "@/features/blog/pages/BlogPage";
import { ArticleListPage } from "@/features/blog/pages/ArticleListPage";
import { ArticleDetailPage } from "@/features/blog/pages/ArticleDetailPage";
import { ListingPostsPage } from "@/features/blog/pages/ListingPostsPage";

import { NotFoundPage } from "@/pages/NotFoundPage";

/**
 * CẤU HÌNH ĐỊNH TUYẾN ỨNG DỤNG — MULTI-ROLE
 *
 * Mỗi nhóm route có layout riêng:
 * - /              → MainLayout  (Landing page — Header cũ)
 * - /home, /properties, /post-listing → HomeLayout (AppHeader mới)
 * - /auth/*        → AuthLayout
 * - /dashboard/*   → DashboardLayout (protected, role=user)
 * - /admin/*       → AdminLayout     (protected, role=admin)
 * - /landlord/*    → LandlordLayout  (protected, role=landlord)
 */
const router = createBrowserRouter([

  // ─── 1. LANDING PAGE ─────────────────────────────────────────────────────
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
    ],
  },

  // ─── 2. APP HOME ─────────────────────────────────────────────────────────
  {
    path: "/home",
    element: <HomeLayout />,
    children: [
      { index: true, element: <AppHomePage /> },
    ],
  },

  // ─── 3. PROPERTIES ───────────────────────────────────────────────────────
  {
    path: "/properties",
    element: <HomeLayout />,
    children: [
      { index: true, element: <PropertyListPage /> },
      { path: "compare", element: <PropertyComparePage /> },
      { path: ":id", element: <PropertyDetailPage /> },
    ],
  },

  // ─── 4. POST LISTING ─────────────────────────────────────────────────────
  {
    path: "/post-listing",
    element: <HomeLayout />,
    children: [
      { index: true, element: <PostListingPage /> },
    ],
  },

  // ─── 5. CONVENIENCE ALIASES ──────────────────────────────────────────────
  {
    path: "/mua-ban",
    element: <Navigate to="/properties?type=buy" replace />,
  },
  {
    path: "/cho-thue",
    element: <Navigate to="/properties?type=rent" replace />,
  },
  {
    path: "/favorites",
    element: <HomeLayout />,
    children: [{ index: true, element: <AppHomePage /> }],
  },
  {
    path: "/blog",
    element: <HomeLayout />,
    children: [
      {
        element: <BlogLayout />,
        children: [
          { index: true, element: <BlogPage /> },
          { path: "articles", element: <ArticleListPage /> },
          { path: "articles/:slug", element: <ArticleDetailPage /> },
          { path: "listings", element: <ListingPostsPage /> },
        ],
      },
    ],
  },

  // ─── 6. AUTH ROUTES ──────────────────────────────────────────────────────
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },

  // ─── 7. USER PROTECTED ROUTES ──────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRole="user" />,
    children: [
      {
        path: "/my-properties",
        element: <HomeLayout />,
        children: [
          { index: true, element: <MyPropertiesPage /> },
        ],
      },
    ],
  },

  // ─── 8. ADMIN DASHBOARD (role=admin) ─────────────────────────────────────
  {
    element: <ProtectedRoute allowedRole="admin" />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "properties", element: <AdminPropertiesPage /> },
          { path: "listings", element: <AdminPropertiesPage /> },
          { path: "reports", element: <AdminReportsPage /> },
          { path: "settings", element: <AdminOverviewPage /> },
        ],
      },
    ],
  },

  // ─── 9. LANDLORD DASHBOARD (role=landlord) ───────────────────────────────
  {
    element: <ProtectedRoute allowedRole="landlord" />,
    children: [
      {
        path: "/landlord",
        element: <LandlordLayout />,
        children: [
          { index: true, element: <LandlordOverviewPage /> },
          { path: "rooms", element: <LandlordRoomsPage /> },
          { path: "tenants", element: <LandlordTenantsPage /> },
          { path: "payments", element: <LandlordOverviewPage /> },
          { path: "post", element: <LandlordPostPage /> },
          { path: "chat", element: <LandlordOverviewPage /> },
          { path: "maintenance", element: <LandlordTicketsPage /> },
        ],
      },
    ],
  },

  // ─── 10. CATCH-ALL 404 ───────────────────────────────────────────────────
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
