const now = new Date();

export const sessions = [
  {
    id: 1,
    tutorId: 1,
    title: 'Advanced Integration Techniques',
    description: 'A deep dive into integration by parts, trigonometric substitution, and partial fractions. Ideal for students looking to master AP Calculus or college-level Calculus II.',
    dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 0).toISOString(), // 2 days from now at 3 PM
    duration: 60,
    mode: 'online',
    meetingLink: 'https://meet.google.com/xyz-abc-def',
    availableSeats: 5,
    attendees: Array.from({length: 2}, (_, i) => ({ id: i+1, studentId: `user${i+1}` })),
    status: 'upcoming'
  },
  {
    id: 2,
    tutorId: 1,
    title: 'Calculus Fundamentals Workshop',
    description: 'Covering limits, derivatives, and the fundamental theorem of calculus. Perfect for a refresher or for students new to the topic.',
    dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(), // Today at 10 AM
    duration: 60,
    mode: 'offline',
    location: 'Science Center, Room 301',
    availableSeats: 5,
    attendees: Array.from({length: 3}, (_, i) => ({ id: i+3, studentId: `user${i+3}` })),
    status: 'upcoming'
  },
  {
    id: 3,
    tutorId: 1,
    title: 'Thermodynamics Problem Set Review',
    description: 'We will work through common problems involving the laws of thermodynamics, entropy, and heat engines. Bring your questions!',
    dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 14, 0).toISOString(), // 3 days from now at 2 PM
    duration: 60,
    mode: 'offline',
    location: 'Engineering Hall, Study Room A',
    availableSeats: 5,
    attendees: [{ id: 6, studentId: 'user6' }],
    status: 'upcoming'
  },
  {
    id: 4,
    tutorId: 1,
    title: 'Algorithm Design Session: Sorting & Searching',
    description: 'An interactive session on designing and analyzing common sorting and searching algorithms like Merge Sort, Quick Sort, and Binary Search.',
    dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 18, 0).toISOString(), // 5 days from now at 6 PM
    duration: 60,
    mode: 'online',
    meetingLink: 'https://meet.google.com/ghi-jkl-mno',
    availableSeats: 5,
    attendees: Array.from({length: 4}, (_, i) => ({ id: i+7, studentId: `user${i+7}` })),
    status: 'upcoming'
  },
  {
    id: 5,
    tutorId: 1,
    title: 'Data Structures: Trees and Graphs',
    description: 'An in-depth look at tree and graph data structures, including traversal, and common use cases.',
    dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0).toISOString(), // Today at 11 AM
    duration: 60,
    mode: 'online',
    meetingLink: 'https://meet.google.com/pqr-stu-vwx',
    availableSeats: 5,
    attendees: Array.from({length: 2}, (_, i) => ({ id: i+11, studentId: `user${i+11}` })),
    status: 'upcoming'
  },
   {
    id: 6,
    tutorId: 1,
    title: 'Organic Chemistry Mid-term Review',
    description: 'A comprehensive review of nomenclature, stereochemistry, and reaction mechanisms for the upcoming mid-term exam.',
    dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 13, 0).toISOString(), // 2 days ago
    duration: 60,
    mode: 'online',
    meetingLink: 'https://meet.google.com/aaa-bbb-ccc',
    availableSeats: 5,
    attendees: Array.from({length: 22}, (_, i) => ({ id: i+13, studentId: `user${i + 13}` })),
    status: 'completed'
  },
  {
    id: 7,
    tutorId: 1,
    title: 'Essay Writing Workshop',
    description: 'Learn how to structure compelling arguments and refine your prose. This session will focus on thesis development and evidence integration.',
    dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16, 0).toISOString(), // Yesterday
    duration: 60,
    mode: 'offline',
    location: 'Library, Group Study Room 3',
    availableSeats: 5,
    attendees: Array.from({length: 10}, (_, i) => ({ id: i+35, studentId: `user${i + 35}` })),
    status: 'completed'
  },
   {
    id: 8,
    tutorId: 1,
    title: 'Creative Writing Peer Review',
    description: 'Share your work and get constructive feedback from peers in a supportive environment.',
    dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(), // Today
    duration: 60,
    mode: 'online',
    meetingLink: 'https://meet.google.com/ddd-eee-fff',
    availableSeats: 5,
    attendees: Array.from({length: 3}, (_, i) => ({ id: i+45, studentId: `user${i + 45}` })),
    status: 'cancelled'
  }
];