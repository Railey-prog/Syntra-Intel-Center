import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { FloatingChatbot } from "@/components/FloatingChatbot";

import Home from "@/pages/home";
import TheIssue from "@/pages/the-issue";
import ThePrototype from "@/pages/the-prototype";
import Ethics from "@/pages/ethics";
import Conclusion from "@/pages/conclusion";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/the-issue" component={TheIssue} />
        <Route path="/the-prototype" component={ThePrototype} />
        <Route path="/ethics" component={Ethics} />
        <Route path="/conclusion" component={Conclusion} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <FloatingChatbot />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
