'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ChatList({ contacts, selectedContact, onSelectContact }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const isLoading = contacts.length === 0;

  return (
    <Card className="h-full w-full flex flex-col border-0 md:border-r rounded-none">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-xl">Messages</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow">
        <ScrollArea className="h-full">
            {isLoading ? (
                 <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-0">
                    {filteredContacts.map((contact) => {
                    // Access the avatar image correctly from the PlaceHolderImages object
                    const avatarImage = contact.avatarId ? PlaceHolderImages[contact.avatarId] : null;
                    return (
                        <button
                        key={contact.id}
                        className={cn(
                            'flex items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50',
                            selectedContact?.id === contact.id && 'bg-muted'
                        )}
                        onClick={() => onSelectContact(contact)}
                        >
                        <Avatar className="h-12 w-12 border">
                            {contact.isAI ? (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                AI
                              </div>
                            ) : (
                              <>
                                {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={contact.name} data-ai-hint={avatarImage.imageHint} />}
                                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                              </>
                            )}
                        </Avatar>
                        <div className="flex-grow overflow-hidden border-b pb-4">
                            <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">{contact.name}</p>
                            <p className={cn("text-xs", "text-muted-foreground")}>
                                {contact.timestamp}
                            </p>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-muted-foreground truncate pr-2">{contact.lastMessage}</p>
                            </div>
                        </div>
                        </button>
                    );
                    })}
                    {filteredContacts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            <p>No contacts found.</p>
                        </div>
                    )}
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}