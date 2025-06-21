/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader, LogIn, Plus, TrendingUp } from "lucide-react";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { getPaginatedPosts } from "@/lib/api-posts";
import WeeklyPromptBanner from "./WeeklyPrompt";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// Infinite posts feed using scroll observer
const PAGE_SIZE = 20;

const GlobalFeed = () => {
	const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
	const queryClient = useQueryClient();
	const loadMoreRef = useRef<HTMLDivElement>(null);
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const {
		data,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		isLoading,
		error,
		refetch,
	} = useInfiniteQuery({
		queryKey: ["posts", "infinite"],
		queryFn: ({ pageParam = null }) =>
			getPaginatedPosts({
				limit: PAGE_SIZE,
				after: pageParam as string | null,
			}),
		getNextPageParam: (lastPage) => {
			if (!lastPage || !lastPage.hasMore) return undefined;
			const posts = lastPage.posts;
			if (!posts || posts.length === 0) return undefined;
			return posts[posts.length - 1]._id;
		},
		initialPageParam: null,
		refetchInterval: 30000,
	});

	const allPosts = data
		? data.pages.flatMap((pg: { posts: any[] }) => pg.posts)
		: [];

	useEffect(() => {
		const observer = new window.IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 1 }
		);
		if (loadMoreRef.current) {
			observer.observe(loadMoreRef.current);
		}
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage]);

	const handlePostCreated = () => {
		queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] });
		setIsCreatePostOpen(false);
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center space-y-4 text-muted-foreground">
					<Loader className="h-8 w-8 animate-spin text-purple-500" />
					<p className="animate-pulse">Loading the underground feed...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="text-center space-y-4">
					<p className="text-destructive">Failed to load posts</p>
					<Button
						onClick={() => refetch()}
						variant="outline"
						className="hover-scale"
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background relative">
			<div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
				<div className="flex items-center justify-between max-w-2xl mx-auto p-4">
					<div className="flex items-center space-x-2">
						<TrendingUp className="h-5 w-5 text-purple-500" />
						<h1 className="text-xl font-bold text-foreground">Feed</h1>
					</div>
					<Button
						disabled={isAuthenticated === false}
						onClick={() => setIsCreatePostOpen(true)}
						className="sm:flex bg-purple-600 hover:bg-purple-700 text-white hover-scale glow-effect"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6">
				<WeeklyPromptBanner />
				{!isAuthenticated && (
					<div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6 mb-6">
						<div className="text-center space-y-3">
							<div className="text-4xl mb-2">🎭</div>
							<h3 className="text-xl font-bold text-purple-300">
								Join the Shadows
							</h3>
							<p className="text-gray-400">
								Create your anonymous identity to post, whisper, and interact
								with the community
							</p>
							<div className="flex gap-3 justify-center pt-2">
								<Button
									onClick={() => navigate("/login")}
									className="bg-purple-600 hover:bg-purple-700 text-white"
								>
									<LogIn className="h-4 w-4 mr-2" />
									Login
								</Button>
								<Button
									onClick={() => navigate("/register")}
									variant="outline"
									className="border-purple-500 text-purple-300 hover:bg-purple-900/20"
								>
									Create Account
								</Button>
							</div>
						</div>
					</div>
				)}
				{allPosts.length === 0 ? (
					<div className="text-center py-16 space-y-4">
						<div className="text-6xl mb-4 animate-bounce">👻</div>
						<h2 className="text-2xl font-bold text-foreground">
							The underground is quiet...
						</h2>
						<p className="text-muted-foreground">
							Be the first to share something mysterious
						</p>
						<Button
							onClick={() => setIsCreatePostOpen(true)}
							className="bg-purple-600 hover:bg-purple-700 text-white hover-scale"
						>
							<Plus className="h-4 w-4 mr-2" />
							Create First Post
						</Button>
					</div>
				) : (
					<div className="space-y-6">
						{allPosts.map((post: any, index: number) => (
							<div
								key={post._id}
								className="animate-fade-in opacity-100"
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<PostCard post={post} />
							</div>
						))}
						<div ref={loadMoreRef} />
						{isFetchingNextPage && (
							<div className="flex justify-center p-4">
								<Loader className="h-6 w-6 animate-spin text-purple-500" />
							</div>
						)}
						{!hasNextPage && (
							<div className="text-center text-muted-foreground py-2 text-xs">
								No more posts to show
							</div>
						)}
					</div>
				)}
			</div>

			<CreatePostModal
				open={isCreatePostOpen}
				onOpenChange={setIsCreatePostOpen}
				onSuccess={handlePostCreated}
			/>
		</div>
	);
};

export default GlobalFeed;
