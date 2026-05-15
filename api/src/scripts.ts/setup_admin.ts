// import prisma from "../services/prisma";

// async function main() {
//   // Create a new user with a post
//   const user = await prisma.user.create({
//     data: { 
//         email: "admin@email.com",    
//         password: "admin123", 
//         name: "Admin User",
//         role: "ADMIN",     
        

//         questions: {

//         }
//     },
//     include: {
//       posts: true,
//     },
//   });
//   console.log("Created user:", user);

//   // Fetch all users with their posts
// //   const allUsers = await prisma.user.findMany({
// //     include: {
// //       posts: true,
// //     },
// //   });
// //   console.log("All users:", JSON.stringify(allUsers, null, 2));
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
