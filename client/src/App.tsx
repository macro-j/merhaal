import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PlanTrip from "./pages/PlanTrip";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Guides from "./pages/Guides";
import Support from "./pages/Support";
import Packages from "./pages/Packages";
import MyPlans from "./pages/MyPlans";
import TripDetails from "./pages/TripDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCities from "./pages/admin/AdminCities";
import AdminActivities from "./pages/admin/AdminActivities";
import AdminAccommodations from "./pages/admin/AdminAccommodations";
import AdminSupport from "./pages/admin/AdminSupport";
import SharedTrip from "./pages/SharedTrip";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/plan-trip"} component={PlanTrip} />
      <Route path={"/my-plans"} component={MyPlans} />
      <Route path={"/trip/:id"} component={TripDetails} />
      <Route path="/guides" component={Guides} />
      <Route path="/about" component={About} />
      <Route path="/support" component={Support} />
      <Route path="/packages" component={Packages} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/cities" component={AdminCities} />
      <Route path="/admin/activities" component={AdminActivities} />
      <Route path="/admin/accommodations" component={AdminAccommodations} />
      <Route path="/admin/support" component={AdminSupport} />
      <Route path="/shared/:token" component={SharedTrip} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider
          defaultTheme="light"
          switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
