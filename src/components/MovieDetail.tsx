import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

interface MovieDetailProps {
  movieId: string;
  onBack: () => void;
}

export function MovieDetail({ movieId, onBack }: MovieDetailProps) {
  const movie = useQuery(api.movies.getMovieById, { movieId: movieId as Id<"movies"> });
  const images = useQuery(api.movies.getMovieImages, { movieId: movieId as Id<"movies"> });
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showBookingForm, setShowBookingForm] = useState(false);

  const createBooking = useMutation(api.bookings.createBooking);
  const createUpiIntent = useAction(api.bookings.createUpiIntent);
  const submitUpiPaymentProof = useAction(api.bookings.submitUpiPaymentProof);

  if (!movie) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleBooking = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error("Please fill in all customer details");
      return;
    }

    try {
      const bookingId = await createBooking({
        movieId: movieId as Id<"movies">,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        numberOfTickets,
        totalAmount: numberOfTickets * movie.ticketPrice,
      });

      const upi = await createUpiIntent({
        bookingId,
        amountInRupees: numberOfTickets * movie.ticketPrice,
        payeeVpa: "tanvishdesai.05@oksbi",
        payeeName: "Compere Tickets",
      });

      // Try opening the UPI deep link
      window.location.href = upi.upiUrl;
      
      // Show prompt to collect transaction ID after redirect back
      setTimeout(async () => {
        const txnId = prompt("Enter UPI transaction/UTR ID after completing payment:") || "";
        if (txnId.trim().length === 0) {
          toast.message("You can submit the UTR later from your bookings list.");
          return;
        }
        try {
          await submitUpiPaymentProof({
            bookingId,
            upiTransactionId: txnId.trim(),
          });
          toast.success("Payment submitted for verification. You'll be notified when confirmed.");
          setShowBookingForm(false);
        } catch (e) {
          toast.error("Failed to record payment info. Please contact support.");
        }
      }, 1500);
      
    } catch (error) {
      toast.error("Failed to start payment");
    }
  };

  const isUpcoming = movie.status === "upcoming";
  const isPastScreening = movie.status === "past";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
      >
        ← Back to Home
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Movie Poster */}
        <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
          {movie.posterUrl ? (
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-6xl">🎬</span>
            </div>
          )}
        </div>

        {/* Movie Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">{movie.description}</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Date:</span>
              <span>{new Date(movie.screeningDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">Venue:</span>
              <span>{movie.venue}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">Location:</span>
              <span>{movie.location}</span>
            </div>
            {isUpcoming && (
              <>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Ticket Price:</span>
                  <span className="text-2xl font-bold text-purple-600">₹{movie.ticketPrice}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Available Tickets:</span>
                  <span className={movie.availableTickets > 0 ? "text-green-600" : "text-red-600"}>
                    {movie.availableTickets} / {movie.maxCapacity}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Booking Section */}
          {isUpcoming && movie.availableTickets > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg">
              {!showBookingForm ? (
                <button 
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Book Tickets
                </button>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-4">Book Your Tickets</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Tickets</label>
                    <select 
                      value={numberOfTickets}
                      onChange={(e) => setNumberOfTickets(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Array.from({ length: Math.min(movie.availableTickets, 5) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input 
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input 
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        ₹{numberOfTickets * movie.ticketPrice}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleBooking}
                      className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isUpcoming && movie.availableTickets === 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
              <p className="text-red-600 font-semibold">Sorry, this screening is sold out!</p>
            </div>
          )}
        </div>
      </div>

      {/* Screening Images for Past Movies */}
      {isPastScreening && images && images.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Screening Gallery</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image._id} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <img 
                  src={image.imageUrl || ""} 
                  alt={image.caption || "Screening photo"}
                  className="w-full h-full object-cover"
                />
                {image.caption && (
                  <p className="p-3 text-sm text-gray-600">{image.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
