'use client';

import { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Calendar, CheckSquare, FileText, Pencil, Loader2, Star } from 'lucide-react';
import type { Engagement, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, updateUserProfile, getUserEngagements } from '@/services/user';

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

const benchmarks = [
    { name: 'Bronze', points: 100, color: 'text-amber-700' },
    { name: 'Silver', points: 250, color: 'text-slate-500' },
    { name: 'Gold', points: 500, color: 'text-amber-500' },
    { name: 'Platinum', points: 1000, color: 'text-cyan-500' },
];

export default function ProfilePage() {
    const { toast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempEmail, setTempEmail] = useState('');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [profileData, engagementsData] = await Promise.all([
                getUserProfile(),
                getUserEngagements()
            ]);
            setProfile(profileData);
            setEngagements(engagementsData);
            if (profileData) {
                setTempName(profileData.name);
                setTempEmail(profileData.email);
            }
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleEdit = () => {
        if (profile) {
            setTempName(profile.name);
            setTempEmail(profile.email);
            setIsEditing(true);
        }
    }

    const handleSave = async () => {
        if (!profile) return;
        
        try {
            await updateUserProfile({ name: tempName, email: tempEmail });
            setProfile(prev => prev ? { ...prev, name: tempName, email: tempEmail } : null);
            setIsEditing(false);
            toast({
                title: "Profile updated successfully!",
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "Could not save profile changes. Please try again.",
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    }
    
    const { currentLevel, nextBenchmark, progressPercentage } = useMemo(() => {
        const currentPoints = profile?.honorsPoints || 0;
        let currentLevel = { name: 'Beginner', points: 0, color: '' };
        let nextBenchmark = benchmarks[0];

        for (let i = benchmarks.length - 1; i >= 0; i--) {
            if (currentPoints >= benchmarks[i].points) {
                currentLevel = benchmarks[i];
                nextBenchmark = benchmarks[i+1] || { name: 'Max Level', points: currentLevel.points, color: '' };
                break;
            }
        }
        if (currentPoints < benchmarks[0].points) {
            nextBenchmark = benchmarks[0];
        }
        
        const pointsForNextLevel = nextBenchmark.points - currentLevel.points;
        const progressTowardsNextLevel = currentPoints - currentLevel.points;
        const progressPercentage = pointsForNextLevel > 0 ? (progressTowardsNextLevel / pointsForNextLevel) * 100 : 100;

        return { currentLevel, nextBenchmark, progressPercentage };
    }, [profile?.honorsPoints]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-6 w-64" />
                            </div>
                        </div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-5 w-56" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!profile) {
        return <p>Could not load profile. Please try again later.</p>
    }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`https://placehold.co/80x80.png`} alt={profile.name} data-ai-hint="person face" />
                            <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                                    <h2 className="text-2xl font-bold font-headline">{profile.name}</h2>
                                    <p className="text-muted-foreground">{profile.email}</p>
                                </>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">Joined on {profile.joinedDate}</p>
                        </div>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button onClick={handleSave}>Save</Button>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="icon" onClick={handleEdit}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit Profile</span>
                        </Button>
                    )}
                </div>
            </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Honors Progress</CardTitle>
                <CardDescription>Earn points by participating in community activities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center font-semibold">
                    <div className="flex items-center gap-2">
                        <Star className={`h-6 w-6 ${currentLevel.color || 'text-muted-foreground'}`} />
                        <span className="text-lg">{profile.honorsPoints.toLocaleString()} Honors Points</span>
                    </div>
                    {currentLevel.name !== 'Beginner' && <span className={`text-lg ${currentLevel.color}`}>{currentLevel.name} Tier</span>}
                </div>
                <div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>{currentLevel.name} ({currentLevel.points} pts)</span>
                    {nextBenchmark.name !== 'Max Level' ? (
                       <span>Next: {nextBenchmark.name} ({nextBenchmark.points} pts)</span>
                    ) : (
                        <span>Max Level Reached!</span>
                    )}
                  </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Engagement History</CardTitle>
                <CardDescription>A record of your participation and contributions.</CardDescription>
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
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-semibold">{engagement.title}</p>
                                        <p className="text-sm text-muted-foreground">{engagement.type}</p>
                                      </div>
                                      <div className="text-sm font-bold text-primary text-right">
                                        +{engagement.points} pts
                                      </div>
                                    </div>
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
