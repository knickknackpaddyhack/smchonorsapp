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

export interface Proposal {
  id: string;
  title: string;
  description: string;
  goals: string;
  resources: string;
  targetAudience: string;
  status: 'Under Review' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';
  submittedBy: string;
  submittedDate: string;
}

export interface Engagement {
    id: string;
    title: string;
    type: 'Event Attendance' | 'Project Contribution' | 'Proposal Submission';
    date: string;
    details: string;
}
