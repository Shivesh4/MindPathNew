'use client';

import * as React from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ChatList } from './chat-list';
import { ChatMessages } from './chat-messages';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatLayout({ defaultLayout = [320, 1080], navCollapsedSize, contacts, initialContactId }) {
  const isMobile = useIsMobile();
  const [selectedContact, setSelectedContact] = React.useState(null);
  const [isChatVisible, setIsChatVisible] = React.useState(!isMobile);
  
  React.useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      if (initialContactId) {
        const initial = contacts.find((c) => c.id === initialContactId) ?? contacts[0];
        setSelectedContact(initial);
      } else {
        setSelectedContact(contacts[0]);
      }
    }
  }, [contacts, selectedContact, initialContactId]);

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    if (isMobile) {
      setIsChatVisible(true);
    }
  };

  const handleBack = () => {
    setIsChatVisible(false);
    setSelectedContact(null);
  }

  if (isMobile) {
    return (
        <div className="h-full w-full">
            <div className={cn("transition-transform duration-300", isChatVisible ? 'hidden' : 'block w-full h-full')}>
                <ChatList
                    contacts={contacts}
                    selectedContact={selectedContact}
                    onSelectContact={handleContactSelect}
                />
            </div>
             <div className={cn("transition-transform duration-300", isChatVisible ? 'block w-full h-full' : 'hidden')}>
                {selectedContact ? (
                    <ChatMessages
                        contact={selectedContact}
                        onBack={handleBack}
                    />
                ) : (
                    <div className="flex flex-col h-full items-center justify-center">
                        <p>Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full max-h-screen items-stretch"
    >
      <ResizablePanel defaultSize={defaultLayout[0]} minSize={20} maxSize={30}>
        <ChatList
          contacts={contacts}
          selectedContact={selectedContact}
          onSelectContact={handleContactSelect}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]}>
        {selectedContact ? (
          <ChatMessages
            contact={selectedContact}
            onBack={handleBack}
          />
        ) : (
           <div className="p-4 flex flex-col h-full items-center justify-center text-muted-foreground">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="m12 19 7-7 3 3-7 7-3-3z"/>
                            <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                            <path d="m2 2 7.586 7.586"/>
                            <circle cx="11" cy="11" r="2"/>
                            <path d="m13 13 6 6"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Welcome to MindPath Messages</h3>
                    <p className="mb-4">Select a contact or the AI assistant to start chatting.</p>
                </div>
           </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}