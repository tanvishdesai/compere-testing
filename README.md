# Compere - Film Screening Community

A modern web application for managing a film screening community in Ahmedabad. Built with Next.js, Convex, and Shadcn UI.

## Features

- **Beautiful Homepage**: Showcases the community with hero section, about section, and screening listings
- **Movie Management**: Add, edit, and manage movies with details like director, year, genre, etc.
- **Screening Management**: Schedule upcoming screenings and view past screenings
- **Booking System**: Complete booking flow with customer information collection
- **UPI Payment Integration**: Direct UPI payment integration using deep links
- **Admin Dashboard**: Comprehensive admin panel for managing all aspects of the community
- **Photo Gallery**: Add and view photos from past screenings
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Shadcn UI, Tailwind CSS
- **Backend**: Convex (Database + Backend Functions)
- **Database**: Convex (Built on PostgreSQL)
- **Payment**: UPI Deep Links (easily extensible to Razorpay)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner (Toast notifications)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Convex account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd compere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev --once
   ```
   This will:
   - Create a new Convex project
   - Set up your database
   - Generate API keys
   - Create `.env.local` file with your configuration

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

The following environment variables will be automatically created by Convex:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_deployment_name
```

## Usage

### For Community Members

1. **Browse Screenings**: Visit the homepage to see upcoming and past screenings
2. **Book Tickets**: Click on any upcoming screening to view details and book tickets
3. **Payment**: Complete payment using any UPI app (Google Pay, PhonePe, Paytm, etc.)
4. **View Photos**: Check out photos from past screenings

### For Admins

1. **Access Admin Panel**: Navigate to `/admin`
2. **Add Movies**: Use the "Add Movie" button to add new movies to your collection
3. **Schedule Screenings**: Create new screenings with date, time, venue, and pricing
4. **Manage Bookings**: View booking status and participant lists
5. **Add Photos**: Upload photos from past screenings

## Payment Integration

The app currently uses UPI deep links for payment, which:

- ✅ Requires no API keys or complex setup
- ✅ Works with all major UPI apps (Google Pay, PhonePe, Paytm, BHIM)
- ✅ Opens the user's preferred UPI app automatically
- ✅ Supports custom UPI IDs

### To integrate Razorpay later:

1. Sign up for a Razorpay account
2. Get your API keys
3. Replace the UPI deep link logic in `PaymentHandler.tsx` with Razorpay SDK
4. Add webhook handling for payment verification

## Database Schema

The app uses Convex with the following main tables:

- **movies**: Movie information (title, description, director, etc.)
- **screenings**: Screening details (date, time, venue, pricing)
- **bookings**: Customer bookings and payment status
- **movieImages**: Photos from past screenings

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from your `.env.local`
   - Deploy

3. **Deploy Convex**
   ```bash
   npx convex deploy
   ```

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`

## Customization

### Changing UPI ID

Update the UPI ID in `components/BookingForm.tsx`:

```typescript
upiId="your-upi-id@bank"
```

### Styling

The app uses Tailwind CSS with a purple theme. You can customize colors in:
- `app/globals.css` - CSS variables
- `tailwind.config.js` - Tailwind configuration

### Adding New Features

The modular structure makes it easy to add new features:

1. **New Pages**: Add to `app/` directory
2. **New Components**: Add to `components/` directory  
3. **New API Functions**: Add to `convex/` directory
4. **Database Changes**: Update `convex/schema.ts`

## Troubleshooting

### Common Issues

1. **Convex not connecting**
   - Check your `.env.local` file
   - Ensure `npx convex dev` is running
   - Verify your Convex project is active

2. **Payment not working**
   - Ensure you have a UPI app installed
   - Check if the UPI ID is correct
   - Try the manual verification button

3. **Build errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `npm install`
   - Check TypeScript errors: `npm run build`

4. **"No address provided to ConvexReactClient" error during build**
   - This is a known issue with static generation and Convex
   - The app has been configured to handle this gracefully
   - Ensure `NEXT_PUBLIC_CONVEX_URL` is set in your environment variables
   - For production deployment, make sure the environment variable is set in your hosting platform

### Getting Help

- Check the [Convex documentation](https://docs.convex.dev/)
- Review [Next.js documentation](https://nextjs.org/docs)
- Check [Shadcn UI documentation](https://ui.shadcn.com/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Built with ❤️ for the Ahmedabad film community**
