
export interface Activity {
  id: string;
  title: string;
  type: 'Event' | 'Project';
  description: string;
  attendance?: number;
  participation?: number;
  feedbackScore?: number;
  image: string;
  date: string;
  aiHint: string;
}

export type ProposalEventType = 'Social Event' | 'Service Event' | 'Academic Event' | 'Colloquium';

export interface Proposal {
  id: string;
  title: string;
  eventType: ProposalEventType;
  description: string;
  goals: string;
  resources: string;
  targetAudience: string;
  status: 'Under Review' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';
  submittedBy: string;
  submittedDate: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  joinedDate: string;
  honorsPoints: number;
}

export interface Engagement {
    id:string;
    title: string;
    type: 'Event Attendance' | 'Project Contribution' | 'Proposal Submission';
    date: string;
    details: string;
    points: number;
}
