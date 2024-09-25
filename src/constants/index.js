import { meta, shopify, starbucks, tesla } from "../assets/images";
import {
    car,
    contact,
    css,
    estate,
    express,
    git,
    github,
    html,
    javascript,
    linkedin,
    mongodb,
    // motion,
    // mui,
    nextjs,
    nodejs,
    pricewise,
    react,
    // redux,
    // sass,
    paytm,
    summiz,
    tailwindcss,
    threads,
    typescript,
    java,
    cpp,
    python,
    codeforces,
    leetcode,
    moviemania,
    sorting,
    nlogo,
    
} from "../assets/icons";

export const profiles = [
    {
        imageUrl: codeforces,
        name: "CodeForces",
        URL: "https://codeforces.com/profile/HarshBoghani"
    },
    {
        imageUrl:leetcode,
        name: "LeetCode",
        URL: "https://leetcode.com/u/hr_boghani/"
    },
]

export const skills = [
    {
        imageUrl: cpp,
        name: "C++",
        type: "Programming Language",
    },
    {
        imageUrl:python,
        name: "Python",
        type: "Programming Language",
    },
    {
        imageUrl: java,
        name: "Java",
        type: "Programming Language",
    },
    {
        imageUrl: git,
        name: "Git",
        type: "Version Control",
    },
    {
        imageUrl: css,
        name: "CSS",
        type: "Frontend",
    },
    {
        imageUrl: express,
        name: "Express",
        type: "Backend",
    },
    {
        imageUrl: github,
        name: "GitHub",
        type: "Version Control",
    },
    {
        imageUrl: html,
        name: "HTML",
        type: "Frontend",
    },
    {
        imageUrl: javascript,
        name: "JavaScript",
        type: "Frontend",
    },
    {
        imageUrl: mongodb,
        name: "MongoDB",
        type: "Database",
    },
    // {
    //     imageUrl: motion,
    //     name: "Motion",
    //     type: "Animation",
    // },
    // {
    //     imageUrl: mui,
    //     name: "Material-UI",
    //     type: "Frontend",
    // },
    {
        imageUrl: nextjs,
        name: "Next.js",
        type: "Frontend",
    },
    {
        imageUrl: nodejs,
        name: "Node.js",
        type: "Backend",
    },
    {
        imageUrl: react,
        name: "React",
        type: "Frontend",
    },
    // {
    //     imageUrl: redux,
    //     name: "Redux",
    //     type: "State Management",
    // },
    // {
    //     imageUrl: sass,
    //     name: "Sass",
    //     type: "Frontend",
    // },
    {
        imageUrl: tailwindcss,
        name: "Tailwind CSS",
        type: "Frontend",
    },
    {
        imageUrl: typescript,
        name: "TypeScript",
        type: "Frontend",
    }
];

export const experiences = [
    {
        title: "Expert At Codeforces",
        company_name: "Competitive programming",
        icon: codeforces,
        iconBg: "#accbe1",
        // date: "August 2020 - ",
        points: [
            "Started my journey in Competitive programming from August 2022.",
            "1603 rated on Codeforces.",
            "Achieved global rank 489 in a codeforces contest, and 4 times golabal rank under 1500.",
            "Willing to participate in ICPC and compete at global level in near future.",
        ],
    },
    {
        title: "Guardian At LeetCode",
        company_name: "Data Structures And Algorithms",
        icon: leetcode,
        iconBg: "#fbc3bc",
        date: "Jan 2021 - Feb 2022",
        points: [
            "2150 rated on Leetcode",
            "cracked global rank of 500 in a Leetcode contest along with 6 times global rank under 1000.",
        ],
    },
    {
        title: "Web Developer",
        company_name: "MERN stack",
        icon: react,
        iconBg: "#b7e4c7",
        //date: "Jan 2022 - Jan 2023",
        points: [
            "Developing and maintaining web applications using React.js and other related technologies.",
            "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
            "Implementing responsive design and ensuring cross-browser compatibility.",
            "Participating in code reviews and providing constructive feedback to other developers.",
        ],
    },
    // {
    //     title: "Full stack Developer",
    //     company_name: "Meta",
    //     icon: meta,
    //     iconBg: "#a2d2ff",
    //     date: "Jan 2023 - Present",
    //     points: [
    //         "Developing and maintaining web applications using React.js and other related technologies.",
    //         "Collaborating with cross-functional teams including designers, product managers, and other developers to create high-quality products.",
    //         "Implementing responsive design and ensuring cross-browser compatibility.",
    //         "Participating in code reviews and providing constructive feedback to other developers.",
    //     ],
    // },
];

export const socialLinks = [
    {
        name: 'Contact',
        iconUrl: contact,
        link: '/contact',
    },
    {
        name: 'GitHub',
        iconUrl: github,
        link: 'https://github.com/HarshBoghani',
    },
    {
        name: 'LinkedIn',
        iconUrl: linkedin,
        link: 'https://www.linkedin.com/in/harshboghani?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    }
];

export const projects = [
    {
        iconUrl: sorting,
        theme: 'btn-back-red',
        name: 'Sorting Visualizer',
        description: 'Developed a web application that visually demonstrates various sorting algorithms, allowing users to better understand how each algorithm works step by step. The tool includes features such as speed control, step-by-step visualization, and algorithm comparisons.',
        //link: 'https://github.com/adrianhajdin/pricewise',
    },
    // {
    //     iconUrl: threads,
    //     theme: 'btn-back-green',
    //     name: 'Full Stack Threads Clone',
    //     description: 'Created a full-stack replica of the popular discussion platform "Threads," enabling users to post and engage in threaded conversations.',
    //     link: 'https://github.com/adrianhajdin/threads',
    // },
    // {
    //     iconUrl: car,
    //     theme: 'btn-back-blue',
    //     name: 'Car Finding App',
    //     description: 'Designed and built a mobile app for finding and comparing cars on the market, streamlining the car-buying process.',
    //     link: 'https://github.com/adrianhajdin/project_next13_car_showcase',
    // },
    {
        iconUrl: moviemania,
        theme: 'btn-back-pink',
        name: 'Movie-mania',
        description: 'Built a web application where users can explore and search for movies, view detailed information, and create watchlists. The platform includes features like movie ratings, reviews, and trailers.',
        link: 'https://movie-mania-puce-omega.vercel.app/',
    },
    {
        iconUrl: nlogo,
        theme: 'btn-back-blue',
        name: 'Portfolio',
        description: 'Created a personal portfolio website to showcase professional skills, projects, and experiences. The site includes sections for a biography, resume, and a detailed overview of completed projects, making it easy for potential employers or clients to connect and learn more about the developer.',
        link: 'https://github.com/adrianhajdin/projects_realestate',
    }
    // {
    //     iconUrl: summiz,
    //     theme: 'btn-back-yellow',
    //     name: 'AI Summarizer Application',
    //     description: 'App that leverages AI to automatically generate concise & informative summaries from lengthy text content, or blogs.',
    //     link: 'https://github.com/adrianhajdin/project_ai_summarizer',
    // }
];