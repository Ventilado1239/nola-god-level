import { createBrowserRouter } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import { lazy, Suspense } from "react";
import Skeleton from "@/components/ui/Skeleton";
import HomeRedirect from "@/pages/HomeRedirect";

const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const ExplorePage = lazy(() => import("@/features/explore/ExplorePage"));

function Loader() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 mb-4" />
      <Skeleton className="h-72" />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loader />}>
            <DashboardPage />
          </Suspense>
        )
      },
      {
        path: "explore",
        element: (
          <Suspense fallback={<Loader />}>
            <ExplorePage />
          </Suspense>
        )
      }
    ]
  }
]);
