import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/react-query";
import { AppRouter } from "@/routes/app-router";
import { ThemeProvider } from "@/store/theme.context";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { TicketProvider } from "@/features/tickets/context/TicketContext";

// Import Leaflet CSS toàn cục cho bản đồ
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TicketProvider>
          <QueryClientProvider client={queryClient}>
            <AppRouter />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
