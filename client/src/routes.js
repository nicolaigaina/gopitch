import React from "react";
import { Route, IndexRoute } from "react-router";

// Import miscellaneous routes and other requirements
import App from "./components/app";
import NotFoundPage from "./components/pages/not-found-page";

// Import static pages
import HomePage from "./components/pages/home-page";
import ContactPage from "./components/pages/contact-page";
import ComponentSamplesPage from "./components/pages/component-samples";

// Import authentication related pages
import Signup from "./components/auth/signup";
import Signin from "./components/auth/signin";
import Signout from "./components/auth/signout";
import ForgotPassword from "./components/auth/forgot_password";
import ResetPassword from "./components/auth/reset_password";

// Import dashboard pages
import Dashboard from "./components/dashboard/dashboard";
import ViewProfile from "./components/dashboard/profile/view-profile";
import Inbox from "./components/dashboard/messaging/inbox";
import Conversation from "./components/dashboard/messaging/conversation";
import ComposeMessage from "./components/dashboard/messaging/compose-message";

// Import billing pages
import InitialCheckout from "./components/billing/initial-checkout";
import BillingSettings from "./components/billing/settings";

// Import admin pages
import AdminDashboard from "./components/admin/dashboard";

// Import higher order components
import RequireAuth from "./components/auth/require_auth";

export default (
  <Route path="/" component={App}>
    <IndexRoute component={HomePage} />
    <Route path="contact-us" component={ContactPage} />
    <Route
      path="component-samples"
      component={RequireAuth(ComponentSamplesPage)}
    />
    <Route path="signup" component={Signup} />
    <Route path="signin" component={Signin} />
    <Route path="signout" component={Signout} />
    <Route path="forgot-password" component={ForgotPassword} />
    <Route path="reset-password/:resetToken" component={ResetPassword} />

    <Route path="checkout/:plan" component={RequireAuth(InitialCheckout)} />
    <Route path="billing/settings" component={RequireAuth(BillingSettings)} />

    <Route path="profile" component={RequireAuth(ViewProfile)} />

    <Route path="admin" component={RequireAuth(AdminDashboard)} />

    <Route path="dashboard">
      <IndexRoute component={RequireAuth(Dashboard)} />
      <Route path="inbox" component={RequireAuth(Inbox)} />
      <Route path="conversation/new" component={RequireAuth(ComposeMessage)} />
      <Route
        path="conversation/view/:conversationId"
        component={RequireAuth(Conversation)}
      />
    </Route>

    <Route path="*" component={NotFoundPage} />
  </Route>
);
