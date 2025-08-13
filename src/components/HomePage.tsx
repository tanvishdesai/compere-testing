import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface HomePageProps {
  onMovieClick: (movieId: string) => void;
}

export function HomePage({ onMovieClick }: HomePageProps) {
  const upcomingMovies = useQuery(api.movies.getUpcomingMovies) || [];
  const pastMovies = useQuery(api.movies.getPastMovies) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl mb-16">
        <h1 className="text-5xl font-bold mb-6">CineClub Ahmedabad</h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          A passionate film screening community bringing the best of cinema to Ahmedabad. 
          Join us for carefully curated film experiences in our cozy studio setting.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">50+</div>
            <div className="text-purple-200">Films Screened</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">500+</div>
            <div className="text-purple-200">Happy Viewers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">2</div>
            <div className="text-purple-200">Years Running</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">About Our Community</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-600 mb-6">
              We believe in the power of cinema to bring people together, spark conversations, 
              and create lasting memories. Our weekly screenings feature a diverse selection of 
              films from around the world, carefully chosen to inspire and entertain.
            </p>
            <h3 className="text-2xl font-semibold mb-4">The Experience</h3>
            <p className="text-gray-600">
              Our intimate studio setting provides the perfect atmosphere for film appreciation. 
              With comfortable seating, high-quality projection, and a community of fellow film 
              lovers, every screening is a special event.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">What We Offer</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Weekly film screenings
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Curated selection of world cinema
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Intimate studio setting
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Post-screening discussions
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Community of film enthusiasts
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Upcoming Screenings */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Upcoming Screenings</h2>
        {upcomingMovies.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-600">No upcoming screenings scheduled yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMovies.map((movie) => (
              <MovieCard 
                key={movie._id} 
                movie={movie} 
                onClick={() => onMovieClick(movie._id)}
                showPrice={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Screenings */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Past Screenings</h2>
        {pastMovies.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-600">No past screenings to display yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastMovies.map((movie) => (
              <MovieCard 
                key={movie._id} 
                movie={movie} 
                onClick={() => onMovieClick(movie._id)}
                showPrice={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MovieCard({ movie, onClick, showPrice }: {
  movie: any;
  onClick: () => void;
  showPrice: boolean;
}) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-gray-200 relative">
        {movie.posterUrl ? (
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🎬</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{movie.title}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {new Date(movie.screeningDate).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-sm text-gray-600 mb-2">{movie.venue}</p>
        {showPrice && (
          <p className="text-lg font-semibold text-purple-600">₹{movie.ticketPrice}</p>
        )}
      </div>
    </div>
  );
}
