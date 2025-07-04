import type { Activity, Proposal, Engagement } from './types';

export const activities: Activity[] = [
  {
    id: '1',
    title: 'Community Garden Initiative',
    type: 'Project',
    description: 'Join us in creating a beautiful community garden. No experience necessary!',
    participation: 75,
    feedbackScore: 4.8,
    image: 'https://placehold.co/600x400.png',
    date: 'Ongoing',
    aiHint: 'community garden'
  },
  {
    id: '2',
    title: 'Summer Tech Fair 2024',
    type: 'Event',
    description: 'Explore the latest in technology with hands-on workshops and demos.',
    attendance: 250,
    feedbackScore: 4.5,
    image: 'https://placehold.co/600x400.png',
    date: 'August 15, 2024',
    aiHint: 'tech fair'
  },
  {
    id: '3',
    title: 'Neighborhood Mural Painting',
    type: 'Project',
    description: 'Help us paint a vibrant mural that reflects our community spirit.',
    participation: 45,
    feedbackScore: 4.9,
    image: 'https://placehold.co/600x400.png',
    date: 'July 20, 2024',
    aiHint: 'mural painting'
  },
  {
    id: '4',
    title: 'Annual Charity Run',
    type: 'Event',
    description: 'Run for a cause! All proceeds go to local shelters.',
    attendance: 500,
    feedbackScore: 4.7,
    image: 'https://placehold.co/600x400.png',
    date: 'September 5, 2024',
    aiHint: 'charity run'
  },
];

export const proposals: Proposal[] = [
  {
    id: 'p1',
    title: 'Weekly Yoga in the Park',
    description: 'A proposal for free weekly yoga sessions to promote health and wellness.',
    goals: 'Improve community health, foster connections.',
    resources: 'Yoga mats, certified instructor.',
    targetAudience: 'All ages and fitness levels.',
    status: 'Approved',
  },
  {
    id: 'p2',
    title: 'Coding Bootcamp for Teens',
    description: 'An intensive coding bootcamp to equip teenagers with valuable tech skills.',
    goals: 'Provide tech education, prepare for future careers.',
    resources: 'Laptops, classroom space, experienced instructors.',
    targetAudience: 'Ages 13-18.',
    status: 'In Progress',
  },
  {
    id: 'p3',
    title: 'Community-wide Book Swap',
    description: 'An event for residents to exchange books and promote reading.',
    goals: 'Encourage reading, build a literary community.',
    resources: 'Collection bins, event space.',
    targetAudience: 'All residents.',
    status: 'Under Review',
  },
  {
    id: 'p4',
    title: 'Senior Companion Program',
    description: 'A program to pair volunteers with seniors for companionship and support.',
    goals: 'Combat loneliness among seniors, foster intergenerational bonds.',
    resources: 'Volunteer coordination, background checks.',
    targetAudience: 'Seniors and volunteers.',
    status: 'Completed',
  },
  {
    id: 'p5',
    title: 'Expand Public Wi-Fi',
    description: 'Proposal to expand free public Wi-Fi to more parks and public spaces.',
    goals: 'Increase digital equity.',
    resources: 'Network hardware, installation services.',
    targetAudience: 'All residents.',
    status: 'Rejected',
  },
];

export const engagements: Engagement[] = [
    {
        id: 'e1',
        title: 'Neighborhood Mural Painting',
        type: 'Project Contribution',
        date: 'July 20, 2024',
        details: 'Contributed 4 hours of painting and design work.'
    },
    {
        id: 'e2',
        title: 'Summer Tech Fair 2024',
        type: 'Event Attendance',
        date: 'August 15, 2024',
        details: 'Attended workshops on AI and Web Development.'
    },
    {
        id: 'e3',
        title: 'Weekly Yoga in the Park',
        type: 'Proposal Submission',
        date: 'June 1, 2024',
        details: 'Submitted the initial proposal which was later approved.'
    },
    {
        id: 'e4',
        title: 'Community Garden Initiative',
        type: 'Project Contribution',
        date: 'Ongoing',
        details: 'Helped with planting and weekly maintenance.'
    }
];
