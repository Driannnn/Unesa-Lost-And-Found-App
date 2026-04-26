import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { LoginScreen } from "./components/screens/LoginScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { ReportScreen } from "./components/screens/ReportScreen";
import { MatchDetailsScreen } from "./components/screens/MatchDetailsScreen";
import { ChatScreen } from "./components/screens/ChatScreen";
import { DashboardScreen } from "./components/screens/DashboardScreen";
import { AdminLoginScreen } from "./components/screens/AdminLoginScreen";
import { AdminDashboardScreen } from "./components/screens/AdminDashboardScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LoginScreen },
      { path: "home", Component: HomeScreen },
      { path: "dashboard", Component: DashboardScreen },
      { path: "report/:type", Component: ReportScreen },
      { path: "match/:id", Component: MatchDetailsScreen },
      { path: "chat/:id", Component: ChatScreen },
      { path: "admin", Component: AdminLoginScreen },
      { path: "admin/dashboard", Component: AdminDashboardScreen },
    ],
  },
]);
