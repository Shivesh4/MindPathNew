import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const testimonials = [
  {
    name: 'Sarah L.',
    role: 'University Student',
    avatarId: 'testimonial-avatar-1',
    rating: 5,
    review: "MindPath's AI Study Planner is a game-changer! It organized my chaotic schedule and helped me ace my finals. I've never felt more prepared.",
  },
  {
    name: 'David C.',
    role: 'High School Tutor',
    avatarId: 'testimonial-avatar-2',
    rating: 5,
    review: "As a tutor, the platform makes it so easy to connect with students who need my skills. The booking and profile management tools are top-notch.",
  },
  {
    name: 'Jasmine K.',
    role: 'AP Student',
    avatarId: 'testimonial-avatar-3',
    rating: 5,
    review: 'The AI TutorBot helped me understand complex physics problems at 2 AM. It’s like having a personal tutor available 24/7. Highly recommended!',
  },
];

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? 'fill-tertiary text-tertiary' : 'text-muted-foreground/50'}`}
        />
      ))}
    </div>
  );
};

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Loved by Students and Tutors
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Don't just take our word for it. Here's what our users are saying.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => {
            const avatarImage = PlaceHolderImages[testimonial.avatarId];
            return (
              <Card key={testimonial.name} className="flex flex-col">
                <CardContent className="pt-6 flex-grow">
                  <p className="text-muted-foreground">"{testimonial.review}"</p>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4 p-6 bg-muted/50">
                   <StarRating rating={testimonial.rating} />
                  <div className="flex items-center gap-4">
                    <Avatar>
                      {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={testimonial.name} data-ai-hint={avatarImage.imageHint} />}
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
