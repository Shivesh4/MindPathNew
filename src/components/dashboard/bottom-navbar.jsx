
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export default function BottomNavbar({ navLinks }) {
    const pathname = usePathname();

    // Tailwind's JIT compiler needs to see the full class name, so we can't construct it dynamically like `grid-cols-${navLinks.length}`.
    // We will use a map to provide the correct class.
    const gridColsMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        // Add more if needed
    };

    const gridColsClass = gridColsMap[navLinks.length] || 'grid-cols-5'; // Default to 5

    return (
        <div className="sm:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
            <div className={cn('grid h-full max-w-lg mx-auto font-medium', gridColsClass)}>
                {navLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'inline-flex flex-col items-center justify-center px-5 hover:bg-muted group transition-all duration-200',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className={cn('text-xs transition-opacity duration-200', !isActive && 'opacity-0 h-0')}>
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
