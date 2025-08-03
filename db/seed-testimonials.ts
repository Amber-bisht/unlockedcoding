import { connectDB } from '../server/config/database';
import { Review, User, Course, Category } from '../server/models';

async function seedTestimonials() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Get some existing users, courses, and categories
    const users = await User.find().limit(5);
    const categories = await Category.find().limit(3);
    const courses = await Course.find().limit(5);

    if (users.length === 0 || categories.length === 0 || courses.length === 0) {
      console.log('Need users, categories, and courses to create testimonials');
      return;
    }

    // Sample testimonials data
    const sampleTestimonials = [
      {
        userId: users[0]._id,
        courseId: courses[0]._id,
        rating: 5,
        comment: "Unlocked Coding transformed my career. I went from knowing nothing about web development to landing a full-stack developer job in just 6 months. The curriculum is comprehensive and the instructors are incredibly supportive."
      },
      {
        userId: users[1]?._id || users[0]._id,
        courseId: courses[1]?._id || courses[0]._id,
        rating: 5,
        comment: "The data science track is excellent. The course material is up-to-date with industry standards, and the hands-on projects helped me build a solid portfolio. I've already started getting interview calls from top companies."
      },
      {
        userId: users[2]?._id || users[0]._id,
        courseId: courses[2]?._id || courses[0]._id,
        rating: 4,
        comment: "I was a complete beginner when I started the mobile development course. The step-by-step approach and project-based learning made it easy to understand complex concepts. Now I'm developing my own apps!"
      },
      {
        userId: users[3]?._id || users[0]._id,
        courseId: courses[3]?._id || courses[0]._id,
        rating: 5,
        comment: "The Python programming course exceeded my expectations. The practical projects and real-world examples made learning so much easier. I've already built several applications and feel confident in my skills."
      },
      {
        userId: users[4]?._id || users[0]._id,
        courseId: courses[4]?._id || courses[0]._id,
        rating: 5,
        comment: "Amazing learning experience! The instructors are knowledgeable and the community is supportive. I learned more in 3 months here than I did in a year of self-study. Highly recommended!"
      },
      {
        userId: users[0]._id,
        courseId: courses[1]?._id || courses[0]._id,
        rating: 4,
        comment: "Great course structure and excellent support from the team. The projects were challenging but achievable, and I learned a lot about modern development practices."
      }
    ];

    // Clear existing testimonials
    await Review.deleteMany({});
    console.log('Cleared existing testimonials');

    // Insert new testimonials
    const createdTestimonials = await Review.insertMany(sampleTestimonials);
    console.log(`Created ${createdTestimonials.length} testimonials`);

    console.log('Testimonials seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exit(1);
  }
}

seedTestimonials(); 