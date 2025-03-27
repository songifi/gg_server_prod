import { AppDataSource } from 'src/database/data-source';
import { User } from '../users/entities/user.entity'; // Adjust the path as needed

async function seedUsers() {
  try {
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);

    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        displayName: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Software developer',
      },
      {
        username: 'jane_doe',
        email: 'jane@example.com',
        password: 'password123',
        displayName: 'Jane Doe',
        avatar: 'https://example.com/avatar2.jpg',
        bio: 'Full-stack developer',
      },
    ];

    for (const user of users) {
      const newUser = userRepository.create(user);
      await userRepository.save(newUser);
    }

    console.log('Seed data inserted successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await AppDataSource.destroy();
    process.exit();
  }
}

seedUsers();
