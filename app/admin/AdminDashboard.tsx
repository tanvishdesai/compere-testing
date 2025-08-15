"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Users, Film, Plus, Edit, Image as ImageIcon, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminDashboard() {
  const movies = useQuery(api.movies.list);
  const upcomingScreenings = useQuery(api.screenings.listUpcoming);
  const pastScreenings = useQuery(api.screenings.listPast);
  const bookings = useQuery(api.bookings.list);
  const pendingVerifications = useQuery(api.bookings.listPendingVerifications);

  // Show loading state while queries are loading
  const isLoading = movies === undefined || upcomingScreenings === undefined || 
                   pastScreenings === undefined || bookings === undefined || 
                   pendingVerifications === undefined;

  const createMovie = useMutation(api.movies.create);
  const createScreening = useMutation(api.screenings.create);
  const createMovieImage = useMutation(api.movieImages.create);
  const verifyPayment = useMutation(api.bookings.verifyPayment);

  const [activeTab, setActiveTab] = useState("upcoming");
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showAddScreening, setShowAddScreening] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [showVerifyPayment, setShowVerifyPayment] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{ _id: Id<"movies">; title: string } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<{
    _id: Id<"bookings">;
    _creationTime: number;
    screeningId: Id<"screenings">;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    numberOfTickets: number;
    totalAmount: number;
    paymentStatus: string;
    paymentId?: string;
    paymentScreenshotUrl?: string;
    verificationStatus?: string;
    adminNotes?: string;
    verifiedBy?: string;
    verifiedAt?: number;
  } | null>(null);

  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    director: "",
    year: "",
    duration: "",
    genre: "",
    posterUrl: "",
    trailerUrl: "",
  });

  const [screeningForm, setScreeningForm] = useState({
    movieId: "",
    date: "",
    time: "",
    venue: "",
    location: "",
    ticketPrice: "",
    maxSeats: "50",
  });

  const [imageForm, setImageForm] = useState({
    imageUrl: "",
    caption: "",
  });

  const [verificationForm, setVerificationForm] = useState({
    adminNotes: "",
  });

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMovie({
        title: movieForm.title,
        description: movieForm.description,
        director: movieForm.director || undefined,
        year: movieForm.year ? parseInt(movieForm.year) : undefined,
        duration: movieForm.duration ? parseInt(movieForm.duration) : undefined,
        genre: movieForm.genre || undefined,
        posterUrl: movieForm.posterUrl || undefined,
        trailerUrl: movieForm.trailerUrl || undefined,
      });
      toast.success("Movie added successfully!");
      setShowAddMovie(false);
      setMovieForm({
        title: "",
        description: "",
        director: "",
        year: "",
        duration: "",
        genre: "",
        posterUrl: "",
        trailerUrl: "",
      });
    } catch {
      toast.error("Failed to add movie");
    }
  };

  const handleAddScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createScreening({
        movieId: screeningForm.movieId as Id<"movies">,
        date: screeningForm.date,
        time: screeningForm.time,
        venue: screeningForm.venue,
        location: screeningForm.location,
        ticketPrice: parseFloat(screeningForm.ticketPrice),
        maxSeats: parseInt(screeningForm.maxSeats),
        isActive: true,
      });
      toast.success("Screening added successfully!");
      setShowAddScreening(false);
      setScreeningForm({
        movieId: "",
        date: "",
        time: "",
        venue: "",
        location: "",
        ticketPrice: "",
        maxSeats: "50",
      });
    } catch {
      toast.error("Failed to add screening");
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie) return;
    
    try {
      await createMovieImage({
        movieId: selectedMovie._id,
        imageUrl: imageForm.imageUrl,
        caption: imageForm.caption || undefined,
      });
      toast.success("Image added successfully!");
      setShowAddImage(false);
      setImageForm({
        imageUrl: "",
        caption: "",
      });
      setSelectedMovie(null);
    } catch {
      toast.error("Failed to add image");
    }
  };

  const handleVerifyPayment = async (approved: boolean) => {
    if (!selectedBooking) return;
    
    try {
      await verifyPayment({
        id: selectedBooking._id,
        approved,
        adminNotes: verificationForm.adminNotes || undefined,
        verifiedBy: "Admin", // In a real app, this would be the current user's name
      });
      toast.success(`Payment ${approved ? "approved" : "rejected"} successfully!`);
      setShowVerifyPayment(false);
      setSelectedBooking(null);
      setVerificationForm({ adminNotes: "" });
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const getMovieById = (movieId: string) => {
    return movies?.find(movie => movie._id === movieId);
  };

  const getScreeningById = (screeningId: string) => {
    const allScreenings = [...(upcomingScreenings || []), ...(pastScreenings || [])];
    return allScreenings.find(screening => screening._id === screeningId);
  };

  const getBookingsForScreening = (screeningId: string) => {
    return bookings?.filter(booking => booking.screeningId === screeningId) || [];
  };

  // Show loading state while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage movies, screenings, and bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Film className="mr-2 h-5 w-5" />
                Movies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">{movies?.length || 0}</p>
              <p className="text-gray-600">Total movies</p>
              <Button 
                onClick={() => setShowAddMovie(true)}
                className="mt-4 w-full"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Movie
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Screenings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">
                {upcomingScreenings?.length || 0}
              </p>
              <p className="text-gray-600">Upcoming screenings</p>
              <Button 
                onClick={() => setShowAddScreening(true)}
                className="mt-4 w-full"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Screening
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{bookings?.length || 0}</p>
                  <p className="text-gray-600">Total bookings</p>
                </div>
                {pendingVerifications && pendingVerifications.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        {pendingVerifications.length} pending verification{pendingVerifications.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "upcoming"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Upcoming Screenings
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "past"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Past Screenings
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === "payments"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Payment Verifications
                {pendingVerifications && pendingVerifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {pendingVerifications.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "upcoming" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Screenings</h2>
            {upcomingScreenings && upcomingScreenings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingScreenings.map((screening) => {
                  const movie = getMovieById(screening.movieId);
                  const screeningBookings = getBookingsForScreening(screening._id);
                  const totalBooked = screeningBookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);
                  
                  return (
                    <Card key={screening._id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{movie?.title}</CardTitle>
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
                          <div className="text-sm">
                            <span className="font-semibold">Bookings:</span> {totalBooked}/{screening.maxSeats}
                          </div>
                          <div className="text-lg font-semibold text-purple-600">
                            ₹{screening.ticketPrice}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Users className="mr-1 h-4 w-4" />
                              View Bookings
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No upcoming screenings</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Past Screenings</h2>
            {pastScreenings && pastScreenings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastScreenings.map((screening) => {
                  const movie = getMovieById(screening.movieId);
                  const screeningBookings = getBookingsForScreening(screening._id);
                  const totalBooked = screeningBookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);
                  
                  return (
                    <Card key={screening._id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{movie?.title}</CardTitle>
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
                          <div className="text-sm">
                            <span className="font-semibold">Total Attendees:</span> {totalBooked}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => {
                                if (movie) {
                                  setSelectedMovie({ _id: movie._id, title: movie.title });
                                  setShowAddImage(true);
                                }
                              }}
                            >
                              <ImageIcon className="mr-1 h-4 w-4" />
                              Add Photos
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              <Users className="mr-1 h-4 w-4" />
                              View Photos
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No past screenings</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Verifications</h2>
            {pendingVerifications && pendingVerifications.length > 0 ? (
              <div className="space-y-4">
                {pendingVerifications.map((booking) => {
                  const screening = getScreeningById(booking.screeningId);
                  const movie = screening ? getMovieById(screening.movieId) : null;
                  
                  return (
                    <Card key={booking._id} className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                              Payment Verification Required
                            </CardTitle>
                            <CardDescription>
                              Booking for {movie?.title} - {booking.customerName}
                            </CardDescription>
                          </div>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Pending
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="font-semibold">Booking Details</h4>
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span>Customer:</span>
                                <span>{booking.customerName}</span>
                              </div>
                              {booking.customerEmail && (
                                <div className="flex justify-between">
                                  <span>Email:</span>
                                  <span>{booking.customerEmail}</span>
                                </div>
                              )}
                              {booking.customerPhone && (
                                <div className="flex justify-between">
                                  <span>Phone:</span>
                                  <span>{booking.customerPhone}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Movie:</span>
                                <span>{movie?.title}</span>
                              </div>
                              {screening && (
                                <>
                                  <div className="flex justify-between">
                                    <span>Date:</span>
                                    <span>{new Date(screening.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Time:</span>
                                    <span>{screening.time}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between">
                                <span>Tickets:</span>
                                <span>{booking.numberOfTickets}</span>
                              </div>
                              <div className="flex justify-between font-semibold">
                                <span>Amount:</span>
                                <span>₹{booking.totalAmount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Payment ID:</span>
                                <span className="font-mono text-xs">{booking.paymentId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Submitted:</span>
                                <span>{new Date(booking._creationTime).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold">Payment Screenshot</h4>
                            {booking.paymentScreenshotUrl ? (
                              <div className="space-y-3">
                                <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-auto">
                                  {booking.paymentScreenshotUrl.startsWith('data:') ? (
                                    <Image 
                                      src={booking.paymentScreenshotUrl} 
                                      alt="Payment Screenshot" 
                                      width={400}
                                      height={300}
                                      className="max-w-full h-auto rounded"
                                    />
                                  ) : (
                                    <div className="text-center text-gray-600">
                                      <p>Screenshot URL: {booking.paymentScreenshotUrl}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 flex-1"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowVerifyPayment(true);
                                    }}
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Review Payment
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-gray-500 p-4 border rounded-lg">
                                <p>No screenshot uploaded</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All payments verified!</h3>
                <p className="text-gray-600">No pending payment verifications at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Movie Dialog */}
      <Dialog open={showAddMovie} onOpenChange={setShowAddMovie}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Movie</DialogTitle>
            <DialogDescription>
              Add a new movie to your collection
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMovie} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({...movieForm, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  value={movieForm.director}
                  onChange={(e) => setMovieForm({...movieForm, director: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={movieForm.description}
                onChange={(e) => setMovieForm({...movieForm, description: e.target.value})}
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={movieForm.year}
                  onChange={(e) => setMovieForm({...movieForm, year: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={movieForm.duration}
                  onChange={(e) => setMovieForm({...movieForm, duration: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={movieForm.genre}
                  onChange={(e) => setMovieForm({...movieForm, genre: e.target.value})}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="posterUrl">Poster URL</Label>
                <Input
                  id="posterUrl"
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({...movieForm, posterUrl: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="trailerUrl">Trailer URL</Label>
                <Input
                  id="trailerUrl"
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({...movieForm, trailerUrl: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddMovie(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Movie</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Screening Dialog */}
      <Dialog open={showAddScreening} onOpenChange={setShowAddScreening}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Screening</DialogTitle>
            <DialogDescription>
              Schedule a new movie screening
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddScreening} className="space-y-4">
            <div>
              <Label htmlFor="movieId">Movie *</Label>
              <select
                id="movieId"
                value={screeningForm.movieId}
                onChange={(e) => setScreeningForm({...screeningForm, movieId: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select a movie</option>
                {movies?.map((movie) => (
                  <option key={movie._id} value={movie._id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={screeningForm.date}
                  onChange={(e) => setScreeningForm({...screeningForm, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={screeningForm.time}
                  onChange={(e) => setScreeningForm({...screeningForm, time: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={screeningForm.venue}
                  onChange={(e) => setScreeningForm({...screeningForm, venue: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={screeningForm.location}
                  onChange={(e) => setScreeningForm({...screeningForm, location: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticketPrice">Ticket Price (₹) *</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  value={screeningForm.ticketPrice}
                  onChange={(e) => setScreeningForm({...screeningForm, ticketPrice: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxSeats">Max Seats *</Label>
                <Input
                  id="maxSeats"
                  type="number"
                  value={screeningForm.maxSeats}
                  onChange={(e) => setScreeningForm({...screeningForm, maxSeats: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddScreening(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Screening</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Image Dialog */}
      <Dialog open={showAddImage} onOpenChange={setShowAddImage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Screening Photos</DialogTitle>
            <DialogDescription>
              Add photos from the screening of {selectedMovie?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddImage} className="space-y-4">
            <div>
              <Label htmlFor="imageUrl">Image URL *</Label>
              <Input
                id="imageUrl"
                value={imageForm.imageUrl}
                onChange={(e) => setImageForm({...imageForm, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={imageForm.caption}
                onChange={(e) => setImageForm({...imageForm, caption: e.target.value})}
                placeholder="Brief description of the photo"
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddImage(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Photo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Verification Dialog */}
      <Dialog open={showVerifyPayment} onOpenChange={setShowVerifyPayment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Review the payment screenshot and approve or reject the booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Booking Information</h4>
                  <div className="text-sm space-y-2 bg-gray-50 p-3 rounded-lg">
                    <p><span className="font-medium">Customer:</span> {selectedBooking.customerName}</p>
                    <p><span className="font-medium">Amount:</span> ₹{selectedBooking.totalAmount}</p>
                    <p><span className="font-medium">Tickets:</span> {selectedBooking.numberOfTickets}</p>
                    <p><span className="font-medium">Payment ID:</span> {selectedBooking.paymentId}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Payment Screenshot</h4>
                  <div className="border rounded-lg bg-gray-50 p-2 max-h-48 overflow-auto">
                    {selectedBooking.paymentScreenshotUrl?.startsWith('data:') ? (
                      <Image 
                        src={selectedBooking.paymentScreenshotUrl} 
                        alt="Payment Screenshot" 
                        width={400}
                        height={300}
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <div className="text-center text-gray-600 p-4">
                        <p>Screenshot: {selectedBooking.paymentScreenshotUrl}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  value={verificationForm.adminNotes}
                  onChange={(e) => setVerificationForm({...verificationForm, adminNotes: e.target.value})}
                  placeholder="Add any notes about this verification..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowVerifyPayment(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleVerifyPayment(false)}
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Payment
                </Button>
                <Button 
                  onClick={() => handleVerifyPayment(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
