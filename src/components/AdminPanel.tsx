import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "bookings">("upcoming");
  const [showAddMovie, setShowAddMovie] = useState(false);
  
  const upcomingMovies = useQuery(api.movies.getUpcomingMovies) || [];
  const pastMovies = useQuery(api.movies.getPastMovies) || [];
  const allBookings = useQuery(api.bookings.getAllBookings) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-purple-600 hover:text-purple-700 transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <button 
          onClick={() => setShowAddMovie(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add New Movie
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-2 rounded-md transition-colors ${
            activeTab === "upcoming" 
              ? "bg-white text-purple-600 shadow-sm" 
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Upcoming Movies
        </button>
        <button 
          onClick={() => setActiveTab("past")}
          className={`px-6 py-2 rounded-md transition-colors ${
            activeTab === "past" 
              ? "bg-white text-purple-600 shadow-sm" 
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Past Movies
        </button>
        <button 
          onClick={() => setActiveTab("bookings")}
          className={`px-6 py-2 rounded-md transition-colors ${
            activeTab === "bookings" 
              ? "bg-white text-purple-600 shadow-sm" 
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All Bookings
        </button>
      </div>

      {/* Content */}
      {activeTab === "upcoming" && (
        <UpcomingMoviesTab movies={upcomingMovies} />
      )}
      
      {activeTab === "past" && (
        <PastMoviesTab movies={pastMovies} />
      )}
      
      {activeTab === "bookings" && (
        <BookingsTab bookings={allBookings} />
      )}

      {/* Add Movie Modal */}
      {showAddMovie && (
        <AddMovieModal onClose={() => setShowAddMovie(false)} />
      )}
    </div>
  );
}

function UpcomingMoviesTab({ movies }: { movies: any[] }) {
  const deleteMovie = useMutation(api.movies.deleteMovie);

  const handleDelete = async (movieId: string) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      try {
        await deleteMovie({ movieId: movieId as Id<"movies"> });
        toast.success("Movie deleted successfully");
      } catch (error) {
        toast.error("Failed to delete movie");
      }
    }
  };

  return (
    <div className="space-y-6">
      {movies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No upcoming movies scheduled</p>
        </div>
      ) : (
        movies.map((movie) => (
          <div key={movie._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
                <p className="text-gray-600 mb-4">{movie.description}</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Date:</strong> {new Date(movie.screeningDate).toLocaleDateString()}</div>
                  <div><strong>Price:</strong> ₹{movie.ticketPrice}</div>
                  <div><strong>Venue:</strong> {movie.venue}</div>
                  <div><strong>Capacity:</strong> {movie.maxCapacity}</div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button 
                  onClick={() => handleDelete(movie._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function PastMoviesTab({ movies }: { movies: any[] }) {
  return (
    <div className="space-y-6">
      {movies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No past movies to display</p>
        </div>
      ) : (
        movies.map((movie) => (
          <div key={movie._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
                <p className="text-gray-600 mb-4">{movie.description}</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Date:</strong> {new Date(movie.screeningDate).toLocaleDateString()}</div>
                  <div><strong>Venue:</strong> {movie.venue}</div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                  Add Images
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function BookingsTab({ bookings }: { bookings: any[] }) {
  const setStatus = useMutation(api.bookings.adminSetPaymentStatus);

  const handleSetStatus = async (bookingId: string, status: "completed" | "failed") => {
    try {
      await setStatus({ bookingId: bookingId as Id<"bookings">, status });
      toast.success(`Marked as ${status}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Movie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tickets
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UPI Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                    <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.movieTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.numberOfTickets}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{booking.totalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.paymentStatus === "completed" 
                      ? "bg-green-100 text-green-800"
                      : booking.paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    {booking.upiReference && (
                      <div><strong>Ref:</strong> {booking.upiReference}</div>
                    )}
                    {booking.upiTransactionId && (
                      <div><strong>Txn:</strong> {booking.upiTransactionId}</div>
                    )}
                    {booking.upiPayerVpa && (
                      <div><strong>VPA:</strong> {booking.upiPayerVpa}</div>
                    )}
                    {!booking.upiReference && !booking.upiTransactionId && (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {booking.paymentStatus === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSetStatus(booking._id, "completed")}
                        className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleSetStatus(booking._id, "failed")}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Mark Failed
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddMovieModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ticketPrice: "",
    screeningDate: "",
    venue: "",
    location: "",
    maxCapacity: "",
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const generateUploadUrl = useMutation(api.movies.generateUploadUrl);

  const addMovie = useMutation(api.movies.addMovie);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let posterImageId: string | undefined = undefined;
      if (posterFile) {
        const url = await generateUploadUrl({});
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": posterFile.type },
          body: await posterFile.arrayBuffer(),
        });
        if (!res.ok) throw new Error("Poster upload failed");
        const json = await res.json();
        posterImageId = json.storageId;
      }
      await addMovie({
        title: formData.title,
        description: formData.description,
        ticketPrice: Number(formData.ticketPrice),
        screeningDate: new Date(formData.screeningDate).getTime(),
        venue: formData.venue,
        location: formData.location,
        maxCapacity: Number(formData.maxCapacity),
        posterImageId: posterImageId as any,
      });
      
      toast.success("Movie added successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to add movie");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Add New Movie</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Movie Title</label>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ticket Price (₹)</label>
              <input 
                type="number"
                value={formData.ticketPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Capacity</label>
              <input 
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Screening Date & Time</label>
            <input 
              type="datetime-local"
              value={formData.screeningDate}
              onChange={(e) => setFormData(prev => ({ ...prev, screeningDate: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Venue</label>
            <input 
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input 
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Poster Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPosterFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Optional. JPG/PNG recommended. Will be shown as the movie poster.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Add Movie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
