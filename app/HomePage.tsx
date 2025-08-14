"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users, Film, Star } from "lucide-react";

export default function HomePage() {
  const upcomingScreenings = useQuery(api.screenings.listUpcoming);
  const pastScreenings = useQuery(api.screenings.listPast);
  const movies = useQuery(api.movies.list);

  const getMovieById = (movieId: string) => {
    return movies?.find(movie => movie._id === movieId);
  };

  // Show loading state while data is loading
  const isLoading = upcomingScreenings === undefined || pastScreenings === undefined || movies === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Compere
          </h1>
          <p className="text-2xl mb-8 text-gray-200">
            Join Ahmedabad&apos;s Premier Film Screening Community
          </p>
          <p className="text-lg mb-12 text-gray-300 max-w-2xl mx-auto">
            Experience cinema like never before. Weekly screenings of carefully curated films 
            with passionate film enthusiasts. From timeless classics to cutting-edge indie films.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              Explore Screenings
            </Button>
            <Button size="lg" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">{movies?.length || 0}</div>
              <p className="text-gray-300">Films Screened</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">{upcomingScreenings?.length || 0}</div>
              <p className="text-gray-300">Upcoming Screenings</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
              <p className="text-gray-300">Community Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Screenings */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Upcoming Screenings</h2>
            <p className="text-gray-300 text-lg">Don&apos;t miss these carefully selected films</p>
          </div>
          
          {upcomingScreenings && upcomingScreenings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingScreenings.map((screening) => {
                const movie = getMovieById(screening.movieId);
                return (
                  <Card key={screening._id} className="bg-white/10 backdrop-blur-sm border-purple-500/30 text-white hover:bg-white/20 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-purple-200">{movie?.title}</CardTitle>
                          {movie?.director && (
                            <p className="text-sm text-gray-300 mt-1">Directed by {movie.director}</p>
                          )}
                        </div>
                        {movie?.year && (
                          <span className="text-sm bg-purple-600 px-2 py-1 rounded">{movie.year}</span>
                        )}
                      </div>
                      <CardDescription className="text-gray-300">
                        {movie?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-300">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(screening.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="mr-2 h-4 w-4" />
                          {screening.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <MapPin className="mr-2 h-4 w-4" />
                          {screening.venue}, {screening.location}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-semibold text-purple-300">₹{screening.ticketPrice}</span>
                          <div className="flex items-center text-sm text-gray-300">
                            <Users className="mr-1 h-4 w-4" />
                            {screening.maxSeats} seats
                          </div>
                        </div>
                        <Link href={`/screening/${screening._id}`}>
                          <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Film className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Screenings</h3>
              <p className="text-gray-400">Check back soon for new screenings!</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Screenings Highlights */}
      {pastScreenings && pastScreenings.length > 0 && (
        <section className="py-20 px-4 bg-black/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Recent Screenings</h2>
              <p className="text-gray-300 text-lg">Celebrating our cinema journey</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastScreenings.slice(0, 4).map((screening) => {
                const movie = getMovieById(screening.movieId);
                return (
                  <Card key={screening._id} className="bg-white/5 backdrop-blur-sm border-purple-500/20 text-white">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-purple-200">{movie?.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(screening.date).toLocaleDateString()}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-300">
                        <Star className="mr-1 h-4 w-4 text-yellow-400" />
                        Screening completed
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Be part of Ahmedabad&apos;s most passionate film community. Every screening is an experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              View All Screenings
            </Button>
            <Button size="lg" variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-900">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-purple-500/30">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 Compere. Celebrating cinema in Ahmedabad.</p>
        </div>
      </footer>
    </div>
  );
}
