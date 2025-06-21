import React, { useState } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Outlet,
	useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import SmoothScrollProvider from "./components/providers/SmoothScrollProvider";
import LoginSuccessAnimation from "./components/animations/LoginSuccessAnimation";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import ProfilePage from "./pages/ProfilePage";
import GhostCircles from "./pages/GhostCircles";
import InvitePage from "./pages/InvitePage";
import WhispersPage from "./pages/WhispersPage";
import RecognitionsPage from "./pages/RecognitionsPage";
import ReferralPage from "./pages/ReferralPage";
import MatchesPage from "./pages/MatchesPage";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminMatchStats from "./pages/AdminMatchStats";
import NotFound from "./pages/NotFound";

// Layout
import AppShell from "./components/layout/AppShell";

const queryClient = new QueryClient();

function GlobalApp() {
	const { showLoginAnimation, setShowLoginAnimation } = useAuth();
	const [loginAnimNavPending, setLoginAnimNavPending] = useState(false);
	const navigate = useNavigate();

	return (
		<>
			{/* Render animation overlay if login/registration success */}
			{showLoginAnimation && (
				<div className="fixed inset-0 z-[99] bg-black/70 flex items-center justify-center">
					<LoginSuccessAnimation
						onComplete={() => {
							setShowLoginAnimation(false);
							setLoginAnimNavPending(true);
							// Use navigate for SPA transition
							navigate("/");
						}}
					/>
				</div>
			)}
			<Routes>
				{/* Public routes */}
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route path="/admin/login" element={<AdminLogin />} />

				{/* Combined root route with public and protected sub-routes */}
				<Route
					path="/"
					element={
						<AppShell>
							<Outlet />
						</AppShell>
					}
				>
					<Route index element={<Index />} /> {/* Public */}
					<Route path="invite/:circleId" element={<InvitePage />} />{" "}
					{/* Public */}
					<Route
						path="profile"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="profile/:userId"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="ghost-circles"
						element={
							<ProtectedRoute>
								<GhostCircles />
							</ProtectedRoute>
						}
					/>
					<Route
						path="chat"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="chat/:userId"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="whispers"
						element={
							<ProtectedRoute>
								<WhispersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="recognitions"
						element={
							<ProtectedRoute>
								<RecognitionsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="referrals"
						element={
							<ProtectedRoute>
								<ReferralPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="matches"
						element={
							<ProtectedRoute>
								<MatchesPage />
							</ProtectedRoute>
						}
					/>
				</Route>

				{/* Admin routes */}
				<Route
					path="/admin"
					element={
						<ProtectedAdminRoute>
							<AdminPanel />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path="/admin/match-stats"
					element={
						<ProtectedAdminRoute>
							<AdminMatchStats />
						</ProtectedAdminRoute>
					}
				/>

				{/* 404 route */}
				<Route path="*" element={<NotFound />} />
			</Routes>
			<Toaster />
		</>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<SmoothScrollProvider>
				<AdminProvider>
					<Router
						future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
					>
						<AuthProvider>
							<div className="App">
								<GlobalApp />
							</div>
						</AuthProvider>
					</Router>
				</AdminProvider>
			</SmoothScrollProvider>
		</QueryClientProvider>
	);
}

export default App;
