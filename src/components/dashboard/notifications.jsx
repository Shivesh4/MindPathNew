import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Megaphone, BellRing } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Button } from "../ui/button";

const sessions = [
    {
        title: "Calculus Tutoring",
        tutor: "with Sarah Williams",
        location: "NH 100",
        time: "Sep 16th, 3:00 PM - 5:00 PM",
        borderColor: "border-purple-500",
    },
    {
        title: "Thermodynamics Tutoring",
        tutor: "with Emma Rodriguez",
        location: "NH 101",
        time: "Sep 17th, 10:00 AM - 12:00 PM",
        borderColor: "border-green-500",
    },
    {
        title: "Data Structures Tutoring",
        tutor: "with Michael Chen",
        location: "NH 101",
        time: "Sep 19th, 2:00 PM - 3:00 PM",
        borderColor: "border-pink-500",
    },
];

const announcements = [
    {
        subject: "Algebra",
        category: "Mathematics",
        details: "Chris John has created session from Sep 16th to Sep 20th",
        borderColor: "border-purple-500"
    },
    {
        subject: "Quantum Mechanics",
        category: "Physics",
        details: "Emma Rodriguez has created sessions from Sep 17th to Sep 20th",
        borderColor: "border-green-500"
    },
];

export default function Notifications() {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                 <Button variant="link" asChild>
                    <Link href="/dashboard/notifications">View All</Link>
                </Button>
            </CardHeader>
            <CardContent>
                    <Tabs defaultValue="sessions">
                    <TabsList className="w-full">
                        <TabsTrigger value="sessions" className="w-full">
                             <Calendar className="h-5 w-5 sm:hidden" />
                             <span className="hidden sm:inline">Upcoming Sessions</span>
                        </TabsTrigger>
                        <TabsTrigger value="announcements" className="w-full">
                            <Megaphone className="h-5 w-5 sm:hidden" />
                            <span className="hidden sm:inline">Announcements</span>
                        </TabsTrigger>
                    </TabsList>
                    <ScrollArea className="h-96">
                        <TabsContent value="sessions">
                            <div className="space-y-6 pt-6">
                                {sessions.map((session, index) => (
                                    <div key={index} className={`flex gap-4 border-l-4 ${session.borderColor} pl-4`}>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{session.title}</p>
                                            <p className="text-sm text-muted-foreground">{session.tutor}</p>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground mt-2">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{session.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{session.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="announcements">
                           <div className="space-y-6 pt-6">
                                {announcements.length > 0 ? announcements.map((item, index) => (
                                    <div key={index} className={`flex gap-4 border-l-4 ${item.borderColor} pl-4`}>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold">{item.subject}</p>
                                                <Badge variant="secondary">{item.category}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.details}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <BellRing className="w-8 h-8 mx-auto mb-2" />
                                        <p>No new announcements.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </CardContent>
        </Card>
    );
}
