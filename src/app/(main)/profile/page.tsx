'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { engagements } from '@/lib/data';
import { Award, Calendar, CheckSquare, FileText, Pencil } from 'lucide-react';
import type { Engagement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

function getIconForEngagement(type: Engagement['type']) {
    switch (type) {
        case 'Event Attendance':
            return <CheckSquare className="h-5 w-5 text-primary" />;
        case 'Project Contribution':
            return <Award className="h-5 w-5 text-primary" />;
        case 'Proposal Submission':
            return <FileText className="h-5 w-5 text-primary" />;
    }
}

export default function ProfilePage() {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('Community Member');
    const [email, setEmail] = useState('member@email.com');
    const [tempName, setTempName] = useState(name);
    const [tempEmail, setTempEmail] = useState(email);

    const handleSave = () => {
        setName(tempName);
        setEmail(tempEmail);
        setIsEditing(false);
        toast({
            title: "Profile updated successfully!",
        });
    };

    const handleCancel = () => {
        setTempName(name);
        setTempEmail(email);
        setIsEditing(false);
    }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="https://placehold.co/80x80.png" alt={name} data-ai-hint="person face" />
                            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left">
                            {isEditing ? (
                                <div className="space-y-2">
                                    <Input 
                                        id="name"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="text-2xl font-bold font-headline"
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={tempEmail}
                                        onChange={(e) => setTempEmail(e.target.value)}
                                        className="text-muted-foreground"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold font-headline">{name}</h2>
                                    <p className="text-muted-foreground">{email}</p>
                                </>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">Joined on January 1, 2023</p>
                        </div>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button onClick={handleSave}>Save</Button>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit Profile</span>
                        </Button>
                    )}
                </div>
            </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Engagement History</CardTitle>
                <CardDescription>A record of your participation and contributions to the community.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {engagements.map((engagement, index) => (
                        <li key={engagement.id}>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary flex-shrink-0">
                                        {getIconForEngagement(engagement.type)}
                                    </div>
                                    {index < engagements.length - 1 && (
                                      <div className="w-px flex-1 bg-border my-2"></div>
                                    )}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="font-semibold">{engagement.title}</p>
                                    <p className="text-sm text-muted-foreground">{engagement.type}</p>
                                    <p className="text-sm mt-1">{engagement.details}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{engagement.date}</span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}
