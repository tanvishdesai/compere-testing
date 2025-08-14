"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BookingForm } from "@/components/BookingForm";

import { Id } from "@/convex/_generated/dataModel";

export default function ScreeningPage() {
  const params = useParams();
  const screeningId = params.id as Id<"screenings">;
  
  const screening = useQuery(api.screenings.get, { id: screeningId });
  const movie = useQuery(
    api.movies.get, 
    screening?.movieId ? { id: screening.movieId } : "skip"
  );
  const bookings = useQuery(api.bookings.listByScreening, { screeningId });
  const movieImages = useQuery(
    api.movieImages.listByMovie, 
    movie?._id ? { movieId: movie._id } : "skip"
  );
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(1);

  // Check if Convex client is available
  const isConvexAvailable = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_CONVEX_URL;

  const isPastScreening = screening && new Date(screening.date) < new Date();
  const totalBooked = bookings?.reduce((sum, booking) => sum + booking.numberOfTickets, 0) || 0;
  const availableSeats = (screening?.maxSeats || 0) - totalBooked;

  // Show loading state if Convex is not available or data is loading
  if (!isConvexAvailable || !screening || !movie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isConvexAvailable ? "Initializing..." : "Loading screening details..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{movie.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Movie Details */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">{movie.title}</CardTitle>
                <CardDescription className="text-lg">{movie.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {movie.director && (
                      <div>
                        <span className="font-semibold text-gray-700">Director:</span>
                        <p className="text-gray-600">{movie.director}</p>
                      </div>
                    )}
                    {movie.year && (
                      <div>
                        <span className="font-semibold text-gray-700">Year:</span>
                        <p className="text-gray-600">{movie.year}</p>
                      </div>
                    )}
                    {movie.duration && (
                      <div>
                        <span className="font-semibold text-gray-700">Duration:</span>
                        <p className="text-gray-600">{movie.duration} minutes</p>
                      </div>
                    )}
                    {movie.genre && (
                      <div>
                        <span className="font-semibold text-gray-700">Genre:</span>
                        <p className="text-gray-600">{movie.genre}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>{new Date(screening.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-2 h-5 w-5" />
                      <span>{screening.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="mr-2 h-5 w-5" />
                      <span>{screening.venue}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">{screening.location}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Movie Images for Past Screenings */}
            {isPastScreening && movieImages && movieImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Screening Photos</CardTitle>
                  <CardDescription>Photos from this screening</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {movieImages.map((image) => (
                      <div key={image._id} className="relative">
                        <Image
                          src={image.imageUrl}
                          alt={image.caption || "Screening photo"}
                          width={400}
                          height={256}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        {image.caption && (
                          <p className="mt-2 text-sm text-gray-600">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    ₹{screening.ticketPrice}
                  </div>
                  <p className="text-gray-600">per ticket</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Available Seats:</span>
                    <span className="font-semibold">{availableSeats}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Booked:</span>
                    <span className="font-semibold">{totalBooked}</span>
                  </div>
                </div>

                {isPastScreening ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">This screening has already taken place.</p>
                    <Button variant="outline" className="w-full" disabled>
                      Screening Complete
                    </Button>
                  </div>
                ) : availableSeats > 0 ? (
                  <>
                    {!showBookingForm ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Tickets
                          </label>
                          <select
                            value={selectedTickets}
                            onChange={(e) => setSelectedTickets(Number(e.target.value))}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {Array.from({ length: Math.min(availableSeats, 10) }, (_, i) => i + 1).map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? 'ticket' : 'tickets'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 mb-2">
                            Total: ₹{screening.ticketPrice * selectedTickets}
                          </div>
                        </div>
                        <Button 
                          onClick={() => setShowBookingForm(true)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          Book Now
                        </Button>
                      </div>
                    ) : (
                      <BookingForm
                        screening={screening}
                        movie={movie}
                        numberOfTickets={selectedTickets}
                        totalAmount={screening.ticketPrice * selectedTickets}
                        onCancel={() => setShowBookingForm(false)}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-600 mb-4">This screening is fully booked.</p>
                    <Button variant="outline" className="w-full" disabled>
                      Sold Out
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
