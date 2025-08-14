"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Users, Film, Plus, Edit, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminPage() {
  const movies = useQuery(api.movies.list);
  const upcomingScreenings = useQuery(api.screenings.listUpcoming);
  const pastScreenings = useQuery(api.screenings.listPast);
  const bookings = useQuery(api.bookings.list);

  const createMovie = useMutation(api.movies.create);
  const createScreening = useMutation(api.screenings.create);
  const createMovieImage = useMutation(api.movieImages.create);


  const [activeTab, setActiveTab] = useState("upcoming");
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showAddScreening, setShowAddScreening] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{ _id: Id<"movies">; title: string } | null>(null);

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

  const getMovieById = (movieId: string) => {
    return movies?.find(movie => movie._id === movieId);
  };

  const getBookingsForScreening = (screeningId: string) => {
    return bookings?.filter(booking => booking.screeningId === screeningId) || [];
  };

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
              <p className="text-2xl font-bold text-purple-600">{bookings?.length || 0}</p>
              <p className="text-gray-600">Total bookings</p>
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
    </div>
  );
}
