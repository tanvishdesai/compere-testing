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
            in an intimate setting with fellow cinephiles.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Calendar className="mr-2 h-5 w-5" />
              View Upcoming Screenings
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              <Users className="mr-2 h-5 w-5" />
              Join Community
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">About Our Community</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are a passionate group of film enthusiasts who believe in the power of cinema 
              to bring people together. Every week, we curate exceptional films and create 
              an immersive viewing experience in our intimate studio space.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Film className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Curated Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Carefully selected films from around the world, spanning different genres, 
                  eras, and cultures.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Community Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with fellow film lovers, share insights, and discuss cinema 
                  in a welcoming environment.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Premium Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  High-quality projection, comfortable seating, and an intimate atmosphere 
                  for the perfect viewing experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Screenings Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Upcoming Screenings</h2>
            <p className="text-xl text-gray-600">
              Don&apos;t miss out on our upcoming film screenings. Book your tickets early!
            </p>
          </div>

          {upcomingScreenings && upcomingScreenings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingScreenings.map((screening) => {
                const movie = getMovieById(screening.movieId);
                return (
                  <Card key={screening._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{movie?.title}</CardTitle>
                      <CardDescription>{movie?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(screening.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-2 h-4 w-4" />
                          {screening.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {screening.venue}
                        </div>
                        <div className="text-lg font-semibold text-purple-600">
                          ₹{screening.ticketPrice}
                        </div>
                        <Link href={`/screening/${screening._id}`}>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            Book Tickets
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
              <p className="text-gray-600 text-lg">No upcoming screenings at the moment.</p>
              <p className="text-gray-500">Check back soon for new additions!</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Screenings Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Past Screenings</h2>
            <p className="text-xl text-gray-600">
              Relive the magic of our previous screenings and see the community in action.
            </p>
          </div>

          {pastScreenings && pastScreenings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastScreenings.slice(0, 6).map((screening) => {
                const movie = getMovieById(screening.movieId);
                return (
                  <Card key={screening._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{movie?.title}</CardTitle>
                      <CardDescription>{movie?.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(screening.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="mr-2 h-4 w-4" />
                          {screening.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="mr-2 h-4 w-4" />
                          {screening.venue}
                        </div>
                        <Link href={`/screening/${screening._id}`}>
                          <Button variant="outline" className="w-full">
                            View Photos
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
              <p className="text-gray-600 text-lg">No past screenings to display yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Compere</h3>
          <p className="text-gray-400 mb-6">
            Ahmedabad&apos;s Premier Film Screening Community
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <span>© 2024 Compere. All rights reserved.</span>
            <span>•</span>
            <span>Ahmedabad, Gujarat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
