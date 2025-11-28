export const studyPlans = [
    {
        id: 'calculus-ii',
        subject: 'Calculus II',
        focusArea: 'Integration Techniques',
        overallProgress: 0.3,
        weeklyPlans: [
            {
                week: 1,
                title: 'Introduction to Integration',
                tasks: [
                     {
                        id: 'calc-w1-task-1',
                        title: 'Review Integration by Parts',
                        day: 'Monday',
                        completed: false,
                        subTasks: [
                            { id: 'cw1t1-st1', description: 'Watch lecture video', completed: true },
                            { id: 'cw1t1-st2', description: 'Review textbook chapter 5.1', completed: true },
                        ]
                    },
                    {
                        id: 'calc-w1-task-2',
                        title: 'Practice Problems: By Parts',
                        day: 'Tuesday',
                        completed: false,
                         subTasks: [
                            { id: 'cw1t2-st1', description: 'Solve 10 practice problems', completed: true },
                        ]
                    },
                    {
                        id: 'calc-w1-task-3',
                        title: 'Trigonometric Substitution',
                        day: 'Wednesday',
                        completed: false,
                         subTasks: [
                            { id: 'cw1t3-st1', description: 'Understand sin/cos/tan substitutions', completed: true },
                            { id: 'cw1t3-st2', description: 'Work through 5 examples', completed: false },
                        ]
                    },
                     {
                        id: 'calc-w1-task-4',
                        title: 'Quiz Prep',
                        day: 'Friday',
                        completed: false,
                         subTasks: [
                            { id: 'cw1t4-st1', description: 'Take online practice quiz', completed: false },
                            { id: 'cw1t4-st2', description: 'Review incorrect answers', completed: false },
                        ]
                    }
                ]
            },
            {
                week: 2,
                title: 'Advanced Techniques',
                tasks: [
                    {
                        id: 'calc-w2-task-1',
                        title: 'Partial Fraction Decomposition',
                        day: 'Monday',
                        completed: false,
                        subTasks: [
                            { id: 'cw2t1-st1', description: 'Study decomposition rules', completed: false },
                        ]
                    }
                ]
            }
        ],
    },
    {
        id: 'dsa',
        subject: 'Data Structures & Algorithms',
        focusArea: 'Sorting Algorithms',
        overallProgress: 0.5,
        weeklyPlans: [
            {
                week: 1,
                title: 'Foundations & Basic Sorting',
                tasks: [
                    {
                        id: 'dsa-w1-task-1',
                        title: 'Understand Big O Notation',
                        day: 'Monday',
                        completed: false,
                        subTasks: [
                            { id: 'dw1t1-st1', description: 'Read article on Big O', completed: true },
                        ]
                    },
                    {
                        id: 'dsa-w1-task-2',
                        title: 'Implement Bubble Sort',
                        day: 'Tuesday',
                        completed: false,
                        subTasks: [
                            { id: 'dw1t2-st1', description: 'Code Bubble Sort in Python', completed: true },
                            { id: 'dw1t2-st2', description: 'Analyze its time complexity', completed: true },
                        ]
                    },
                    {
                        id: 'dsa-w1-task-3',
                        title: 'Learn Merge Sort',
                        day: 'Thursday',
                        completed: false,
                         subTasks: [
                            { id: 'dw1t3-st1', description: 'Visualize Merge Sort algorithm', completed: false },
                            { id: 'dw1t3-st2', description: 'Implement Merge Sort recursively', completed: false },
                        ]
                    }
                ]
            }
        ],
    },
     {
        id: 'physics-em',
        subject: 'Physics: Electromagnetism',
        focusArea: "Maxwell's Equations",
        overallProgress: 0.2,
        weeklyPlans: [
            {
                week: 1,
                title: 'Fundamental Laws',
                tasks: [
                    {
                        id: 'phy-w1-task-1',
                        title: "Review Gauss's Law",
                        day: 'Tuesday',
                        completed: false,
                        subTasks: [
                            { id: 'pw1t1-st1', description: 'Re-read lecture notes', completed: true },
                            { id: 'pw1t1-st2', description: 'Solve example problems', completed: true },
                        ]
                    },
                    {
                        id: 'phy-w1-task-2',
                        title: "Faraday's Law of Induction",
                        day: 'Thursday',
                        completed: false,
                        subTasks: [
                            { id: 'pw1t2-st1', description: 'Watch video explanation', completed: false },
                            { id: 'pw1t2-st2', description: 'Explain the concept to a friend', completed: false },
                        ]
                    }
                ]
            }
        ],
    },
];